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

        const WEBHOOK_URL = process.env.WEBHOOK_URL ;
        
        console.log('Submitting job to FAL queue with webhook:', WEBHOOK_URL);

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

        console.log('Job submitted with request_id:', submission.request_id);

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
    const { requestId } = req.params;
    
    console.log('SSE client connected for request:', requestId);
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); 
    res.flushHeaders();

    clients.set(requestId, res);
    res.write(`data: ${JSON.stringify({ status: 'CONNECTED' })}\n\n`);

    req.on('close', () => {
        console.log('SSE client disconnected for request:', requestId);
        clients.delete(requestId);
    });
});


// Webhook endpoint to receive updates from FAL
app.post('/api/webhook', (req, res) => {
    try {
        console.log('=== WEBHOOK RECEIVED ===');
        console.log('Full webhook body:', JSON.stringify(req.body, null, 2));
        
        const data = req.body;
        
        const requestId = data.request_id || data.requestId || data.id || data.gateway_request_id;
        
        const status = data.status || data.state;
        
        const payload = data.payload || data.output || data.result;
        
        const error = data.error || data.error_message;
        
        console.log('Extracted data:');
        console.log('- Request ID:', requestId);
        console.log('- Status:', status);
        console.log('- Has Payload:', !!payload);
        console.log('- Has Video in Payload:', !!(payload && payload.video));
        
        if (!requestId) {
            console.error(' No request_id found in webhook data');
            return res.status(400).json({ error: 'Missing request_id' });
        }

        const client = clients.get(requestId);

        if (client) {
            console.log(' Found connected client for request:', requestId);
            
            if (status === 'OK' && payload && payload.video) {
                const videoUrl = payload.video.url || payload.video;
                
                console.log('Job completed! Video URL:', videoUrl);
                console.log('Sending completion to client...');
                
                client.write(`data: ${JSON.stringify({ 
                    state: 'COMPLETED', 
                    video: { url: videoUrl },
                    payload: payload
                })}\n\n`);
                
                console.log('✅ Completion message sent to client');
            } 
            else if (status === 'COMPLETED' || status === 'completed') {
                const videoUrl = payload?.video?.url || payload?.video || data.video?.url;
                
                if (videoUrl) {
                    console.log('Job completed (COMPLETED status)! Video URL:', videoUrl);
                    client.write(`data: ${JSON.stringify({ 
                        state: 'COMPLETED', 
                        video: { url: videoUrl } 
                    })}\n\n`);
                } else {
                    console.error(' COMPLETED but no video URL found');
                    client.write(`data: ${JSON.stringify({ 
                        state: 'FAILED', 
                        error: 'Video URL not found in response' 
                    })}\n\n`);
                }
            } 
            else if (status === 'ERROR' || status === 'FAILED' || status === 'failed' || status === 'error') {
                console.log(' Job failed:', error);
                client.write(`data: ${JSON.stringify({ 
                    state: 'FAILED', 
                    error: error || 'Generation failed' 
                })}\n\n`);
            } 
            else if (status === 'IN_PROGRESS' || status === 'in_progress' || status === 'QUEUED' || status === 'queued') {
                console.log('⏳ Job in progress');
                client.write(`data: ${JSON.stringify({ 
                    state: status.toUpperCase() 
                })}\n\n`);
            } 
            else {
                console.log('ℹ️ Other status:', status);
                client.write(`data: ${JSON.stringify({ 
                    state: status,
                    rawData: data
                })}\n\n`);
            }
        } else {
            console.log('⚠️ No connected client found for request:', requestId);
            console.log('Active clients:', Array.from(clients.keys()));
        }
        
        res.status(200).send('OK');
        console.log('=== WEBHOOK PROCESSED ===\n');
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Webhook endpoint: http://localhost:${port}/api/webhook`);
    console.log(`For ngrok: ngrok http ${port}`);
    console.log(`Set WEBHOOK_URL in .env to your ngrok URL`);
});

server.setTimeout(10 * 60 * 1000);