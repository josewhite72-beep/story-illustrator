// Vercel Serverless Function for Replicate API
// This function acts as a proxy to call Replicate API securely

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { prompt, style } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        // Get API key from environment variable
        const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
        
        if (!REPLICATE_API_TOKEN) {
            return res.status(500).json({ error: 'API key not configured' });
        }
        
        // Call Replicate API - flux-schnell model
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Prefer': 'wait'
            },
            body: JSON.stringify({
                version: 'f2ab8a5569279d9b84c6444bcf2c5e0f73abe57c',  // flux-schnell version
                input: {
                    prompt: prompt,
                    num_outputs: 1,
                    aspect_ratio: '16:9',
                    output_format: 'png',
                    output_quality: 90
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Replicate API Error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.detail || 'Error calling Replicate API' 
            });
        }
        
        const data = await response.json();
        
        // Check if prediction is complete
        if (data.status === 'succeeded' && data.output && data.output.length > 0) {
            return res.status(200).json({
                success: true,
                imageUrl: data.output[0]
            });
        } else if (data.status === 'failed') {
            return res.status(500).json({
                error: 'Image generation failed'
            });
        } else {
            // If not complete, need to poll
            // Wait for the prediction to complete
            const predictionId = data.id;
            const imageUrl = await pollPrediction(predictionId, REPLICATE_API_TOKEN);
            
            return res.status(200).json({
                success: true,
                imageUrl: imageUrl
            });
        }
        
    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

// Helper function to poll prediction status
async function pollPrediction(predictionId, apiToken, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.status === 'succeeded' && data.output && data.output.length > 0) {
            return data.output[0];
        } else if (data.status === 'failed') {
            throw new Error('Prediction failed');
        }
        // Continue polling if still processing
    }
    
    throw new Error('Prediction timeout');
}