const imageLoader = document.getElementById('imageLoader');
const sourceImage = document.getElementById('sourceImage');
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const pixelSlider = document.getElementById('pixelSize');
const sizeValDisplay = document.getElementById('sizeVal');

imageLoader.addEventListener('change', handleImage, false);
pixelSlider.addEventListener('input', updatePixelation);

function handleImage(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        sourceImage.onload = function() {
            processImage();
        }
        sourceImage.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
}

function updatePixelation() {
    sizeValDisplay.innerText = pixelSlider.value;
    if (sourceImage.src) {
        processImage();
    }
}

function processImage() {
    const pixelSize = parseInt(pixelSlider.value);
    
    // Beräkna hur många "pärlor" som får plats
    const w = sourceImage.width;
    const h = sourceImage.height;
    
    // Sätt canvas storlek till originalet
    canvas.width = w;
    canvas.height = h;

    // Skapa en temporär canvas för att skala ner bilden (pixelera)
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const smallW = Math.ceil(w / pixelSize);
    const smallH = Math.ceil(h / pixelSize);
    
    tempCanvas.width = smallW;
    tempCanvas.height = smallH;

    // 1. Rita bilden pytteliten (automatiskt medelvärde av färger)
    tempCtx.drawImage(sourceImage, 0, 0, smallW, smallH);

    // 2. Hämta bilddatan för att göra den svartvit
    const imgData = tempCtx.getImageData(0, 0, smallW, smallH);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
        // Enkel gråskala: (R+G+B) / 3
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Tröskelvärde (Threshold) för ren svartvitt
        const val = avg > 128 ? 255 : 0;
        
        data[i]     = val; // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
    }
    tempCtx.putImageData(imgData, 0, 0);

    // 3. Rita upp den lilla bilden på den stora canvasen igen
    ctx.imageSmoothingEnabled = false; // Viktigt för skarpa pixlar!
    ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, w, h);
    
    // 4. Bonus: Rita ett rutnät (piggplattan)
    drawGrid(ctx, w, h, pixelSize);
}

function drawGrid(context, w, h, step) {
    context.strokeStyle = "rgba(128, 128, 128, 0.5)";
    context.lineWidth = 0.5;
    
    for (let x = 0; x <= w; x += step) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, h);
        context.stroke();
    }
    for (let y = 0; y <= h; y += step) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(w, y);
        context.stroke();
    }
}
