import * as THREE from 'three';

/**
 * Fonctions utilitaires pour le projet de portfolio en Three.js
 */

/**
 * Convertit des degrés en radians
 * @param {number} degrees - Angle en degrés
 * @return {number} Angle en radians
 */
export function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

/**
 * Génère une couleur aléatoire
 * @return {number} Couleur hexadécimale au format THREE.js
 */
export function randomColor() {
    return Math.random() * 0xffffff;
}

/**
 * Génère un nombre aléatoire entre min et max
 * @param {number} min - Valeur minimale
 * @param {number} max - Valeur maximale
 * @return {number} Nombre aléatoire entre min et max
 */
export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Calcule la distance entre deux vecteurs
 * @param {THREE.Vector3} vec1 - Premier vecteur
 * @param {THREE.Vector3} vec2 - Second vecteur
 * @return {number} Distance entre les deux vecteurs
 */
export function distance(vec1, vec2) {
    return vec1.distanceTo(vec2);
}

/**
 * Crée une texture avec du texte
 * @param {string} text - Texte à afficher
 * @param {Object} options - Options de style (couleur, taille, etc.)
 * @return {THREE.CanvasTexture} Texture contenant le texte
 */
export function createTextTexture(text, options = {}) {
    const defaults = {
        fontFace: 'Arial',
        fontSize: 24,
        textColor: '#ffffff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 10,
        borderRadius: 6
    };
    
    const settings = { ...defaults, ...options };
    
    // Créer un canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Définir la taille du texte pour mesurer sa largeur
    ctx.font = `${settings.fontSize}px ${settings.fontFace}`;
    const textMetrics = ctx.measureText(text);
    
    // Calculer les dimensions du canvas
    const width = textMetrics.width + (settings.padding * 2);
    const height = settings.fontSize + (settings.padding * 2);
    
    // Définir les dimensions du canvas
    canvas.width = width;
    canvas.height = height;
    
    // Redéfinir le contexte après le redimensionnement
    ctx.font = `${settings.fontSize}px ${settings.fontFace}`;
    
    // Dessiner l'arrière-plan avec des bords arrondis
    ctx.fillStyle = settings.backgroundColor;
    
    // Bords arrondis si spécifiés
    if (settings.borderRadius > 0) {
        ctx.beginPath();
        ctx.moveTo(settings.borderRadius, 0);
        ctx.lineTo(width - settings.borderRadius, 0);
        ctx.quadraticCurveTo(width, 0, width, settings.borderRadius);
        ctx.lineTo(width, height - settings.borderRadius);
        ctx.quadraticCurveTo(width, height, width - settings.borderRadius, height);
        ctx.lineTo(settings.borderRadius, height);
        ctx.quadraticCurveTo(0, height, 0, height - settings.borderRadius);
        ctx.lineTo(0, settings.borderRadius);
        ctx.quadraticCurveTo(0, 0, settings.borderRadius, 0);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.fillRect(0, 0, width, height);
    }
    
    // Dessiner le texte
    ctx.fillStyle = settings.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    // Créer la texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

/**
 * Crée un sprite avec du texte pour l'afficher dans l'espace 3D
 * @param {string} text - Texte à afficher
 * @param {Object} options - Options de style et de position
 * @return {THREE.Sprite} Sprite 3D affichant le texte
 */
export function createTextSprite(text, options = {}) {
    const texture = createTextTexture(text, options);
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: options.depthTest !== undefined ? options.depthTest : true
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Adapter la taille du sprite en fonction de la texture
    const ratio = texture.image.width / texture.image.height;
    const scale = options.scale || 1;
    sprite.scale.set(ratio * scale, scale, 1);
    
    // Positionner le sprite
    if (options.position) {
        sprite.position.copy(options.position);
    }
    
    return sprite;
}

/**
 * Charge un modèle 3D GLTF avec gestion d'avancement
 * @param {string} url - URL du modèle à charger
 * @param {Function} onProgress - Fonction de callback pour l'avancement
 * @return {Promise} Promise résolue avec le modèle chargé
 */
export function loadModel(url, onProgress) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        
        loader.load(
            url,
            (gltf) => resolve(gltf),
            (xhr) => {
                if (onProgress) {
                    const percentage = (xhr.loaded / xhr.total) * 100;
                    onProgress(percentage);
                }
            },
            (error) => reject(error)
        );
    });
}

/**
 * Vérifie si le navigateur prend en charge WebGL
 * @return {boolean} True si WebGL est supporté
 */
export function isWebGLSupported() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
               (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}