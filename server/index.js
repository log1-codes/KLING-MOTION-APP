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
            }
        );

        res.json({
            request_id: submission.request_id,
            state: 'QUEUED',
        });
    } catch (error) {
        console.error('Queue submission failed:', error);
        res.status(500).json({
            error: error.message || 'Failed to submit job',
        });
    }
});




app.get('/api/job-status/:requestId', async (req, res) => {
    try {
        const requestId = req.params.requestId;

        console.log("Polling requestId:", requestId);

        const status = await fal.queue.status('fal-ai/wan/v2.2-14b/animate/replace', {
            requestId: requestId,
            logs: true
        });

        console.log("Status:", status.status);

        if (status.status === 'COMPLETED') {
            const response_url = status.response_url;

            console.log("Fetching result from:", response_url);

            const resultResponse = await fetch(response_url);
            const resultData = await resultResponse.json();

            console.log("Result data:", JSON.stringify(resultData, null, 2));

            return res.json({
                state: 'COMPLETED',
                video: resultData.video,
                metrics: status.metrics
            });
        }

        if (status.status === 'FAILED' || status.status === 'ERROR') {
            return res.status(500).json({
                state: 'FAILED',
                error: status.error || 'Job failed',
            });
        }

        res.json({
            state: status.status || 'IN_PROGRESS',
            logs: status.logs
        });

    } catch (error) {
        console.error('Polling failed:', error);
        res.status(500).json({
            error: error.message || 'Failed to fetch job status',
        });
    }
});


const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});

server.setTimeout(10 * 60 * 1000);