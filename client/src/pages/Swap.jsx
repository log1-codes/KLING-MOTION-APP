import React, { useState, useEffect } from 'react';

function Swap() {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState('');

  const API_URL =  'http://localhost:3000';

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      addLog(`Image selected: ${e.target.files[0].name}`);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
      addLog(`Video selected: ${e.target.files[0].name}`);
    }
  };

  const listenForUpdates = (requestId) => {
    addLog(`Connecting to event stream for request: ${requestId}`);
    const eventSource = new EventSource(`${API_URL}/api/events/${requestId}`);
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    eventSource.onopen = () => {
      addLog('Connected to update stream');
      reconnectAttempts = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("SSE Event received:", data);

        if (data.status === 'CONNECTED') {
          setProgress('⏳ Connected, waiting for processing...');
          return;
        }

        if (data.state === 'COMPLETED') {
          setProgress('✅ Generation complete!');
          addLog(' Video generated successfully!');

          if (data.video && data.video.url) {
            addLog(`Video URL received: ${data.video.url}`);
            setResult(data.video.url);
          } else {
            addLog(' Warning: Video URL not found in response');
            console.error('Complete response data:', data);
          }
          
          eventSource.close();
          setLoading(false);
        } else if (data.state === 'FAILED' || data.state === 'ERROR') {
          const errorMsg = data.error || 'Generation failed';
          addLog(` Error: ${errorMsg}`);
          setProgress(' Generation failed');
          eventSource.close();
          setLoading(false);
        } else if (data.state === 'IN_PROGRESS' || data.state === 'QUEUED') {
          const statusMsg = data.state === 'IN_PROGRESS' ? 'Processing' : 'Queued';
          setProgress(`⏳ ${statusMsg}...`);
          addLog(`Status update: ${data.state}`);
        } else {
          // Handle any other state
          addLog(`Status: ${data.state || 'Unknown'}`);
        }

      } catch (error) {
        console.error("Error parsing SSE data:", error);
        addLog(`Error parsing server response: ${error.message}`);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        addLog(`Connection lost. Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})...`);
      } else {
        addLog(' Connection to updates lost. Please check your server.');
        eventSource.close();
        setLoading(false);
        setProgress(' Connection lost');
      }
    };

    // Cleanup function
    return () => {
      eventSource.close();
    };
  };

  const generateVideo = async () => {
    if (!image || !video) {
      alert("Please upload both an image and a video.");
      return;
    }

    setLoading(true);
    setLogs([]);
    setResult(null);
    setProgress('');

    const formData = new FormData();
    formData.append('image', image);
    formData.append('video', video);

    try {
      setProgress(' Uploading files...');
      addLog('Starting file upload...');

      const uploadResponse = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || `Upload failed with status: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      const { image_url, video_url } = uploadData;

      if (!image_url || !video_url) {
        throw new Error('Failed to get storage URLs from upload');
      }

      addLog(` Files uploaded successfully`);
      addLog(`Image URL: ${image_url.substring(0, 50)}...`);
      addLog(`Video URL: ${video_url.substring(0, 50)}...`);

      setProgress(' Submitting to generation queue...');
      addLog('Submitting generation job...');

      const queueResponse = await fetch(`${API_URL}/api/generate-from-urls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url,
          video_url,
          prompt: prompt.trim(),
          character_orientation: 'video'
        }),
      });

      if (!queueResponse.ok) {
        const errorData = await queueResponse.json();
        throw new Error(errorData.error || `Queue submission failed`);
      }

      const queueData = await queueResponse.json();
      console.log("Queue response:", queueData);

      if (!queueData.request_id) {
        throw new Error('No request_id received from server');
      }

      addLog(`✅ Job queued with ID: ${queueData.request_id}`);

      listenForUpdates(queueData.request_id);

    } catch (error) {
      console.error("Generation error:", error);
      addLog(` Error: ${error.message}`);
      setProgress(' Failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Kling Motion Control
          </h1>
          <p className="mt-4 text-gray-400 text-lg">
            Transfer movements from a video to any character image.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Image Upload */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:border-purple-500 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">1. Reference Image</h2>
            <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-750 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              {image ? (
                <div className="text-center">
                  <p className="text-green-400 font-medium truncate max-w-xs">{image.name}</p>
                  <img src={URL.createObjectURL(image)} alt="Preview" className="mt-4 max-h-48 rounded shadow-md mx-auto" />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  <p>Click or drag to upload image</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:border-pink-500 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-pink-300">2. Reference Video</h2>
            <div className="relative border-2 border-dashed border-gray-600 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-750 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              {video ? (
                <div className="text-center">
                  <p className="text-green-400 font-medium truncate max-w-xs">{video.name}</p>
                  <video src={URL.createObjectURL(video)} className="mt-4 max-h-48 rounded shadow-md mx-auto" controls />
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  <p>Click or drag to upload video</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="mb-8">
          <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg hover:border-blue-500 transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">3. Text Prompt (Optional)</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want the character to move or any specific details..."
              className="w-full bg-gray-900 text-white border border-gray-600 rounded-lg p-4 focus:outline-none focus:border-blue-500 h-32 resize-none"
              disabled={loading}
            />
          </div>
        </div>

        <div className="text-center mb-12">
          <button
            onClick={generateVideo}
            disabled={loading || !image || !video}
            className={`px-10 py-4 rounded-full text-xl font-bold text-white shadow-lg transform transition-all 
                ${loading || !image || !video
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 hover:scale-105 hover:shadow-purple-500/50'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Generating Magic...
              </span>
            ) : 'Generate Video'}
          </button>

          {progress && (
            <p className="mt-4 text-lg text-purple-300 font-medium">{progress}</p>
          )}
        </div>

        {/* Results Section */}
        {(result || logs.length > 0) && (
          <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 shadow-inner">
            {result && (
              <div className="mb-8 text-center animate-fade-in">
                <h2 className="text-2xl font-bold mb-4 text-white">✨ Result</h2>
                <div className="relative inline-block rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                  <video src={result} controls autoPlay loop className="max-h-[600px] w-auto" />
                </div>
                <div className="mt-4">
                  <a 
                    href={result} 
                    download 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all"
                  >
                     Download Video
                  </a>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Process Logs:</h3>
                <div className="bg-black p-4 rounded text-sm font-mono text-green-500 h-48 overflow-y-auto border border-gray-800">
                  {logs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default Swap;