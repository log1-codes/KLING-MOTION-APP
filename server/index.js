const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { fal } = require('@fal-ai/client');
require('dotenv').config();


if (process.env.FAL_KEY) {
    fal.config({
        credentials: process.env.FAL_KEY,
    });
}

const app = express();
const port = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/generate', upload.fields([{ name: 'image' }, { name: 'video' }]), async (req, res) => {
    try {
        if (!process.env.FAL_KEY) {
            return res.status(500).json({ error: 'FAL_KEY not configured on server' });
        }
        if (!req.files || !req.files.image || !req.files.video) {
            return res.status(400).json({ error: 'Both image and video files are required' });
        }

        const imageFile = req.files.image[0];
        const videoFile = req.files.video[0];

        console.log('Uploading image...');
        const imageFileObj = new File([imageFile.buffer], imageFile.originalname, { 
            type: imageFile.mimetype || 'image/jpeg' 
        });
        const imageUrl = await fal.storage.upload(imageFileObj);
        console.log('Image uploaded:', imageUrl);

        console.log('Uploading video...');
        const videoFileObj = new File([videoFile.buffer], videoFile.originalname, { 
            type: videoFile.mimetype || 'video/mp4' 
        });
        const videoUrl = await fal.storage.upload(videoFileObj);
        console.log('Video uploaded:', videoUrl);

        console.log('Submitting request to fal.ai...');
        const result = await fal.subscribe("fal-ai/kling-video/v2.6/standard/motion-control", {
            input: {
                image_url: imageUrl,
                video_url: videoUrl,
                character_orientation: "video" 
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        res.json(result);

    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: error.message || 'Failed to generate video' });
    }
});

app.post('/api/generate-from-urls', async (req, res) => {
    try {
        if (!process.env.FAL_KEY) {
            return res.status(500).json({ error: 'FAL_KEY not configured on server' });
        }
        
        const { image_url, video_url, character_orientation } = req.body;
        
        if (!image_url || !video_url) {
            return res.status(400).json({ error: 'Both image_url and video_url are required' });
        }

        console.log('Submitting request to fal.ai with URLs...');
        const result = await fal.subscribe("fal-ai/kling-video/v2.6/standard/motion-control", {
            input: {
                image_url: image_url,
                video_url: video_url,
                character_orientation: character_orientation || "video" 
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs.map((log) => log.message).forEach(console.log);
                }
            },
        });

        res.json(result);

    } catch (error) {
        console.error('Error generating video:', error);
        res.status(500).json({ error: error.message || 'Failed to generate video' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
