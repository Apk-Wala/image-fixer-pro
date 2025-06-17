document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInfo = document.getElementById('fileInfo');
    const originalImageContainer = document.getElementById('originalImageContainer');
    const enhancedImageContainer = document.getElementById('enhancedImageContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusMessage = document.getElementById('statusMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Fetch API key from shields/config.json
    fetch('shields/config.json')
        .then(response => response.json())
        .then(config => {
            window.API_KEY = config.API_KEY;
        })
        .catch(error => {
            console.error('Error loading API key:', error);
            showError('Failed to load API configuration');
        });

    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            fileInfo.textContent = `Selected: ${file.name}`;
            
            displayImage(file, originalImageContainer);
            enhanceImage(file);
        }
    });

    downloadBtn.addEventListener('click', function() {
        const enhancedImg = enhancedImageContainer.querySelector('img');
        if (enhancedImg) {
            const link = document.createElement('a');
            link.href = enhancedImg.src;
            link.download = `enhanced_${fileInput.files[0].name}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });

    function displayImage(file, container) {
        const reader = new FileReader();
        reader.onload = function(e) {
            container.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    }

    async function enhanceImage(file) {
        enhancedImageContainer.innerHTML = '<span>Enhancing image...</span>';
        downloadBtn.style.display = 'none';
        statusMessage.style.display = 'none';
        loadingIndicator.style.display = 'flex';

        const formData = new FormData();
        formData.append('image', file);
        formData.append('scale', '2');

        try {
            if (!window.API_KEY) {
                throw new Error('API key not loaded');
            }

            const response = await fetch('https://api.picsart.io/tools/1.0/upscale', {
                method: 'POST',
                headers: {
                    'apikey': window.API_KEY
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (data.data && data.data.url) {
                const enhancedImg = document.createElement('img');
                enhancedImg.onload = function() {
                    const originalImg = originalImageContainer.querySelector('img');
                    if (originalImg) {
                        enhancedImg.style.width = originalImg.style.width || '100%';
                        enhancedImg.style.height = originalImg.style.height || 'auto';
                    }
                    
                    enhancedImageContainer.innerHTML = '';
                    enhancedImageContainer.appendChild(enhancedImg);
                    downloadBtn.style.display = 'block';
                    
                    showSuccess('Image enhanced successfully!');
                };
                enhancedImg.src = data.data.url;
            } else {
                throw new Error('No image URL returned from API');
            }
        } catch (error) {
            console.error('Error enhancing image:', error);
            enhancedImageContainer.innerHTML = '<span>Error enhancing image</span>';
            showError(`Error: ${error.message}`);
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    function showError(message) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message error';
        statusMessage.style.display = 'block';
    }

    function showSuccess(message) {
        statusMessage.textContent = message;
        statusMessage.className = 'status-message success';
        statusMessage.style.display = 'block';
    }
});
