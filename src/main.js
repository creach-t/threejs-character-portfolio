import Game from './core/Game.js';

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation de l'application
    console.log('Initialisation du portfolio interactif...');
    
    // Créer l'instance du jeu
    window.game = new Game();
    
    // Afficher des messages d'instructions dans la console pour le développement
    console.log('-----------------------------------');
    console.log('Portfolio interactif - Instructions');
    console.log('-----------------------------------');
    console.log('Contrôles:');
    console.log('- ZQSD/Flèches : Se déplacer');
    console.log('- Souris : Regarder autour');
    console.log('- E : Interagir avec les éléments');
    console.log('- Espace : Sauter');
    console.log('- M : Changer le mode de caméra (clavier/souris/hybride)');
    console.log('- H : Afficher/masquer l\'aide');
    console.log('- Tab : Mode debug (caméra libre)');
    console.log('-----------------------------------');
    console.log('Modes de caméra :');
    console.log('- clavier : la caméra suit la rotation du personnage');
    console.log('- souris : la caméra est contrôlée uniquement par la souris');
    console.log('- hybride : combinaison des deux modes (par défaut)');
    console.log('-----------------------------------');
});