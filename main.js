class LayerManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.layers = {};  // Stocke les calques avec des clés de type "layerX"
        this.currentLayer = null;
        this.layerCount = 0;  // Compteur pour les clés des calques
        this.initLayer();  // Initialise le premier calque
    }

    initLayer() {
        this.addLayer();  // Ajoute le premier calque lors de l'initialisation
        this.selectLayer('layer0');  // Sélectionne le premier calque
    }

    addLayer() {
        const layer = new fabric.Group([], {
            subTargetCheck: true,
            perPixelTargetFind: true
        });
        this.canvas.add(layer);
        const key = `layer${this.layerCount}`;  // Crée une nouvelle clé
        this.layers[key] = layer;  // Ajoute le calque au dictionnaire avec la nouvelle clé
        this.layerCount++;  // Incrémente le compteur pour la prochaine clé
        this.updateLayerList();  // Met à jour la liste des calques
        this.selectLayer(key);  // Sélectionne le nouveau calque
    }

    selectLayer(key) {
        if (this.currentLayer !== this.layers[key]) {
            this.currentLayer = this.layers[key];
            const li = document.querySelector(`li[data-key="${key}"]`);
            const activeLi = document.querySelector('#layerList li.active');
            if (activeLi) {
                activeLi.classList.remove('active');
            }
            if (li) {
                li.classList.add('active');
            }
            this.canvas.renderAll();  // Rafraîchit le canvas
        }
    }

    deleteLayer(key) {
        if (Object.keys(this.layers).length > 1) {
            const layer = this.layers[key];
            const wasSelected = (this.currentLayer === layer);  // Vérifie si le calque supprimé est celui sélectionné

            this.canvas.remove(layer);  // Enlève le calque du canvas
            delete this.layers[key];  // Supprime le calque du dictionnaire

            if (wasSelected) {
                // Si le calque supprimé était sélectionné, sélectionnez un nouveau calque
                const keys = Object.keys(this.layers);
                const newSelectedKey = keys[0];  // Sélectionne le premier calque disponible après suppression
                this.selectLayer(newSelectedKey);
            }

            this.updateLayerList();  // Met à jour la liste des calques
        } else {
            // Si un seul calque reste, on le supprime également
            this.canvas.remove(this.currentLayer);
            this.currentLayer = null;
            this.layers = {};
            this.updateLayerList();
        }
    }

    updateLayerList() {
        const layerList = document.getElementById('layerList');
        const existingLis = layerList.querySelectorAll('li'); // Récupère tous les éléments li existants

        // Met à jour ou ajoute de nouveaux éléments li
        Object.keys(this.layers).forEach((key, index) => {
            let li = layerList.querySelector(`li[data-key="${key}"]`);
            if (!li) {
                // Crée un nouvel élément li s'il n'existe pas
                li = document.createElement('li');
                li.setAttribute('data-key', key);
                layerList.appendChild(li);
            }

            // Met à jour le contenu de l'élément li
            li.innerHTML = `<span class='layer-span'>Calque ${index}</span>
                            <span class='layer-span'>
                                <button onclick='layerManager.toggleLayerVisibility("${key}", this)'><i class="material-icons">visibility</i></button>
                                <button onclick='layerManager.deleteLayer("${key}")'><i class="material-icons">delete</i></button>
                            </span>`;
            li.onclick = () => this.selectLayer(key);

            // Gère la classe 'active'
            if (this.currentLayer === this.layers[key]) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });

        // Supprime les éléments li qui ne correspondent plus à aucun calque
        existingLis.forEach(li => {
            if (!this.layers[li.getAttribute('data-key')]) {
                layerList.removeChild(li);
            }
        });
    }

    toggleLayerVisibility(key, btn) {
        const layer = this.layers[key];
        layer.visible = !layer.visible;
        btn.innerHTML = layer.visible ? '<i class="material-icons">visibility</i>' : '<i class="material-icons">visibility_off</i>';
        this.canvas.renderAll();  // Rafraîchit le canvas pour montrer le changement de visibilité
    }
}

class ShapeManager {
    constructor(canvas, layerManager) {
        this.canvas = canvas;
        this.layerManager = layerManager;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.toolbar-button.form-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const formType = event.target.closest('button').dataset.form;
                this.addShape(formType);
            });
        });
    }

    addShape(formType) {
        let shape;
        // Initialisation de la forme basée sur le type
        switch (formType) {
            case 'rect':
                shape = new fabric.Rect({
                    width: 100,
                    height: 100,
                    fill: this.layerManager.currentColor,
                    left: Math.random() * 700,
                    top: Math.random() * 500,
                });
                break;
            case 'circle':
                shape = new fabric.Circle({
                    radius: 50,
                    fill: this.layerManager.currentColor,
                    left: Math.random() * 700,
                    top: Math.random() * 500,
                });
                break;
            case 'triangle':
                shape = new fabric.Triangle({
                    width: 100,
                    height: 100,
                    fill: this.layerManager.currentColor,
                    left: Math.random() * 700,
                    top: Math.random() * 500,
                });
                break;
            case 'octogone':
                shape = new fabric.Polygon([
                    { x: 0, y: 50 },
                    { x: 50, y: 0 },
                    { x: 100, y: 0 },
                    { x: 150, y: 50 },
                    { x: 150, y: 100 },
                    { x: 100, y: 150 },
                    { x: 50, y: 150 },
                    { x: 0, y: 100 },
                ], {
                    fill: this.layerManager.currentColor,
                    left: Math.random() * 700,
                    top: Math.random() * 500,
                });
                break;
            case 'drawFree':
                this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
                document.querySelector('[data-form="drawFree"]').classList.toggle('active', this.canvas.isDrawingMode);
                this.canvas.freeDrawingBrush.color = this.layerManager.currentColor;
                this.canvas.freeDrawingBrush.width = 5;
                return;
        }

        console.log(shape);
        this.canvas.add(shape);

        this.canvas.renderAll();
        this.layerManager.updateLayerList();
    }
}

class DraggableToCanvas {
    constructor(canvas, draggableSelector) {
        this.canvas = canvas;
        this.initDraggable(draggableSelector);
    }

    initDraggable(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.addEventListener('dragstart', this.handleDragStart.bind(this), false);
        });

        const canvasContainer = this.canvas.lowerCanvasEl.parentElement;
        canvasContainer.addEventListener('dragover', this.handleDragOver.bind(this), false);
        canvasContainer.addEventListener('drop', this.handleDrop.bind(this), false);
    }

    handleDragStart(e) {
        let img = e.target.querySelector('img, object, embed'); // Étendu pour inclure d'autres types
        if (img) {
            let imageSrc;
            if (img.tagName.toLowerCase() === 'img') {
                imageSrc = img.src;
            } else {
                // Supposons que l'élément est un SVG intégré ou un autre type de contenu
                imageSrc = img.outerHTML; // Transférer le contenu HTML pour les SVG intégrés
            }
            e.dataTransfer.setData('text', imageSrc);
        } else {
            console.error('Image not found in draggable element');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        const imageSrc = e.dataTransfer.getData('text');
        fabric.Image.fromURL(imageSrc, (img) => {
            // Redimensionne l'image et la recentre
            img.scale(0.6); // Applique un facteur de réduction pour adapter l'image

            // Calcule le centre en tenant compte du redimensionnement
            const centerX = e.layerX - (img.getScaledWidth() / 2);
            const centerY = e.layerY - (img.getScaledHeight() / 2);

            // Ajuste les propriétés de l'objet pour centrer l'image
            img.set({
                left: centerX,
                top: centerY,
                originX: 'center', // Définit l'origine horizontale à 'center'
                originY: 'center'  // Définit l'origine verticale à 'center'
            });

            this.canvas.add(img);
            this.canvas.renderAll(); // Redessine le canvas pour mettre à jour l'affichage
        });
    }

    handleDragOver(e) {
        e.preventDefault(); // Nécessaire pour permettre le drop.
    }

}

const canvas = new fabric.Canvas('c');
canvas.backgroundColor = '#f0f0f0';
canvas.hoverCursor = 'pointer';

const draggableToCanvas = new DraggableToCanvas(canvas, '.draggable');
const layerManager = new LayerManager(canvas);
const shapeManager = new ShapeManager(canvas, layerManager);

document.getElementById('colorPicker').addEventListener('change', function () {
    layerManager.currentColor = this.value;
    document.getElementById('selectedColor').textContent = this.value;
});

document.getElementById('clearCanvas').addEventListener('click', () => {
    canvas.clear();
    localStorage.removeItem('canvas'); // Clear the saved canvas
    layerManager.layers = {};
    layerManager.layerCount = 0;
    layerManager.initLayer(); // Reinitialize the first layer
});

document.getElementById('saveCanvas').addEventListener('click', () => {
    const data = JSON.stringify(canvas);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'canvas.json';
    a.click();
    URL.revokeObjectURL(url);
});

// Set up local storage saving
canvas.on('object:added', () => {
    localStorage.setItem('canvas', JSON.stringify(canvas));
    localStorage.setItem('layers', JSON.stringify(layerManager.layers));
});


// Fonction pour charger le canvas sauvegardé dans le localStorage ainsi que les calques
function loadCanvas() {
    const savedCanvas = localStorage.getItem('canvas');
    if (savedCanvas) {
        canvas.loadFromJSON(savedCanvas, () => {
            canvas.renderAll();
        });
    }
    const savedLayers = localStorage.getItem('layers');
    if (savedLayers) {
        layerManager.layers = JSON.parse(savedLayers);
        layerManager.updateLayerList();
        layerManager.selectLayer(Object.keys(layerManager.layers)[0]);
    }
}

// quand un objet est selectionné mettre a jour le colorPicker avec la couleur de l'objet selectionné
canvas.on('selection:created', (e) => {
    const obj = e.target;
    if (obj) {
        currentColor = obj.fill;
        document.getElementById('colorPicker').value = currentColor;
        document.getElementById('selectedColor').textContent = currentColor;
    }
});


document.getElementById('addLayer').addEventListener('click',
    () => layerManager.addLayer());
