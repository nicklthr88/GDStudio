// Initialisation de canvas
var canvas = new fabric.Canvas('c', {
    width: 800, // Démarre avec 16:9
    height: 450
});
var isSixteenNine = true; // État initial du ratio

// Ajout de drag-and-drop pour les éléments
document.querySelectorAll('.draggable').forEach(img => {
    img.addEventListener('dragstart', function (e) {
        e.dataTransfer.setData('src', this.src);
    });
});

// Permettre au canvas de recevoir les éléments
canvas.lowerCanvasEl.addEventListener('dragover', function (e) {
    e.preventDefault(); // Nécessaire pour permettre le drop
});

canvas.lowerCanvasEl.addEventListener('drop', function (e) {
    e.preventDefault();
    const src = e.dataTransfer.getData('src');
    const pointer = canvas.getPointer(e);
    fabric.Image.fromURL(src, function (img) {
        img.set({
            left: pointer.x,
            top: pointer.y,
            originX: 'center',
            originY: 'center',
            scaleX: 0.5,
            scaleY: 0.5
        });
        canvas.add(img);
    });
});

// Fonction pour exporter le canvas en PNG
function exporterPNG() {
    var url = canvas.toDataURL({
        format: 'png',
        quality: 1.0
    });
    var link = document.createElement('a');
    link.download = 'prototype.png';
    link.href = url;
    link.click();
}

document.getElementById('toggleRatio').addEventListener('click', function () {
    if (isSixteenNine) {
        // Change à 9:16
        canvas.setDimensions({ width: 450, height: 800 });
    } else {
        // Change à 16:9
        canvas.setDimensions({ width: 800, height: 450 });
    }
    isSixteenNine = !isSixteenNine; // Bascule l'état du ratio
});