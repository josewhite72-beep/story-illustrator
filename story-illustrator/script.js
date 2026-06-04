// State management
const state = {
    currentImageUrl: null,
    galleryImages: [],
    isGenerating: false,
    retryCount: 0,
    maxRetries: 3,
    imageCount: 4
};

// DOM Elements
const elements = {
    countSelector: document.getElementById('countSelector'),
    charCount: document.getElementById('charCount'),
    styleSelect: document.getElementById('styleSelect'),
    generateBtn: document.getElementById('generateBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    newImageBtn: document.getElementById('newImageBtn'),
    retryBtn: document.getElementById('retryBtn'),
    emptyState: document.getElementById('emptyState'),
    loadingState: document.getElementById('loadingState'),
    resultState: document.getElementById('resultState'),
    errorState: document.getElementById('errorState'),
    resultImage: document.getElementById('resultImage'),
    errorMessage: document.getElementById('errorMessage'),
    galleryGrid: document.getElementById('galleryGrid')
};

// Style mappings
const stylePrompts = {
    'watercolor': 'in watercolor painting style, soft colors, flowing textures',
    'concept-art': 'in concept art style, detailed, professional illustration',
    'vintage-sketch': 'in vintage sketch style, hand-drawn, classic illustration',
    'cyberpunk': 'in cyberpunk style, neon colors, futuristic, high tech',
    'ghibli': 'in Studio Ghibli animation style, whimsical, detailed',
    'oil-painting': 'in oil painting style, rich colors, classical art',
    'digital-art': 'in digital art style, vibrant, modern illustration'
};

// Initialize
function init() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Event listeners
    elements.promptTextarea.addEventListener('input', updateCharCount);
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.downloadBtn.addEventListener('click', handleDownload);
    elements.newImageBtn.addEventListener('click', resetToInput);
    elements.retryBtn.addEventListener('click', handleRetry);
    
    // Count selector
    elements.countSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.count-btn');
        if (!btn) return;
        document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.imageCount = parseInt(btn.dataset.count);
    });
    
    // Load gallery
    loadGallery();
}

// Update character count
function updateCharCount() {
    const count = elements.promptTextarea.value.length;
    elements.charCount.textContent = count;
    
    if (count > 450) {
        elements.charCount.style.color = '#F5A623';
    } else {
        elements.charCount.style.color = '#52525B';
    }
}

// Set canvas state
function setCanvasState(state) {
    elements.emptyState.style.display = 'none';
    elements.loadingState.style.display = 'none';
    elements.resultState.style.display = 'none';
    elements.errorState.style.display = 'none';
    
    switch(state) {
        case 'empty':
            elements.emptyState.style.display = 'flex';
            break;
        case 'loading':
            elements.loadingState.style.display = 'flex';
            break;
        case 'result':
            elements.resultState.style.display = 'block';
            break;
        case 'error':
            elements.errorState.style.display = 'flex';
            break;
    }
    
    // Reinitialize icons after state change
    setTimeout(() => lucide.createIcons(), 50);
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 'alert-circle';
    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    lucide.createIcons();
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Handle generate
async function handleGenerate() {
    const prompt = elements.promptTextarea.value.trim();
    
    if (!prompt) {
        showToast('Por favor, escribe una historia o descripción', 'error');
        return;
    }
    
    if (prompt.length < 10) {
        showToast('La descripción es muy corta. Escribe al menos 10 caracteres', 'error');
        return;
    }
    
    state.isGenerating = true;
    state.retryCount = 0;
    elements.generateBtn.disabled = true;
    setCanvasState('loading');
    
    await generateImage(prompt);
}

// Generate image with API
async function generateImage(prompt) {
    const style = elements.styleSelect.value;
    const fullPrompt = `${prompt} ${stylePrompts[style]}`;
    
    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: fullPrompt,
                style: style
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al generar la imagen');
        }
        
        const data = await response.json();
        
        if (data.imageUrl) {
            state.currentImageUrl = data.imageUrl;
            elements.resultImage.src = data.imageUrl;
            setCanvasState('result');
            
            // Add to gallery
            addToGallery(data.imageUrl, prompt);
            
            showToast('¡Ilustración generada con éxito!', 'success');
        } else {
            throw new Error('No se recibió la URL de la imagen');
        }
    } catch (error) {
        console.error('Error:', error);
        handleError(error.message);
    } finally {
        state.isGenerating = false;
        elements.generateBtn.disabled = false;
    }
}

// Handle error with retry
function handleError(message) {
    if (state.retryCount < state.maxRetries) {
        elements.errorMessage.textContent = `${message}. Reintento ${state.retryCount + 1}/${state.maxRetries}...`;
        setCanvasState('error');
        showToast(`Error: ${message}. Reintentando...`, 'error');
    } else {
        elements.errorMessage.textContent = `${message}. Se alcanzó el número máximo de reintentos.`;
        setCanvasState('error');
        showToast('Error al generar la imagen. Por favor, intenta de nuevo más tarde.', 'error');
    }
}

// Handle retry
async function handleRetry() {
    const prompt = elements.promptTextarea.value.trim();
    if (!prompt) return;
    
    state.retryCount++;
    setCanvasState('loading');
    await generateImage(prompt);
}

// Handle download
async function handleDownload() {
    if (!state.currentImageUrl) return;
    
    try {
        showToast('Descargando imagen...', 'success');
        
        // Fetch image as blob
        const response = await fetch(state.currentImageUrl);
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `story-illustration-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('¡Imagen descargada con éxito!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showToast('Error al descargar la imagen', 'error');
    }
}

// Reset to input state
function resetToInput() {
    setCanvasState('empty');
    state.currentImageUrl = null;
}

// Add to gallery
function addToGallery(imageUrl, prompt) {
    // Add to beginning of array
    state.galleryImages.unshift({ imageUrl, prompt });
    
    // Keep only last N images based on imageCount
    if (state.galleryImages.length > state.imageCount) {
        state.galleryImages = state.galleryImages.slice(0, state.imageCount);
    }
    
    // Save to localStorage
    try {
        localStorage.setItem('storyGallery', JSON.stringify(state.galleryImages));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
    
    renderGallery();
}

// Load gallery from localStorage and example images
function loadGallery() {
    // Load from localStorage
    try {
        const saved = localStorage.getItem('storyGallery');
        if (saved) {
            state.galleryImages = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
    
    // Add example images if gallery is empty
    if (state.galleryImages.length === 0) {
        state.galleryImages = [
            {
                imageUrl: 'https://images.unsplash.com/photo-1766307543930-a35e9417b2d5?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHw0fHxtYWdpY2FsJTIwZm9yZXN0JTIwaWxsdXN0cmF0aW9ufGVufDB8fHx8MTc3NTI0OTA2MXww&ixlib=rb-4.1.0&q=85',
                prompt: 'Un bosque mágico iluminado por luciérnagas al atardecer'
            },
            {
                imageUrl: 'https://images.unsplash.com/photo-1770034285769-4a5a3f410346?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwZm9yZXN0JTIwaWxsdXN0cmF0aW9ufGVufDB8fHx8MTc3NTI0OTA2MXww&ixlib=rb-4.1.0&q=85',
                prompt: 'Una ciudad futurista con rascacielos y vehículos voladores'
            },
            {
                imageUrl: 'https://images.pexels.com/photos/3630100/pexels-photo-3630100.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
                prompt: 'Un dragón majestuoso volando sobre montañas nevadas'
            }
        ];
    }
    
    renderGallery();
}

// Render gallery
function renderGallery() {
    elements.galleryGrid.innerHTML = '';
    
    state.galleryImages.forEach((item, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.style.animationDelay = `${index * 0.1}s`;
        
        galleryItem.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.prompt}" loading="lazy">
            <div class="gallery-overlay">
                <p class="gallery-prompt">${item.prompt}</p>
            </div>
        `;
        
        // Click to use as reference
        galleryItem.addEventListener('click', () => {
            elements.promptTextarea.value = item.prompt;
            updateCharCount();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast('Prompt copiado al editor', 'success');
        });
        
        elements.galleryGrid.appendChild(galleryItem);
    });
}

// Initialize app
init();