# Portfolio Interactif Three.js

Un portfolio interactif sous forme de petit jeu avec un personnage 3D développé avec Three.js. Ce projet vous permet de présenter vos compétences et projets dans un environnement 3D immersif et engageant.

![Portfolio Preview](https://via.placeholder.com/1200x600?text=Portfolio+Interactif+3D)

## ✨ Fonctionnalités

- **Monde 3D interactif** à explorer avec un personnage animé
- **Personnage personnalisable** avec animations fluides et contrôles intuitifs
- **Sections de portfolio** intégrées dans l'environnement sous forme de zones interactives
- **Architecture modulaire et extensible** permettant d'ajouter facilement de nouveaux éléments et fonctionnalités
- **Expérience responsive** adaptée à tous les appareils
- **Mode debug** avec panneau de contrôle pour personnaliser l'expérience

## 🚀 Installation

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

## 🎮 Contrôles

- **ZQSD / Flèches directionnelles** : Se déplacer
- **Souris** : Regarder autour
- **E / Clic** : Interagir avec les éléments
- **Espace** : Sauter
- **H** : Afficher/masquer l'aide des contrôles
- **Tab** : Afficher/masquer le panneau de debug
- **Echap** : Fermer les fenêtres de portfolio

## 🧩 Structure du projet

```
src/
├── assets/          # Ressources statiques (modèles, textures, sons)
├── components/      # Composants Three.js réutilisables
│   └── VisualComponent.js  # Composant visuel pour le personnage 3D
├── core/            # Moteur de jeu et fonctionnalités de base
│   ├── Game.js      # Classe principale du jeu
│   └── PortfolioManager.js  # Gestionnaire des sections de portfolio
├── entities/        # Entités du jeu
│   ├── Character.js  # Personnage contrôlable
│   └── InteractiveObject.js  # Objets interactifs
├── scenes/          # Différentes scènes/niveaux
├── styles/          # Feuilles de style CSS
│   └── main.css     # Styles principaux
├── utils/           # Fonctions utilitaires
│   └── utils.js     # Outils génériques
└── main.js          # Point d'entrée de l'application
```

## 🛠️ Technologies utilisées

- [Three.js](https://threejs.org/) - Bibliothèque 3D
- [Vite](https://vitejs.dev/) - Bundler et serveur de développement
- [Tweakpane](https://cocopon.github.io/tweakpane/) - Interface de debug
- [GSAP](https://greensock.com/gsap/) - Animation et transitions fluides

## 🎨 Personnalisation

Le portfolio peut être facilement personnalisé selon vos besoins :

1. **Projets** : Modifiez les données des projets dans `src/core/PortfolioManager.js`
2. **Apparence du personnage** : Personnalisez les couleurs et l'apparence dans `src/entities/Character.js`
3. **Environnement** : Modifiez le décor et les éléments dans `src/core/Game.js`
4. **Interface** : Adaptez les éléments d'UI dans `src/styles/main.css`

## 📋 To-Do / Améliorations possibles

- [ ] Ajouter un système de collision plus avancé
- [ ] Intégrer un chargeur de modèles GLTF pour des personnages plus complexes
- [ ] Ajouter des effets postprocessing (bloom, DoF, etc.)
- [ ] Optimiser les performances pour les appareils mobiles
- [ ] Créer un éditeur de niveau pour faciliter la création de scènes
- [ ] Ajouter un système de son et musique d'ambiance

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est distribué sous licence MIT. Voir le fichier `LICENSE` pour plus d'informations.

## 👨‍💻 Contact

Si vous avez des questions ou des suggestions, n'hésitez pas à me contacter sur GitHub.