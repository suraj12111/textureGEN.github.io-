// AI Texture Studio - Main Application Logic
class TextureStudio {
    constructor() {
        this.canvas = document.getElementById('textureCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 512;
        this.height = 512;
        this.zoomLevel = 1;
        this.isGenerating = false;
        
        // Texture parameters
        this.params = {
            textureType: 'Wood',
            scale: 0.05,
            roughness: 0.5,
            octaves: 4,
            persistence: 0.5,
            color1: '#8B4513',
            color2: '#D2691E',
            algorithm: 'perlin'
        };

        // Presets data
        this.presets = {
            'rough-wood': { type: 'Wood', scale: 0.05, roughness: 0.8, color1: '#8B4513', color2: '#D2691E', octaves: 4, persistence: 0.5 },
            'smooth-marble': { type: 'Marble', scale: 0.02, roughness: 0.3, color1: '#FFFFFF', color2: '#E5E5E5', octaves: 3, persistence: 0.4 },
            'rusted-metal': { type: 'Metal', scale: 0.1, roughness: 0.9, color1: '#8B4513', color2: '#FF6347', octaves: 5, persistence: 0.6 },
            'soft-fabric': { type: 'Fabric', scale: 0.03, roughness: 0.4, color1: '#F5F5DC', color2: '#DCDCDC', octaves: 4, persistence: 0.3 },
            'ancient-stone': { type: 'Stone', scale: 0.08, roughness: 0.7, color1: '#696969', color2: '#A9A9A9', octaves: 6, persistence: 0.5 }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        // Generate initial texture
        this.generateTexture();
    }

    setupEventListeners() {
        // Parameter controls
        document.getElementById('textureType').addEventListener('change', (e) => {
            this.params.textureType = e.target.value;
            this.generateTexture();
        });

        document.getElementById('presets').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadPreset(e.target.value);
            }
        });

        // Sliders with real-time updates
        const sliders = ['scale', 'roughness', 'octaves', 'persistence'];
        sliders.forEach(param => {
            const slider = document.getElementById(param);
            const valueSpan = document.getElementById(param + 'Value');
            
            slider.addEventListener('input', (e) => {
                this.params[param] = parseFloat(e.target.value);
                valueSpan.textContent = e.target.value;
                this.generateTexture();
            });
        });

        // Color pickers
        document.getElementById('color1').addEventListener('change', (e) => {
            e.stopPropagation();
            this.params.color1 = e.target.value;
            this.generateTexture();
        });

        document.getElementById('color2').addEventListener('change', (e) => {
            e.stopPropagation();
            this.params.color2 = e.target.value;
            this.generateTexture();
        });

        // Algorithm selector
        document.getElementById('algorithm').addEventListener('change', (e) => {
            this.params.algorithm = e.target.value;
            document.getElementById('currentAlgorithm').textContent = this.getAlgorithmName(e.target.value);
            this.generateTexture();
        });

        // Buttons
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateTexture();
        });

        document.getElementById('randomBtn').addEventListener('click', () => {
            this.randomizeParameters();
        });

        // Download buttons
        document.getElementById('downloadPNG').addEventListener('click', () => {
            this.downloadTexture('png');
        });

        document.getElementById('downloadJPG').addEventListener('click', () => {
            this.downloadTexture('jpeg');
        });

        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3);
            this.updateZoom();
        });

        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
            this.updateZoom();
        });
    }

    loadPreset(presetId) {
        const preset = this.presets[presetId];
        if (!preset) return;

        // Update parameters
        this.params.textureType = preset.type;
        this.params.scale = preset.scale;
        this.params.roughness = preset.roughness;
        this.params.color1 = preset.color1;
        this.params.color2 = preset.color2;
        this.params.octaves = preset.octaves;
        this.params.persistence = preset.persistence;

        // Update UI
        document.getElementById('textureType').value = preset.type;
        document.getElementById('scale').value = preset.scale;
        document.getElementById('scaleValue').textContent = preset.scale.toFixed(2);
        document.getElementById('roughness').value = preset.roughness;
        document.getElementById('roughnessValue').textContent = preset.roughness.toFixed(1);
        document.getElementById('octaves').value = preset.octaves;
        document.getElementById('octavesValue').textContent = preset.octaves;
        document.getElementById('persistence').value = preset.persistence;
        document.getElementById('persistenceValue').textContent = preset.persistence.toFixed(1);
        document.getElementById('color1').value = preset.color1;
        document.getElementById('color2').value = preset.color2;

        this.generateTexture();
    }

    randomizeParameters() {
        // Randomize all parameters
        this.params.scale = Math.random() * 0.15 + 0.02;
        this.params.roughness = Math.random() * 0.8 + 0.2;
        this.params.octaves = Math.floor(Math.random() * 6) + 2;
        this.params.persistence = Math.random() * 0.7 + 0.2;
        
        // Random colors
        this.params.color1 = this.randomColor();
        this.params.color2 = this.randomColor();

        // Update UI
        document.getElementById('scale').value = this.params.scale.toFixed(2);
        document.getElementById('scaleValue').textContent = this.params.scale.toFixed(2);
        document.getElementById('roughness').value = this.params.roughness.toFixed(1);
        document.getElementById('roughnessValue').textContent = this.params.roughness.toFixed(1);
        document.getElementById('octaves').value = this.params.octaves;
        document.getElementById('octavesValue').textContent = this.params.octaves;
        document.getElementById('persistence').value = this.params.persistence.toFixed(1);
        document.getElementById('persistenceValue').textContent = this.params.persistence.toFixed(1);
        document.getElementById('color1').value = this.params.color1;
        document.getElementById('color2').value = this.params.color2;

        this.generateTexture();
    }

    randomColor() {
        const colors = ['#8B4513', '#D2691E', '#FFFFFF', '#E5E5E5', '#FF6347', '#F5F5DC', '#DCDCDC', '#696969', '#A9A9A9', '#4169E1', '#32CD32', '#FF69B4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getAlgorithmName(algorithm) {
        const names = {
            'perlin': 'Perlin Noise',
            'simplex': 'Simplex Noise',
            'voronoi': 'Voronoi Cells',
            'fractal': 'Fractal Patterns'
        };
        return names[algorithm] || 'Unknown';
    }

    generateTexture() {
        if (this.isGenerating) return;
        
        this.isGenerating = true;
        const startTime = performance.now();
        
        // Show loading overlay
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('hidden');
        
        // Use setTimeout to allow UI update
        setTimeout(() => {
            try {
                const imageData = this.ctx.createImageData(this.width, this.height);
                const data = imageData.data;

                // Generate texture
                for (let x = 0; x < this.width; x++) {
                    for (let y = 0; y < this.height; y++) {
                        const value = this.getNoiseValue(x, y);
                        const color = this.getTextureColor(value, x, y);
                        
                        const index = (y * this.width + x) * 4;
                        data[index] = Math.max(0, Math.min(255, color.r));
                        data[index + 1] = Math.max(0, Math.min(255, color.g));
                        data[index + 2] = Math.max(0, Math.min(255, color.b));
                        data[index + 3] = 255;
                    }
                }

                this.ctx.putImageData(imageData, 0, 0);
                
                const endTime = performance.now();
                const generationTime = Math.round(endTime - startTime);
                
                // Update generation time
                document.getElementById('generationTime').textContent = generationTime + 'ms';
                
            } catch (error) {
                console.error('Error generating texture:', error);
                // Draw a simple fallback pattern
                this.drawFallbackTexture();
            } finally {
                // Hide loading overlay
                loadingOverlay.classList.add('hidden');
                this.isGenerating = false;
            }
        }, 50);
    }

    drawFallbackTexture() {
        // Draw a simple gradient as fallback
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, this.params.color1);
        gradient.addColorStop(1, this.params.color2);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    getNoiseValue(x, y) {
        let value = 0;
        let amplitude = 1;
        let frequency = this.params.scale;
        let maxValue = 0;

        const octaves = Math.max(1, Math.min(8, this.params.octaves));

        for (let i = 0; i < octaves; i++) {
            let noiseVal = 0;
            
            try {
                switch (this.params.algorithm) {
                    case 'perlin':
                        noiseVal = this.perlinNoise(x * frequency, y * frequency);
                        break;
                    case 'simplex':
                        noiseVal = this.simplexNoise(x * frequency, y * frequency);
                        break;
                    case 'voronoi':
                        noiseVal = this.voronoiNoise(x * frequency, y * frequency);
                        break;
                    case 'fractal':
                        noiseVal = this.fractalNoise(x * frequency, y * frequency, i);
                        break;
                    default:
                        noiseVal = this.perlinNoise(x * frequency, y * frequency);
                }
            } catch (error) {
                noiseVal = Math.random() * 2 - 1; // Fallback to random noise
            }

            value += noiseVal * amplitude;
            maxValue += amplitude;
            
            amplitude *= Math.max(0.1, Math.min(1, this.params.persistence));
            frequency *= 2;
        }

        const normalizedValue = maxValue > 0 ? value / maxValue : 0;
        return Math.max(0, Math.min(1, (normalizedValue + 1) * 0.5));
    }

    perlinNoise(x, y) {
        // Simple noise function using Math.sin
        return (Math.sin(x * 0.1) + Math.sin(y * 0.1) + Math.sin((x + y) * 0.05)) / 3;
    }

    simplexNoise(x, y) {
        // Simplified simplex-like noise
        const n0 = Math.sin(x * 0.1 + y * 0.05) * 0.7;
        const n1 = Math.sin(x * 0.05 + y * 0.1) * 0.3;
        return n0 + n1;
    }

    voronoiNoise(x, y) {
        // Simplified Voronoi pattern
        const scale = 50;
        const cellX = Math.floor(x / scale);
        const cellY = Math.floor(y / scale);
        
        const centerX = cellX * scale + scale * 0.5;
        const centerY = cellY * scale + scale * 0.5;
        
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return Math.max(-1, Math.min(1, (dist / scale - 0.5) * 2));
    }

    fractalNoise(x, y, iteration) {
        // Fractal-like pattern
        const angle = iteration * Math.PI * 0.25;
        const rotX = x * Math.cos(angle) - y * Math.sin(angle);
        const rotY = x * Math.sin(angle) + y * Math.cos(angle);
        
        return Math.sin(rotX * 0.1) * Math.cos(rotY * 0.1);
    }

    getTextureColor(value, x, y) {
        const color1 = this.hexToRgb(this.params.color1);
        const color2 = this.hexToRgb(this.params.color2);
        
        // Apply texture-specific modifications
        let modifiedValue = value;
        
        switch (this.params.textureType) {
            case 'Wood':
                modifiedValue = this.applyWoodPattern(value, x, y);
                break;
            case 'Stone':
                modifiedValue = this.applyStonePattern(value);
                break;
            case 'Metal':
                modifiedValue = this.applyMetalPattern(value, x, y);
                break;
            case 'Marble':
                modifiedValue = this.applyMarblePattern(value, x, y);
                break;
            case 'Fabric':
                modifiedValue = this.applyFabricPattern(value, x, y);
                break;
            case 'Clouds':
                modifiedValue = this.applyCloudPattern(value);
                break;
            case 'Fire':
                modifiedValue = this.applyFirePattern(value, y);
                break;
            case 'Water':
                modifiedValue = this.applyWaterPattern(value, x, y);
                break;
            case 'Abstract':
            default:
                modifiedValue = value;
                break;
        }
        
        // Apply roughness
        const roughness = Math.max(0.1, Math.min(2, this.params.roughness));
        modifiedValue = Math.pow(Math.max(0, Math.min(1, modifiedValue)), roughness);
        
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * modifiedValue),
            g: Math.round(color1.g + (color2.g - color1.g) * modifiedValue),
            b: Math.round(color1.b + (color2.b - color1.b) * modifiedValue)
        };
    }

    applyWoodPattern(value, x, y) {
        const centerX = this.width * 0.5;
        const centerY = this.height * 0.5;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const ring = Math.sin(distance * 0.05) * 0.3 + 0.7;
        return Math.max(0, Math.min(1, value * ring));
    }

    applyStonePattern(value) {
        return value > 0.5 ? Math.pow(value, 0.8) : value * 0.9;
    }

    applyMetalPattern(value, x, y) {
        const scratch = Math.sin(x * 0.2) * 0.1 + Math.sin(y * 0.1) * 0.05;
        return Math.max(0, Math.min(1, value + scratch));
    }

    applyMarblePattern(value, x, y) {
        const vein = Math.sin(x * 0.03 + y * 0.02) * 0.2;
        return Math.max(0, Math.min(1, value + vein));
    }

    applyFabricPattern(value, x, y) {
        const weave = (Math.sin(x * 0.4) + Math.sin(y * 0.4)) * 0.1;
        return Math.max(0, Math.min(1, value + weave));
    }

    applyCloudPattern(value) {
        return Math.pow(value, 0.6);
    }

    applyFirePattern(value, y) {
        const heat = 1 - (y / this.height) * 0.3;
        return Math.max(0, Math.min(1, value * heat));
    }

    applyWaterPattern(value, x, y) {
        const ripple = Math.sin(x * 0.2) * Math.sin(y * 0.2) * 0.15;
        return Math.max(0, Math.min(1, value + ripple));
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16) || 0;
        const g = parseInt(hex.slice(3, 5), 16) || 0;
        const b = parseInt(hex.slice(5, 7), 16) || 0;
        return { r, g, b };
    }

    updateZoom() {
        this.canvas.style.transform = `scale(${this.zoomLevel})`;
        document.getElementById('zoomLevel').textContent = Math.round(this.zoomLevel * 100) + '%';
    }

    downloadTexture(format) {
        try {
            const link = document.createElement('a');
            link.download = `texture_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
            
            if (format === 'jpeg') {
                // Create a temporary canvas with white background for JPEG
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.width;
                tempCanvas.height = this.height;
                const tempCtx = tempCanvas.getContext('2d');
                
                tempCtx.fillStyle = 'white';
                tempCtx.fillRect(0, 0, this.width, this.height);
                tempCtx.drawImage(this.canvas, 0, 0);
                
                link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
            } else {
                link.href = this.canvas.toDataURL('image/png');
            }
            
            link.click();
        } catch (error) {
            console.error('Error downloading texture:', error);
            alert('Error downloading texture. Please try again.');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TextureStudio();
});