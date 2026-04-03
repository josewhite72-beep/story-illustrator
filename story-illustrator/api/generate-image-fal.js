// ALTERNATIVE: Vercel Serverless Function for FAL.AI API (Free Alternative)
// This is a free alternative to Replicate using FAL.AI
// To use this instead, rename this file to 'generate-image.js'

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
        const FAL_KEY = process.env.FAL_KEY;
        
        if (!FAL_KEY) {
            return res.status(500).json({ error: 'FAL_KEY not configured' });
        }
        
        // Call FAL.AI API - flux/dev model
        const response = await fetch('https://fal.run/fal-ai/flux/dev', {
            method: 'POST',
            headers: {
                'Authorization': `Key ${FAL_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                image_size: 'landscape_16_9',
                num_inference_steps: 28,
                num_images: 1,
                enable_safety_checker: true
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('FAL.AI API Error:', errorData);
            return res.status(response.status).json({ 
                error: errorData.detail || errorData.message || 'Error calling FAL.AI API' 
            });
        }
        
        const data = await response.json();
        
        // FAL.AI returns images array
        if (data.images && data.images.length > 0) {
            return res.status(200).json({
                success: true,
                imageUrl: data.images[0].url
            });
        } else {
            return res.status(500).json({
                error: 'No image generated'
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