/**
 * Classe qui gère l'interface utilisateur du jeu
 */
class UIManager {
    /**
     * Initialise le gestionnaire d'interface utilisateur
     */
    constructor() {
        // Éléments de l'interface
        this.loadingScreen = document.getElementById('loading-screen');
        this.controlsHelp = document.getElementById('controls-help');
        this.uiContainer = document.getElementById('ui-container');
        
        // Initialisation
        this.initialize();
    }
    
    /**
     * Initialise les éléments de l'interface utilisateur
     */
    initialize() {
        // Cacher l'écran de chargement après un court délai
        setTimeout(() => {
            this.hideLoadingScreen();
        }, 1500);
        
        // Mettre à jour le texte d'aide pour inclure tous les contrôles
        this.updateControlsHelp();
    }
    
    /**
     * Met à jour le texte d'aide des contrôles
     */
    updateControlsHelp() {
        if (this.controlsHelp) {
            this.controlsHelp.innerHTML = `
                <p>ZQSD / Flèches : Se déplacer</p>
                <p>Souris : Regarder autour</p>
                <p>E / Clic : Interagir</p>
                <p>Espace : Sauter</p>
                <p>M : Changer le mode de caméra</p>
                <p>H : Afficher l'aide</p>
                <p>Tab : Mode debug</p>
            `;
        }
    }
    
    /**
     * Affiche l'écran de chargement
     */
    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
    }
    
    /**
     * Cache l'écran de chargement
     */
    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    }
    
    /**
     * Affiche les contrôles d'aide
     * @param {number} duration - Durée d'affichage en millisecondes (0 pour permanent)
     */
    showControlsHelp(duration = 5000) {
        if (this.controlsHelp) {
            this.controlsHelp.classList.remove('hidden');
            
            // Cacher après la durée spécifiée si > 0
            if (duration > 0) {
                setTimeout(() => {
                    this.controlsHelp.classList.add('hidden');
                }, duration);
            }
        }
    }
    
    /**
     * Bascule l'affichage des contrôles d'aide
     */
    toggleControlsHelp() {
        if (this.controlsHelp) {
            this.controlsHelp.classList.toggle('hidden');
        }
    }
    
    /**
     * Affiche un message temporaire à l'écran
     * @param {string} message - Le message à afficher
     * @param {number} duration - Durée d'affichage en millisecondes
     */
    showMessage(message, duration = 2000) {
        // Créer un élément de message s'il n'existe pas déjà
        let messageElement = document.getElementById('game-message');
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'game-message';
            messageElement.style.position = 'absolute';
            messageElement.style.top = '20%';
            messageElement.style.left = '50%';
            messageElement.style.transform = 'translate(-50%, -50%)';
            messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            messageElement.style.color = 'white';
            messageElement.style.padding = '10px 20px';
            messageElement.style.borderRadius = '5px';
            messageElement.style.fontSize = '18px';
            messageElement.style.fontFamily = 'Poppins, sans-serif';
            messageElement.style.pointerEvents = 'none';
            messageElement.style.zIndex = '100';
            messageElement.style.opacity = '0';
            messageElement.style.transition = 'opacity 0.3s';
            
            this.uiContainer.appendChild(messageElement);
        }
        
        // Afficher le message
        messageElement.textContent = message;
        messageElement.style.opacity = '1';
        
        // Cacher le message après un délai
        setTimeout(() => {
            messageElement.style.opacity = '0';
        }, duration);
    }
    
    /**
     * Crée et affiche un panneau modal
     * @param {string} title - Titre du panneau
     * @param {string} content - Contenu HTML du panneau
     * @param {Function} onClose - Fonction à exécuter lors de la fermeture
     */
    showModal(title, content, onClose = null) {
        // Créer un panneau modal s'il n'existe pas déjà
        let modalElement = document.getElementById('game-modal');
        if (!modalElement) {
            modalElement = document.createElement('div');
            modalElement.id = 'game-modal';
            modalElement.style.position = 'absolute';
            modalElement.style.top = '50%';
            modalElement.style.left = '50%';
            modalElement.style.transform = 'translate(-50%, -50%)';
            modalElement.style.backgroundColor = 'rgba(30, 30, 30, 0.95)';
            modalElement.style.color = 'white';
            modalElement.style.padding = '20px';
            modalElement.style.borderRadius = '10px';
            modalElement.style.minWidth = '60%';
            modalElement.style.maxWidth = '80%';
            modalElement.style.maxHeight = '80%';
            modalElement.style.overflow = 'auto';
            modalElement.style.zIndex = '200';
            modalElement.style.opacity = '0';
            modalElement.style.transition = 'opacity 0.3s';
            modalElement.style.backdropFilter = 'blur(10px)';
            
            this.uiContainer.appendChild(modalElement);
        }
        
        // Créer le contenu du modal
        modalElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h2 style="margin: 0; font-size: 24px;">${title}</h2>
                <button id="modal-close-btn" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
            </div>
            <div id="modal-content">
                ${content}
            </div>
        `;
        
        // Afficher le modal
        modalElement.style.opacity = '1';
        
        // Ajouter un écouteur d'événement pour le bouton de fermeture
        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideModal();
                if (onClose) onClose();
            });
        }
        
        // Ajouter un écouteur d'événement pour la touche Escape
        const escapeHandler = (e) => {
            if (e.code === 'Escape') {
                this.hideModal();
                if (onClose) onClose();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    /**
     * Cache le panneau modal
     */
    hideModal() {
        const modalElement = document.getElementById('game-modal');
        if (modalElement) {
            modalElement.style.opacity = '0';
            setTimeout(() => {
                if (modalElement.parentNode) {
                    modalElement.parentNode.removeChild(modalElement);
                }
            }, 300);
        }
    }
}

export default UIManager;