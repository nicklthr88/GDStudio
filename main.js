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

document.addEventListener("DOMContentLoaded", function () {
    loadBackgrounds();
    let currentStep = 1;
    const totalSteps = 3;
    showStep(currentStep);

    document.querySelectorAll('.nextButton').forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                showStep(++currentStep);
            } else {
                finishSetup();
            }
        });
    });

    function showStep(stepNumber) {
        document.querySelectorAll('#steps > div').forEach(div => {
            div.style.display = 'none';
        });
        document.getElementById(`step${stepNumber}`).style.display = 'block';
    }

    function finishSetup() {
        document.getElementById('steps').style.display = 'none';
        document.querySelector('#gameContainer').style.display = 'flex';
        initializeCanvas(); // Initialise le canvas ici
    }
});

function loadBackgrounds() {
    const bgContainer = document.getElementById('backgroundSelection');
    bgContainer.innerHTML = ''; // Nettoie les anciens fonds si présents
    // Ajoutez ici la logique de chargement de vos fonds
    ['bg1.png', 'bg2.png', 'bg3.png'].forEach(bg => {
        let img = document.createElement('img');
        img.src = `assets/bg/${bg}`;
        img.className = 'background';
        img.onclick = function () {
            document.getElementById('startButton').style.display = 'block';
            canvas.setBackgroundImage(img.src, canvas.renderAll.bind(canvas), {
                scaleX: canvas.width / img.width,
                scaleY: canvas.height / img.height
            });
        };
        bgContainer.appendChild(img);
    });
}

function initializeCanvas() {
}