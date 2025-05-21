import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Classe qui gère les contrôles et le comportement de la caméra
 */
class CameraController {
    /**
     * Initialise le contrôleur de caméra
     * @param {THREE.Camera} camera - La caméra à contrôler
     * @param {HTMLElement} domElement - L'élément DOM pour les événements de souris
     */
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;
        
        // Cible (le personnage à suivre)
        this.target = null;
        
        // Contrôles d'orbite pour le mode debug
        this.orbitControls = new OrbitControls(camera, domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.enabled = false; // Désactivé par défaut
        
        // Mode de contrôle de la caméra
        this.controlMode = 'hybrid'; // 'keyboard', 'mouse', ou 'hybrid'
        
        // Contrôles de la caméra avec la souris
        this.mouseControls = {
            enabled: true,
            sensitivity: 0.002,
            maxPolarAngle: Math.PI * 0.45,     // 80 degrés vers le bas
            minPolarAngle: Math.PI * 0.05,     // 5 degrés vers le haut
            polarAngle: Math.PI * 0.25,        // Angle vertical initial (25 degrés)
            azimuthAngle: -Math.PI / 4,        // Angle horizontal initial (-45 degrés)
            mouseDown: false,
            lastMouseX: 0,
            lastMouseY: 0,
            lockCamera: false                  // Si true, désactive temporairement les contrôles de souris
        };
        
        // Paramètres de la caméra
        this.settings = {
            followPlayer: true,          // Si la caméra doit suivre le joueur
            rotateWithPlayer: false,     // Si la caméra doit tourner avec le joueur
            smoothFollow: true,          // Transition douce
            followSpeed: 0.1,            // Vitesse de suivi (plus petit = plus lent)
            height: 4,                   // Hauteur de la caméra
            distance: 8,                 // Distance derrière le joueur
            lookHeight: 1.7,             // Hauteur du point de regard
            fixedRotation: true,         // Maintenir une rotation fixe par défaut
            fixedAngle: -Math.PI / 4     // Angle fixe (par défaut: regarder vers la direction -z)
        };
        
        // Configurer les écouteurs d'événements pour la souris
        this.setupMouseListeners();
    }
    
    /**
     * Définit la cible à suivre (le personnage)
     * @param {Object} target - Le personnage à suivre
     */
    setTarget(target) {
        this.target = target;
        
        // Mettre à jour la direction de la caméra dans le personnage si applicable
        if (target && target.updateCameraDirection) {
            const direction = new THREE.Vector3();
            direction.setFromSphericalCoords(
                1,
                this.mouseControls.polarAngle,
                this.mouseControls.azimuthAngle
            );
            direction.y = 0;
            direction.normalize();
            
            target.updateCameraDirection(direction);
        }
    }
    
    /**
     * Configure les écouteurs d'événements pour les contrôles de souris
     */
    setupMouseListeners() {
        // Contrôles de souris pour la caméra
        this.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
        document.addEventListener('mouseup', this.onMouseUp.bind(this));
        document.addEventListener('mousemove', this.onMouseMove.bind(this));
        
        // Empêcher le menu contextuel sur clic droit
        this.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
    }
    
    /**
     * Gestionnaire d'événement mousedown
     * @param {MouseEvent} event - L'événement mousedown
     */
    onMouseDown(event) {
        if (this.mouseControls.enabled && event.button === 0) { // Bouton gauche de la souris
            this.mouseControls.mouseDown = true;
            this.mouseControls.lastMouseX = event.clientX;
            this.mouseControls.lastMouseY = event.clientY;
            
            // Capture du curseur pour éviter qu'il ne sorte de la fenêtre
            if (this.domElement.requestPointerLock) {
                this.domElement.requestPointerLock();
            }
        }
    }
    
    /**
     * Gestionnaire d'événement mouseup
     */
    onMouseUp() {
        this.mouseControls.mouseDown = false;
        
        // Libération du curseur
        if (document.exitPointerLock) {
            document.exitPointerLock();
        }
    }
    
    /**
     * Gestionnaire d'événement mousemove
     * @param {MouseEvent} event - L'événement mousemove
     */
    onMouseMove(event) {
        if (this.mouseControls.enabled) {
            // Si le verrou de pointeur est actif, utiliser movementX/Y
            if (document.pointerLockElement === this.domElement) {
                this.handleMouseMovement(event.movementX, event.movementY);
            } 
            // Sinon, calculer le mouvement à partir des coordonnées absolues
            else if (this.mouseControls.mouseDown) {
                const deltaX = event.clientX - this.mouseControls.lastMouseX;
                const deltaY = event.clientY - this.mouseControls.lastMouseY;
                
                this.handleMouseMovement(deltaX, deltaY);
                
                this.mouseControls.lastMouseX = event.clientX;
                this.mouseControls.lastMouseY = event.clientY;
            }
        }
    }
    
    /**
     * Gère le mouvement de la souris pour la caméra
     * @param {number} deltaX - Mouvement horizontal de la souris
     * @param {number} deltaY - Mouvement vertical de la souris
     */
    handleMouseMovement(deltaX, deltaY) {
        if (!this.mouseControls.enabled || this.mouseControls.lockCamera) {
            return;
        }
        
        // Ajuster les angles en fonction du mouvement de la souris
        const sensitivity = this.mouseControls.sensitivity;
        
        // Rotation horizontale (azimuth)
        this.mouseControls.azimuthAngle -= deltaX * sensitivity;
        
        // Rotation verticale (polar) avec limites pour éviter de regarder trop haut ou trop bas
        this.mouseControls.polarAngle += deltaY * sensitivity;
        this.mouseControls.polarAngle = Math.max(
            this.mouseControls.minPolarAngle,
            Math.min(this.mouseControls.maxPolarAngle, this.mouseControls.polarAngle)
        );
        
        // Mettre à jour la direction du personnage pour qu'il se déplace dans la direction de la caméra
        if (this.target && this.target.updateCameraDirection) {
            const cameraDirection = new THREE.Vector3();
            cameraDirection.setFromSphericalCoords(
                1,
                this.mouseControls.polarAngle,
                this.mouseControls.azimuthAngle
            );
            cameraDirection.y = 0; // Ignorer l'axe Y pour le mouvement du personnage
            cameraDirection.normalize();
            
            this.target.updateCameraDirection(cameraDirection);
        }
    }
    
    /**
     * Change le mode de contrôle de la caméra
     */
    toggleControlMode() {
        const modes = ['keyboard', 'mouse', 'hybrid'];
        const currentIndex = modes.indexOf(this.controlMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.controlMode = modes[nextIndex];
        
        // Mise à jour des paramètres en fonction du mode
        switch (this.controlMode) {
            case 'keyboard':
                this.settings.rotateWithPlayer = true;
                this.settings.fixedRotation = false;
                this.mouseControls.enabled = false;
                break;
            case 'mouse':
                this.settings.rotateWithPlayer = false;
                this.settings.fixedRotation = false;
                this.mouseControls.enabled = true;
                break;
            case 'hybrid':
                this.settings.rotateWithPlayer = false;
                this.settings.fixedRotation = true;
                this.mouseControls.enabled = true;
                break;
        }
        
        return this.controlMode;
    }
    
    /**
     * Active ou désactive les contrôles d'orbite (mode debug)
     */
    toggleOrbitControls() {
        this.orbitControls.enabled = !this.orbitControls.enabled;
        
        // Si les contrôles d'orbite sont activés, désactiver le suivi du joueur
        if (this.orbitControls.enabled) {
            this.settings.followPlayer = false;
            this.mouseControls.enabled = false;
        } else {
            this.settings.followPlayer = true;
            this.mouseControls.enabled = this.controlMode !== 'keyboard';
        }
        
        return this.orbitControls.enabled;
    }
    
    /**
     * Mise à jour de la caméra à chaque frame
     * @param {number} delta - Temps écoulé depuis la dernière frame
     */
    update(delta) {
        if (!this.target) return;
        
        // Mettre à jour les contrôles d'orbite si activés
        if (this.orbitControls.enabled) {
            this.orbitControls.update();
            return;
        }
        
        if (this.settings.followPlayer) {
            // Position de base du joueur
            const playerPosition = this.target.mesh.position.clone();
            
            // La position et l'orientation de la caméra dépendent du mode de contrôle
            switch (this.controlMode) {
                case 'keyboard':
                    this.updateKeyboardCamera(playerPosition);
                    break;
                case 'mouse':
                    this.updateMouseCamera(playerPosition);
                    break;
                case 'hybrid':
                default:
                    this.updateHybridCamera(playerPosition);
                    break;
            }
        }
    }
    
    /**
     * Mode caméra contrôlée par le clavier (tourne avec le personnage)
     * @param {THREE.Vector3} playerPosition - Position du personnage
     */
    updateKeyboardCamera(playerPosition) {
        const cameraPosition = new THREE.Vector3();
        const lookAtPosition = new THREE.Vector3();
        
        // Utiliser la rotation du joueur pour orienter la caméra
        const playerRotation = this.target.mesh.rotation.y;
        
        // Calculer l'offset de la caméra par rapport à la rotation du personnage
        const offsetX = Math.sin(playerRotation) * this.settings.distance;
        const offsetZ = Math.cos(playerRotation) * this.settings.distance;
        
        // Calculer la position de la caméra
        cameraPosition.x = playerPosition.x - offsetX;
        cameraPosition.y = playerPosition.y + this.settings.height;
        cameraPosition.z = playerPosition.z - offsetZ;
        
        // Point de regard situé à hauteur des yeux du personnage
        lookAtPosition.copy(playerPosition).add(new THREE.Vector3(0, this.settings.lookHeight, 0));
        
        // Appliquer la position de la caméra avec ou sans lissage
        if (this.settings.smoothFollow) {
            this.camera.position.lerp(cameraPosition, this.settings.followSpeed);
        } else {
            this.camera.position.copy(cameraPosition);
        }
        
        // Faire regarder la caméra vers le personnage
        this.camera.lookAt(lookAtPosition);
    }
    
    /**
     * Mode caméra contrôlée par la souris uniquement
     * @param {THREE.Vector3} playerPosition - Position du personnage
     */
    updateMouseCamera(playerPosition) {
        // Calculer la position de la caméra basée sur les angles de la souris
        const cameraPosition = new THREE.Vector3();
        
        // Calculer les coordonnées sphériques (r, theta, phi) pour la position de la caméra
        cameraPosition.setFromSphericalCoords(
            this.settings.distance,
            this.mouseControls.polarAngle,
            this.mouseControls.azimuthAngle
        );
        
        // Ajouter la position du joueur
        cameraPosition.add(playerPosition);
        cameraPosition.y += this.settings.height - this.settings.distance * Math.cos(this.mouseControls.polarAngle);
        
        // Point de regard situé à hauteur des yeux du personnage
        const lookAtPosition = playerPosition.clone().add(new THREE.Vector3(0, this.settings.lookHeight, 0));
        
        // Appliquer la position de la caméra avec ou sans lissage
        if (this.settings.smoothFollow) {
            this.camera.position.lerp(cameraPosition, this.settings.followSpeed);
        } else {
            this.camera.position.copy(cameraPosition);
        }
        
        // Faire regarder la caméra vers le personnage
        this.camera.lookAt(lookAtPosition);
    }
    
    /**
     * Mode hybride : on peut utiliser à la fois le clavier et la souris
     * @param {THREE.Vector3} playerPosition - Position du personnage
     */
    updateHybridCamera(playerPosition) {
        // Calculer la position de la caméra en fonction de l'angle fixe ou des contrôles de souris
        const cameraPosition = new THREE.Vector3();
        
        if (this.mouseControls.mouseDown || this.settings.fixedRotation === false) {
            // Si on utilise la souris ou si la rotation fixe est désactivée, utiliser les angles de la souris
            cameraPosition.setFromSphericalCoords(
                this.settings.distance,
                this.mouseControls.polarAngle,
                this.mouseControls.azimuthAngle
            );
        } else {
            // Sinon, utiliser l'angle fixe
            cameraPosition.x = Math.sin(this.settings.fixedAngle) * this.settings.distance;
            cameraPosition.y = this.settings.height;
            cameraPosition.z = Math.cos(this.settings.fixedAngle) * this.settings.distance;
        }
        
        // Ajouter la position du joueur
        const heightOffset = this.mouseControls.mouseDown ? 
            -this.settings.distance * Math.cos(this.mouseControls.polarAngle) + this.settings.height :
            0;
            
        cameraPosition.add(playerPosition);
        cameraPosition.y += heightOffset;
        
        // Point de regard situé à hauteur des yeux du personnage
        const lookAtPosition = playerPosition.clone().add(new THREE.Vector3(0, this.settings.lookHeight, 0));
        
        // Appliquer la position de la caméra avec ou sans lissage
        if (this.settings.smoothFollow) {
            this.camera.position.lerp(cameraPosition, this.settings.followSpeed);
        } else {
            this.camera.position.copy(cameraPosition);
        }
        
        // Faire regarder la caméra vers le personnage
        this.camera.lookAt(lookAtPosition);
    }
}

export default CameraController;