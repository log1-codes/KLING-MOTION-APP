const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { fal } = require('@fal-ai/client');
require('dotenv').config();


if (!process.env.FAL_KEY) {
    console.warn('⚠️  FAL_KEY not set in environment');
} else {
    fal.config({
        credentials: process.env.FAL_KEY,
    });
}


const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage });


app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});


app.post(
    '/api/upload',
    upload.fields([{ name: 'image' }, { name: 'video' }]),
    async (req, res) => {
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
                type: imageFile.mimetype || 'image/jpeg',
            });
            const imageUrl = await fal.storage.upload(imageFileObj);

            console.log('Uploading video...');
            const videoFileObj = new File([videoFile.buffer], videoFile.originalname, {
                type: videoFile.mimetype || 'video/mp4',
            });
            const videoUrl = await fal.storage.upload(videoFileObj);

            res.json({
                image_url: imageUrl,
                video_url: videoUrl
            });

        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                error: error.message || 'Failed to upload files',
            });
        }
    }
);



app.post('/api/generate-from-urls', async (req, res) => {
    try {
        if (!process.env.FAL_KEY) {
            return res.status(500).json({ error: 'FAL_KEY not configured on server' });
        }

        const { image_url, video_url, character_orientation, prompt } = req.body;

        if (!image_url || !video_url) {
            return res.status(400).json({
                error: 'Both image_url and video_url are required',
            });
        }
        const WEBHOOK_URL = 'https://handsomest-lanny-provocative.ngrok-free.dev/api/webhook';

        console.log('Submitting job to FAL queue...');

        const submission = await fal.queue.submit(
            'fal-ai/wan/v2.2-14b/animate/replace',
            {
                input: {
                    image_url,
                    video_url,
                    character_orientation: character_orientation || 'video',
                    prompt: prompt || ''
                },
                webhookUrl: WEBHOOK_URL
            }
        );

        res.json({
            request_id: submission.request_id,
            message: 'job started',
        });
    } catch (error) {
        console.error('Queue submission failed:', error);
        res.status(500).json({
            error: error.message || 'Failed to submit job',
        });
    }
});


// Store connected clients: requestId -> response object
const clients = new Map();

// SSE Endpoint for real-time updates
app.get('/api/events/:requestId', (req, res) => {
    const requestId = req.params.requestId;
    console.log(`Client connected for updates: ${requestId}`);

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Store the client connection
    clients.set(requestId, res);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ status: 'CONNECTED' })}\n\n`);

    // Remove client when connection closes
    req.on('close', () => {
        console.log(`Client disconnected: ${requestId}`);
        clients.delete(requestId);
    });
});

app.post('/api/webhook', (req, res) => {
    const data = req.body;
    console.log("FAL SENT DATA:", JSON.stringify(data, null, 2));

    const requestId = data.request_id;
    const client = clients.get(requestId);

    if (client) {
        if (data.status === 'COMPLETED' || data.status === 'OK') {
            const videoUrl = data.payload.video.url;
            console.log("SUCCESS! Video is at:", videoUrl);

            client.write(`data: ${JSON.stringify({
                state: 'COMPLETED',
                video: { url: videoUrl },
                metrics: data.metrics
            })}\n\n`);
        } else if (data.status === 'IN_PROGRESS' || data.status === 'QUEUED') {
            client.write(`data: ${JSON.stringify({
                state: data.status,
                logs: data.logs
            })}\n\n`);
        } else if (data.status === 'FAILED' || data.status === 'ERROR') {
            client.write(`data: ${JSON.stringify({
                state: 'FAILED',
                error: data.error
            })}\n\n`);
        }
    } else {
        console.log(`No active client found for request ${requestId}`);
    }

    // You MUST send a 200 status back so Fal knows you got the message
    res.status(200).send('Received');
});


const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

server.setTimeout(10 * 60 * 1000);