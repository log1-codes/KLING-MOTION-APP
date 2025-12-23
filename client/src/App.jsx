import React, { useState } from 'react';

function App() {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState('');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setVideo(e.target.files[0]);
    }
  };

  const pollJobStatus = async (requestId) => {
    const maxAttempts = 120;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`http://localhost:3000/api/job-status/${requestId}`);
        const data = await response.json();

        console.log("Poll response:", data);

        if (data.state === 'COMPLETED') {
          setProgress(' Generation complete!');
          setLogs(prev => [...prev, 'Video generated successfully!']);

          if (data.video && data.video.url) {
            setResult(data.video.url);
            return true;
          } else {
            setLogs(prev => [...prev, 'Warning: Video URL not found in response']);
            return false;
          }
        }

        if (data.state === 'FAILED') {
          setLogs(prev => [...prev, `Error: ${data.error || 'Generation failed'}`]);
          return false;
        }

        setProgress(`⏳ Processing... (${data.state || 'IN_PROGRESS'})`);

        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;

      } catch (error) {
        console.error("Polling error:", error);
        setLogs(prev => [...prev, `Polling error: ${error.message}`]);
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
    }

    setLogs(prev => [...prev, 'Timeout: Generation took too long']);
    return false;
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
      setProgress('📤 Uploading files...');
      setLogs(prev => [...prev, 'Uploading image and video...']);

      const uploadResponse = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || `Upload failed with status: ${uploadResponse.status}`);
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload response:", uploadData);

      const { image_url, video_url } = uploadData;

      if (!image_url || !video_url) {
        throw new Error('Failed to get storage URLs from upload');
      }

      setProgress('🚀 Submitting to generation queue...');
      setLogs(prev => [...prev, 'Files uploaded, submitting generation job...']);

      const queueResponse = await fetch('http://localhost:3000/api/generate-from-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url,
          video_url,
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

      setLogs(prev => [...prev, `Job queued with ID: ${queueData.request_id}`]);

      setProgress('⏳ Generating video...');
      await pollJobStatus(queueData.request_id);

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.message || 'Unknown error occurred';
      setLogs(prev => [...prev, `Error: ${errorMessage}`]);
      setProgress('');
    } finally {
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

        <div className="text-center mb-12">
          <button
            onClick={generateVideo}
            disabled={loading}
            className={`px-10 py-4 rounded-full text-xl font-bold text-white shadow-lg transform transition-all 
                ${loading
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
                <h2 className="text-2xl font-bold mb-4 text-white">Result</h2>
                <div className="relative inline-block rounded-xl overflow-hidden shadow-2xl border border-gray-700">
                  <video src={result} controls autoPlay loop className="max-h-[600px] w-auto" />
                </div>
                <div className="mt-4">
                  <a href={result} download className="text-purple-400 hover:text-purple-300 underline">Download Video</a>
                </div>
              </div>
            )}

            {logs.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-gray-500 text-sm uppercase tracking-wider font-semibold">Logs:</h3>
                <div className="bg-black p-4 rounded text-sm font-mono text-green-500 h-48 overflow-y-auto border border-gray-800">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
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

export default App;