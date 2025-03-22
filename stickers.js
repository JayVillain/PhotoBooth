/**
 * PhotoBooth Pro - Stickers Module
 * Contains definitions and functions for working with stickers
 */

// Sticker definitions with SVG content
const STICKERS = {
    sunglasses: `
        <svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M5,20 C5,14.5 9.5,10 15,10 L30,10 C35.5,10 40,14.5 40,20 C40,25.5 35.5,30 30,30 L15,30 C9.5,30 5,25.5 5,20 Z" fill="black" stroke="black" stroke-width="2"/>
            <path d="M60,20 C60,14.5 64.5,10 70,10 L85,10 C90.5,10 95,14.5 95,20 C95,25.5 90.5,30 85,30 L70,30 C64.5,30 60,25.5 60,20 Z" fill="black" stroke="black" stroke-width="2"/>
            <path d="M40,15 L60,15" stroke="black" stroke-width="3"/>
        </svg>
    `,
    hat: `
        <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,50 C20,40 40,25 50,25 C60,25 80,40 80,50" fill="none" stroke="black" stroke-width="3"/>
            <ellipse cx="50" cy="50" rx="40" ry="10" fill="#8B4513" stroke="black" stroke-width="2"/>
            <ellipse cx="50" cy="25" rx="25" ry="5" fill="#8B4513" stroke="black" stroke-width="2"/>
        </svg>
    `,
    mustache: `
        <svg viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
            <path d="M25,20 C30,10 40,15 50,20 C60,15 70,10 75,20 C70,30 60,25 50,20 C40,25 30,30 25,20 Z" fill="black"/>
        </svg>
    `,
    heart: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,30 C20,-10 -15,50 50,90 C115,50 80,-10 50,30 Z" fill="#ff6b6b"/>
        </svg>
    `,
    star: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M50,10 L61,39 L92,39 L67,58 L78,87 L50,69 L22,87 L33,58 L8,39 L39,39 Z" fill="#FFD700" stroke="gold" stroke-width="2"/>
        </svg>
    `,
    crown: `
        <svg viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,40 L25,15 L40,30 L50,10 L60,30 L75,15 L90,40 L10,40 Z" fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
            <path d="M10,40 L10,50 L90,50 L90,40 Z" fill="#FFD700" stroke="#DAA520" stroke-width="2"/>
            <circle cx="25" cy="15" r="3" fill="#FF5555"/>
            <circle cx="50" cy="10" r="3" fill="#FF5555"/>
            <circle cx="75" cy="15" r="3" fill="#FF5555"/>
        </svg>
    `,
    bubble: `
        <svg viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
            <path d="M10,10 L90,10 Q100,10 100,20 L100,50 Q100,60 90,60 L60,60 L50,80 L40,60 L10,60 Q0,60 0,50 L0,20 Q0,10 10,10 Z" fill="white" stroke="black" stroke-width="2"/>
        </svg>
    `,
    fire: `
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path d="M30,100 C10,70 20,40 50,20 C50,40 80,50 70,100 Z" fill="#ff4500"/>
            <path d="M40,100 C30,80 30,60 50,40 C50,50 70,60 60,100 Z" fill="#ffa700"/>
            <path d="M45,100 C40,90 40,80 50,70 C50,75 60,80 55,100 Z" fill="#ffcc00"/>
        </svg>
    `
};

// Class to manage stickers using FabricJS
class StickerManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.stickers = [];
        this.canvas = null;
        this.isFabricInitialized = false;
    }

    // Initialize FabricJS canvas
    initCanvas() {
        if (!this.isFabricInitialized) {
            this.canvas = new fabric.Canvas('sticker-canvas', {
                width: this.container.clientWidth,
                height: this.container.clientHeight
            });
            
            // Create canvas element if it doesn't exist
            if (!document.getElementById('sticker-canvas')) {
                const canvasEl = document.createElement('canvas');
                canvasEl.id = 'sticker-canvas';
                this.container.appendChild(canvasEl);
            }
            
            // Handle canvas resize
            window.addEventListener('resize', this.resizeCanvas.bind(this));
            
            this.isFabricInitialized = true;
        }
    }

    // Resize canvas to fit container
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.setWidth(this.container.clientWidth);
            this.canvas.setHeight(this.container.clientHeight);
            this.canvas.renderAll();
        }
    }

    // Add a sticker to the scene
    addSticker(stickerName) {
        if (!this.isFabricInitialized) {
            this.initCanvas();
        }

        if (STICKERS[stickerName]) {
            fabric.loadSVGFromString(STICKERS[stickerName], (objects, options) => {
                const sticker = fabric.util.groupSVGElements(objects, options);
                
                // Set initial properties
                sticker.set({
                    left: this.canvas.width / 2,
                    top: this.canvas.height / 2,
                    scaleX: 1,
                    scaleY: 1,
                    originX: 'center',
                    originY: 'center',
                    name: stickerName
                });
                
                // Make sticker interactable
                sticker.setControlsVisibility({
                    mt: false,
                    mb: false,
                    ml: false,
                    mr: false
                });
                
                // Add to canvas
                this.canvas.add(sticker);
                this.canvas.setActiveObject(sticker);
                this.stickers.push(sticker);
                this.canvas.renderAll();
            });
        }
    }

    // Remove all stickers
    clearStickers() {
        if (this.canvas) {
            this.stickers.forEach(sticker => {
                this.canvas.remove(sticker);
            });
            this.stickers = [];
            this.canvas.renderAll();
        }
    }

    // Capture stickers as overlay on an image
    captureStickers(targetCanvas) {
        if (this.canvas && this.stickers.length > 0) {
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            tempCanvas.width = targetCanvas.width;
            tempCanvas.height = targetCanvas.height;
            
            // Adjust sticker positions for the target canvas
            const widthRatio = tempCanvas.width / this.canvas.width;
            const heightRatio = tempCanvas.height / this.canvas.height;
            
            this.canvas.discardActiveObject();
            const scaledCanvas = this.canvas.toDataURL({
                format: 'png',
                width: tempCanvas.width,
                height: tempCanvas.height,
                multiplier: Math.max(widthRatio, heightRatio)
            });
            
            // Load the scaled image
            const img = new Image();
            img.onload = () => {
                tempCtx.drawImage(img, 0, 0);
                
                // Return the composite
                return tempCanvas;
            };
            img.src = scaledCanvas;
            
            return tempCanvas;
        }
        
        return null;
    }
}