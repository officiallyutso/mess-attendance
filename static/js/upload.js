document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const fileInput = document.getElementById('file');
    const dateInput = document.getElementById('date');
    const messageDiv = document.getElementById('message');
    
    formData.append('file', fileInput.files[0]);
    formData.append('date', dateInput.value);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'File uploaded successfully!';
            fileInput.value = '';
            dateInput.value = '';
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.error || 'Upload failed';
        }
    } catch (error) {
        messageDiv.className = 'message error';
        messageDiv.textContent = 'An error occurred during upload';
    }
});