/**
 * PhotoBooth Pro - Filters Module
 * Defines and applies filters to photos
 */

// Filter definitions
const FILTERS = {
    normal: {
        name: "Normal",
        apply: (ctx, width, height) => {
            // No filter applied
            return ctx;
        }
    },
    grayscale: {
        name: "Grayscale",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
                data[i] = data[i + 1] = data[i + 2] = gray;
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    sepia: {
        name: "Sepia",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
                data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
                data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    invert: {
        name: "Invert",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];         // Red
                data[i + 1] = 255 - data[i + 1]; // Green
                data[i + 2] = 255 - data[i + 2]; // Blue
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    vintage: {
        name: "Vintage",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Apply sepia-like effect
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                data[i] = Math.min(255, (r * 0.5) + (g * 0.3) + (b * 0.2) + 40);
                data[i + 1] = Math.min(255, (r * 0.2) + (g * 0.5) + (b * 0.1) + 20);
                data[i + 2] = Math.min(255, (r * 0.1) + (g * 0.3) + (b * 0.4));
            }
            
            // Add noise and vignette
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Add subtle noise
                    const noise = Math.random() * 10 - 5;
                    data[idx] = Math.max(0, Math.min(255, data[idx] + noise));
                    data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + noise));
                    data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + noise));
                    
                    // Add vignette effect
                    const dx = x / width - 0.5;
                    const dy = y / height - 0.5;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const vignette = Math.pow(1 - dist * 1.5, 1.5);
                    
                    data[idx] *= vignette;
                    data[idx + 1] *= vignette;
                    data[idx + 2] *= vignette;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    blueprint: {
        name: "Blueprint",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
                
                // Blue channel emphasis
                data[i] = 0;                  // Red
                data[i + 1] = gray * 0.2;     // Green
                data[i + 2] = gray;           // Blue
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    polaroid: {
        name: "Polaroid",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Apply slightly warm tone
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.1);       // Increase red slightly
                data[i + 2] = Math.min(255, data[i + 2] * 0.9); // Decrease blue slightly
            }
            
            // Add faded effect and border
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Add border
                    const borderWidth = Math.min(width, height) * 0.03;
                    if (x < borderWidth || x >= width - borderWidth || 
                        y < borderWidth || y >= height - borderWidth) {
                        data[idx] = 255;
                        data[idx + 1] = 255;
                        data[idx + 2] = 240; // Slightly off-white
                    } else {
                        // Faded effect
                        data[idx] = Math.min(255, data[idx] + 20);
                        data[idx + 1] = Math.min(255, data[idx + 1] + 20);
                        data[idx + 2] = Math.min(255, data[idx + 2] + 10);
                        
                        // Slight contrast reduction
                        data[idx] = data[idx] * 0.9 + 25;
                        data[idx + 1] = data[idx + 1] * 0.9 + 25;
                        data[idx + 2] = data[idx + 2] * 0.9 + 25;
                    }
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    noir: {
        name: "Noir",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            // Convert to high-contrast grayscale
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;
                
                // Increase contrast
                gray = gray > 128 ? (gray + 40) : (gray - 40);
                gray = Math.max(0, Math.min(255, gray));
                
                data[i] = data[i + 1] = data[i + 2] = gray;
            }
            
            // Add vignette effect
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Calculate vignette intensity
                    const dx = x / width - 0.5;
                    const dy = y / height - 0.5;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const vignette = Math.pow(1 - dist * 1.3, 1.5);
                    
                    data[idx] *= vignette;
                    data[idx + 1] *= vignette;
                    data[idx + 2] *= vignette;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    brightness: {
        name: "Brightness",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, data[i] * 1.3);
                data[i + 1] = Math.min(255, data[i + 1] * 1.3);
                data[i + 2] = Math.min(255, data[i + 2] * 1.3);
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    contrast: {
        name: "High Contrast",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const factor = 1.5; // Contrast factor
            
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * factor + 0.5) * 255));
                data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] / 255 - 0.5) * factor + 0.5) * 255));
                data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] / 255 - 0.5) * factor + 0.5) * 255));
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    vignette: {
        name: "Vignette",
        apply: (ctx, width, height) => {
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Create vignette effect
                    const centerX = width / 2;
                    const centerY = height / 2;
                    const dx = (x - centerX) / centerX;
                    const dy = (y - centerY) / centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    
                    // Create strong vignette
                    const vignette = Math.pow(1 - Math.min(1, dist * 1.2), 2);
                    
                    data[idx] *= vignette;
                    data[idx + 1] *= vignette;
                    data[idx + 2] *= vignette;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    },
    blur: {
        name: "Blur",
        apply: (ctx, width, height) => {
            // Simple box blur implementation
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const tempData = new Uint8ClampedArray(data);
            const radius = 5;
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let r = 0, g = 0, b = 0, a = 0;
                    let count = 0;
                    
                    // Sample surrounding pixels
                    for (let ky = -radius; ky <= radius; ky++) {
                        for (let kx = -radius; kx <= radius; kx++) {
                            const posX = Math.min(width - 1, Math.max(0, x + kx));
                            const posY = Math.min(height - 1, Math.max(0, y + ky));
                            const idx = (posY * width + posX) * 4;
                            
                            r += tempData[idx];
                            g += tempData[idx + 1];
                            b += tempData[idx + 2];
                            a += tempData[idx + 3];
                            count++;
                        }
                    }
                    
                    // Write average values
                    const idx = (y * width + x) * 4;
                    data[idx] = r / count;
                    data[idx + 1] = g / count;
                    data[idx + 2] = b / count;
                    data[idx + 3] = a / count;
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            return ctx;
        }
    }
};

// Class to manage photo filters
class FilterManager {
    constructor() {
        this.currentFilter = 'normal';
    }
    
    // Apply a filter to a canvas context
    applyFilter(ctx, filterName, width, height) {
        const filter = FILTERS[filterName] || FILTERS.normal;
        return filter.apply(ctx, width, height);
    }
    
    // Apply the current filter to a canvas
    applyCurrentFilter(canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        return this.applyFilter(ctx, this.currentFilter, width, height);
    }
    
    // Set current filter
    setFilter(filterName) {
        if (FILTERS[filterName]) {
            this.currentFilter = filterName;
            return true;
        }
        return false;
    }
    
    // Get current filter name
    getCurrentFilter() {
        return this.currentFilter;
    }
    
    // Get all available filters
    getAvailableFilters() {
        return Object.keys(FILTERS);
    }
}