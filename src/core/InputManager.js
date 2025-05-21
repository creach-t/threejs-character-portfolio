/**
 * Classe qui gère les entrées utilisateur (clavier, souris)
 */
class InputManager {
    /**
     * Initialise le gestionnaire d'entrées
     * @param {Object} game - Instance principale du jeu
     * @param {HTMLElement} domElement - L'élément DOM pour les événements
     */
    constructor(game, domElement) {
        this.game = game;
        this.domElement = domElement;
        
        // État des touches
        this.keys = {};
        
        // Mettre en place les écouteurs d'événements
        this.setupEventListeners();
    }
    
    /**
     * Configure les écouteurs d'événements
     */
    setupEventListeners() {
        // Contrôles clavier
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));
        
        // Redimensionnement de la fenêtre
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    /**
     * Gestionnaire d'événement keydown
     * @param {KeyboardEvent} event - L'événement keydown
     */
    onKeyDown(event) {
        // Mettre à jour l'état des touches
        this.keys[event.code] = true;
        
        // Transmettre l'événement au personnage
        if (this.game.character) {
            this.game.character.handleKeyDown(event);
        }
        
        // Gestion des touches spéciales
        this.handleSpecialKeys(event);
    }
    
    /**
     * Gestionnaire d'événement keyup
     * @param {KeyboardEvent} event - L'événement keyup
     */
    onKeyUp(event) {
        // Mettre à jour l'état des touches
        this.keys[event.code] = false;
        
        // Transmettre l'événement au personnage
        if (this.game.character) {
            this.game.character.handleKeyUp(event);
        }
    }
    
    /**
     * Gestionnaire pour les touches spéciales qui contrôlent le jeu
     * @param {KeyboardEvent} event - L'événement keydown
     */
    handleSpecialKeys(event) {
        // Ouvrir/fermer le mode debug avec la touche Tab
        if (event.code === 'Tab') {
            event.preventDefault();
            const debugEnabled = this.game.cameraController.toggleOrbitControls();
            this.game.uiManager.showMessage(`Mode debug: ${debugEnabled ? 'activé' : 'désactivé'}`);
        }
        
        // Afficher les contrôles avec la touche H
        if (event.code === 'KeyH') {
            this.game.uiManager.toggleControlsHelp();
        }
        
        // Changer le mode de contrôle avec la touche M
        if (event.code === 'KeyM') {
            const newMode = this.game.cameraController.toggleControlMode();
            this.game.uiManager.showMessage(`Mode de contrôle : ${newMode}`);
        }
    }
    
    /**
     * Gestionnaire de redimensionnement de la fenêtre
     */
    onWindowResize() {
        // Mettre à jour la caméra et le renderer
        if (this.game.camera && this.game.renderer) {
            this.game.camera.aspect = window.innerWidth / window.innerHeight;
            this.game.camera.updateProjectionMatrix();
            this.game.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    /**
     * Vérifie si une touche est actuellement enfoncée
     * @param {string} code - Le code de la touche à vérifier
     * @return {boolean} True si la touche est enfoncée, false sinon
     */
    isKeyPressed(code) {
        return this.keys[code] === true;
    }
    
    /**
     * Mise à jour du gestionnaire d'entrées
     */
    update() {
        // Cette méthode peut être étendue pour gérer des comportements 
        // plus complexes qui nécessitent une mise à jour à chaque frame
    }
}

export default InputManager;