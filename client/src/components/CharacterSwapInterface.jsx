import React, { useState, useRef } from 'react';
import { Play, Image as ImageIcon, Sparkles } from 'lucide-react';

const CharacterSwap = () => {
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState('');

  const videoInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const API_URL = 'http://localhost:3000';

  const addLog = () => {};

  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      addLog(`Image selected: ${e.target.files[0].name}`);
    }
  };

  const handleVideoChange = (e) => {
    if (e.target.files?.[0]) {
      setVideo(e.target.files[0]);
      addLog(`Video selected: ${e.target.files[0].name}`);
    }
  };

  const listenForUpdates = (requestId) => {
    const eventSource = new EventSource(`${API_URL}/api/events/${requestId}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.state === 'COMPLETED') {
        setProgress('Generation complete');
        if (data.video?.url) setResult(data.video.url);
        setLoading(false);
        eventSource.close();
      }

      if (data.state === 'FAILED' || data.state === 'ERROR') {
        setProgress('Failed');
        setLoading(false);
        eventSource.close();
      }

      if (data.state === 'IN_PROGRESS' || data.state === 'QUEUED') {
        setProgress(` ${data.state}`);
      }
    };

    eventSource.onerror = () => {
      setLoading(false);
      eventSource.close();
    };
  };

  const generateVideo = async () => {
    if (!image || !video) {
      alert('Upload both image and video');
      return;
    }

    setLoading(true);
    setResult(null);
    setProgress('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('video', video);

      setProgress(' Uploading files...');

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const { image_url, video_url } = await uploadRes.json();

      setProgress(' Submitting job...');

      const queueRes = await fetch(`${API_URL}/api/generate-from-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url,
          video_url,
          prompt,
          character_orientation: 'video'
        })
      });

      const queueData = await queueRes.json();
      listenForUpdates(queueData.request_id);

    } catch (err) {
      setLoading(false);
      setProgress('Failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-stretch">

        {/* LEFT */}
        <div className="flex flex-col flex-1 space-y-8">

          <div>
            <h1 className="text-4xl font-bold">SWAP CHARACTERS IN ANY VIDEO</h1>
            <p className="text-gray-400 mt-2 max-w-xl">
              Effortlessly replace characters in any video.
            </p>
          </div>

          {/* Upload Section (fills height) */}
          <div className="flex gap-4 flex-1">

            {/* VIDEO */}
            <div
              onClick={() => videoInputRef.current.click()}
              className="flex-1 h-full border-dashed border-2 border-gray-800 rounded-3xl 
                         p-6 bg-[#161616] cursor-pointer text-center
                         flex flex-col justify-center"
            >
              <Play className="mx-auto mb-2 text-gray-400" />
              <p>{video ? video.name : 'Your Video'}</p>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={handleVideoChange}
                disabled={loading}
              />
            </div>

            {/* IMAGE */}
            <div
              onClick={() => imageInputRef.current.click()}
              className="flex-1 h-full border-dashed border-2 border-gray-800 rounded-3xl 
                         p-6 bg-[#161616] cursor-pointer text-center
                         flex flex-col justify-center"
            >
              <ImageIcon className="mx-auto mb-2 text-gray-400" />
              <p>{image ? image.name : 'Character Image'}</p>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
                disabled={loading}
              />
            </div>

          </div>

          <button
            onClick={generateVideo}
            disabled={loading}
            className="w-full bg-[#eaff33] text-black py-4 rounded-xl 
                       font-bold flex items-center justify-center gap-2"
          >
            <Sparkles />
            {loading ? 'Generating...' : 'Generate Video'}
          </button>

          {progress && <p className="text-sm text-gray-400">{progress}</p>}
        </div>

        {/* RIGHT PREVIEW */}
        <div className="flex-1 bg-[#121212] rounded-[40px] p-8 
                        flex flex-col items-center justify-center 
                        border border-gray-800">
          <div className="w-full max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden">
            {result ? (
              <video
                src={result}
                controls
                autoPlay
                loop
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/api/placeholder/320/570"
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CharacterSwap;
