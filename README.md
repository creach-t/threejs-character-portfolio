# Portfolio Interactif Three.js

Un portfolio interactif sous forme de petit jeu avec un personnage 3D développé avec Three.js.

## Fonctionnalités

- Monde 3D interactif à explorer
- Personnage personnalisable avec animations fluides
- Sections de portfolio intégrées dans l'environnement 3D
- Architecture modulaire et extensible
- Expérience responsive adaptée à tous les appareils

## Installation

```bash
# Cloner le repository
git clone https://github.com/creach-t/threejs-character-portfolio.git

# Naviguer dans le dossier du projet
cd threejs-character-portfolio

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Structure du projet

```
src/
├── assets/          # Ressources statiques (modèles, textures, sons)
├── components/      # Composants Three.js réutilisables
├── core/            # Moteur de jeu et fonctionnalités de base
├── entities/        # Entités du jeu (personnage, objets interactifs)
├── scenes/          # Différentes scènes du portfolio
├── utils/           # Fonctions utilitaires
└── main.js          # Point d'entrée de l'application
```

## Technologies utilisées

- Three.js - Bibliothèque 3D
- Vite - Bundler et serveur de développement
- Tweakpane - Interface de debug
- GSAP - Animations et transitions fluides

## License

MIT