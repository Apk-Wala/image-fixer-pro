const imageInput = document.getElementById('imageInput');
const originalImage = document.getElementById('originalImage');
const enhancedImage = document.getElementById('enhancedImage');
const downloadBtn = document.getElementById('downloadBtn');
const statusMessage = document.getElementById('statusMessage');

// Load placeholder on start
originalImage.src = 'https://via.placeholder.com/300x200?text=Upload+Image';
enhancedImage.src = 'https://via.placeholder.com/300x200?text=Enhanced+Image';

imageInput.addEventListener('change', async function () {
  const file = this.files[0];
  if (!file) return;

  statusMessage.textContent = '';
  downloadBtn.classList.add('hidden');

  const reader = new FileReader();
  reader.onload = async function (e) {
    originalImage.src = e.target.result;
    statusMessage.textContent = 'Enhancing... Please wait.';

    try {
      const base64Image = e.target.result.split(',')[1];

      const response = await fetch('https://api.picsart.io/tools/1.0/upscale', {
        method: 'POST',
        headers: {
          'X-Picsart-API-Key': 'YOUR_PICSART_API_KEY_HERE',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_base64: base64Image,
          scale: 2 // upscale 2x
        })
      });

      if (!response.ok) throw new Error('Enhancement failed');

      const data = await response.json();

      const enhancedUrl = data.data.url;
      enhancedImage.src = enhancedUrl;
      downloadBtn.href = enhancedUrl;
      downloadBtn.classList.remove('hidden');
      statusMessage.textContent = 'Enhancement complete!';
    } catch (error) {
      statusMessage.textContent = 'Error: ' + error.message;
      enhancedImage.src = 'https://via.placeholder.com/300x200?text=Error';
    }
  };

  reader.readAsDataURL(file);
});
