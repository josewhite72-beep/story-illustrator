// Vercel Serverless Function for Replicate API (flux-schnell)
// Script actualizado con versión correcta del modelo

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
            return res.status(500).json({ 
                error: 'API key not configured. Agrega REPLICATE_API_TOKEN en Vercel Settings → Environment Variables' 
            });
        }
        
        // Call Replicate API - flux-schnell model (método actualizado)
        const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json',
                'Prefer': 'wait'
            },
            body: JSON.stringify({
                input: {
                    prompt: prompt,
                    num_outputs: 1,
                    aspect_ratio: '16:9',
                    output_format: 'png',
                    output_quality: 90,
                    disable_safety_checker: false
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Replicate API Error:', errorData);
            
            // Mensajes de error más específicos
            let errorMessage = 'Error al generar la imagen';
            if (response.status === 401) {
                errorMessage = 'API key inválida. Verifica tu REPLICATE_API_TOKEN';
            } else if (response.status === 402) {
                errorMessage = 'Sin créditos. Agrega créditos en replicate.com/account/billing';
            } else if (response.status === 429) {
                errorMessage = 'Límite de peticiones alcanzado. Espera un momento e intenta de nuevo';
            }
            
            return res.status(response.status).json({ 
                error: errorMessage,
                details: errorData.detail || errorData.message
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
                error: 'La generación de imagen falló. Intenta con un prompt diferente'
            });
        } else {
            // If not complete, poll for result
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
            error: 'Error interno del servidor',
            message: error.message 
        });
    }
};

// Helper function to poll prediction status
async function pollPrediction(predictionId, apiToken, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
        // Wait 2 seconds between polls
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
            const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                console.error(`Poll attempt ${i + 1} failed:`, response.status);
                continue;
            }
            
            const data = await response.json();
            
            // Success
            if (data.status === 'succeeded' && data.output && data.output.length > 0) {
                return data.output[0];
            } 
            
            // Failed
            if (data.status === 'failed') {
                throw new Error(data.error || 'Prediction failed');
            }
            
            // Cancelled
            if (data.status === 'canceled') {
                throw new Error('Prediction was canceled');
            }
            
            // Still processing - continue loop
            console.log(`Poll attempt ${i + 1}: status = ${data.status}`);
            
        } catch (fetchError) {
            console.error(`Poll error on attempt ${i + 1}:`, fetchError);
            if (i === maxAttempts - 1) {
                throw fetchError;
            }
        }
    }
    
    throw new Error('Timeout: La imagen tomó demasiado tiempo en generarse');
}
