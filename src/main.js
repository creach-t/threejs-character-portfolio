import Game from './core/Game.js';

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Lancement de l'application
    console.log('Initialisation du portfolio interactif...');
    window.game = new Game();
    
    // Instructions pour l'utilisateur
    console.log('Utilisez les touches ZQSD ou les flèches pour vous déplacer.');
    console.log('Appuyez sur E ou cliquez pour interagir avec les éléments.');
    console.log('Appuyez sur H pour afficher les contrôles.');
    console.log('Appuyez sur Tab pour ouvrir le panneau de debug.');
});