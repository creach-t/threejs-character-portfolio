import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pane } from 'tweakpane';
import Character from '../entities/Character.js';
import InteractiveObject from '../entities/InteractiveObject.js';
import PortfolioManager from './PortfolioManager.js';

class Game {
    constructor() {
        // DOM Elements
        this.canvas = document.getElementById('game-canvas');
        this.loadingScreen = document.getElementById('loading-screen');
        this.controlsHelp = document.getElementById('controls-help');
        this.debugPanel = document.getElementById('debug-panel');
        
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true 
        });
        
        // Système de rendu
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        
        // Horloge
        this.clock = new THREE.Clock();
        
        // Gestionnaire de portfolio
        this.portfolioManager = new PortfolioManager();
        
        // Collections 
        this.interactiveObjects = [];
        
        // Configuration initiale
        this.setupCamera();
        this.setupLights();
        this.setupEnvironment();
        this.setupCharacter();
        
        // Démarrer la boucle de rendu avant de configurer le panneau de debug
        // pour éviter les erreurs liées à l'importation asynchrone de Tweakpane
        this.animate();
        
        // Configuration du panneau de debug et des événements après l'initialisation
        // de l'animation pour éviter le blocage du rendu en cas d'erreur
        setTimeout(() => {
            try {
                this.setupDebugPanel();
            } catch (error) {
                console.warn('Le panneau de debug n\'a pas pu être initialisé:', error);
            }
            this.setupEventListeners();
            this.showControlsHelp();
        }, 100);
    }
    
    setupCamera() {
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Créer des contrôles d'orbite pour le développement
        this.orbitControls = new OrbitControls(this.camera, this.canvas);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.05;
        this.orbitControls.enabled = false; // Désactivé par défaut, activé uniquement en mode debug
    }
    
    setupLights() {
        // Lumière ambiante
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);
        
        // Lumière directionnelle principale (soleil)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 10, 5);
        this.directionalLight.castShadow = true;
        
        // Configuration des ombres
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 50;
        this.directionalLight.shadow.camera.left = -15;
        this.directionalLight.shadow.camera.right = 15;
        this.directionalLight.shadow.camera.top = 15;
        this.directionalLight.shadow.camera.bottom = -15;
        
        this.scene.add(this.directionalLight);
        
        // Lumière d'appoint
        this.fillLight = new THREE.DirectionalLight(0x8ec7ff, 0.5);
        this.fillLight.position.set(-5, 3, -5);
        this.scene.add(this.fillLight);
    }
    
    setupEnvironment() {
        // Couleur de fond
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Brouillard pour l'ambiance
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);
        
        // Sol
        const floorGeometry = new THREE.PlaneGeometry(100, 100);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x7cbb7a,
            roughness: 0.8,
            metalness: 0.1
        });
        
        this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
        this.floor.rotation.x = -Math.PI / 2;
        this.floor.receiveShadow = true;
        this.scene.add(this.floor);
        
        // Ajouter quelques éléments décoratifs
        this.addEnvironmentElements();
        
        // Ajouter des objets interactifs pour le portfolio
        this.addPortfolioElements();
    }
    
    addEnvironmentElements() {
        // Arbres stylisés
        const treePositions = [
            { x: 10, z: 10 },
            { x: -8, z: 12 },
            { x: 15, z: -5 },
            { x: -12, z: -8 },
            { x: 5, z: -15 }
        ];
        
        treePositions.forEach(pos => {
            const tree = this.createStylizedTree();
            tree.position.set(pos.x, 0, pos.z);
            this.scene.add(tree);
        });
        
        // Nuages
        for (let i = 0; i < 15; i++) {
            const cloud = this.createCloud();
            const radius = 30 + Math.random() * 20;
            const angle = Math.random() * Math.PI * 2;
            
            cloud.position.set(
                Math.cos(angle) * radius,
                15 + Math.random() * 10,
                Math.sin(angle) * radius
            );
            
            this.scene.add(cloud);
        }
    }
    
    createStylizedTree() {
        const tree = new THREE.Group();
        
        // Tronc
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2.5, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8B4513,
            roughness: 0.9,
            metalness: 0.0
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1.25;
        trunk.castShadow = true;
        tree.add(trunk);
        
        // Feuillage
        const leavesGeometry = new THREE.IcosahedronGeometry(2, 0);
        const leavesMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x2e8b57,
            roughness: 0.8,
            metalness: 0.0
        });
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 3.5;
        leaves.scale.y = 1.5;
        leaves.castShadow = true;
        tree.add(leaves);
        
        return tree;
    }
    
    createCloud() {
        const cloud = new THREE.Group();
        
        const createCloudPuff = (x, y, z, size) => {
            const puffGeometry = new THREE.SphereGeometry(size, 16, 16);
            const puffMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xffffff,
                roughness: 0.9,
                metalness: 0.0,
                transparent: true,
                opacity: 0.9
            });
            
            const puff = new THREE.Mesh(puffGeometry, puffMaterial);
            puff.position.set(x, y, z);
            cloud.add(puff);
        };
        
        const cloudSize = 1 + Math.random() * 2;
        
        // Créer plusieurs sphères pour former un nuage
        createCloudPuff(0, 0, 0, cloudSize);
        createCloudPuff(cloudSize * 0.8, 0, 0, cloudSize * 0.6);
        createCloudPuff(-cloudSize * 0.8, 0, 0, cloudSize * 0.6);
        createCloudPuff(0, 0, cloudSize * 0.7, cloudSize * 0.7);
        createCloudPuff(0, 0, -cloudSize * 0.7, cloudSize * 0.7);
        
        return cloud;
    }
    
    addPortfolioElements() {
        // Zones interactives pour les sections du portfolio
        const projectsData = this.portfolioManager.getProjects();
        
        const projectPositions = [
            { x: 5, z: 0, rotation: -Math.PI / 4, title: 'Projets Web' },
            { x: 0, z: 5, rotation: 0, title: 'Applications Mobile' },
            { x: -5, z: 0, rotation: Math.PI / 4, title: 'Créations 3D' },
            { x: 0, z: -5, rotation: Math.PI, title: 'À propos de moi' }
        ];
        
        // Associer les positions avec les données du portfolio
        projectPositions.forEach((position, index) => {
            if (index < projectsData.length) {
                const projectData = projectsData[index];
                
                // Créer une borne interactive
                const interactiveStation = this.createInteractiveStation(
                    position.title, 
                    projectData.id,
                    0x9370DB
                );
                
                interactiveStation.position.set(position.x, 0, position.z);
                interactiveStation.rotation.y = position.rotation;
                
                this.scene.add(interactiveStation);
                
                // Ajouter à la liste des objets interactifs
                this.interactiveObjects.push({
                    mesh: interactiveStation,
                    type: 'portfolio',
                    data: projectData,
                    onInteract: (character) => {
                        this.portfolioManager.showProject(projectData.id);
                    }
                });
            }
        });
    }
    
    createInteractiveStation(label, id, color = 0x00aaff) {
        const station = new THREE.Group();
        
        // Socle
        const baseGeometry = new THREE.CylinderGeometry(0.7, 0.9, 0.2, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.5
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.1;
        base.castShadow = true;
        station.add(base);
        
        // Support
        const standGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.2, 8);
        const standMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.5,
            metalness: 0.7
        });
        
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.y = 0.7;
        stand.castShadow = true;
        station.add(stand);
        
        // Élément interactif illuminé
        const glowGeometry = new THREE.IcosahedronGeometry(0.3, 2);
        const glowMaterial = new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.3,
            metalness: 0.8,
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = 1.4;
        glow.castShadow = true;
        station.add(glow);
        
        // Panneau de texte (simplement un placeholder visuel)
        const textPanelGeometry = new THREE.PlaneGeometry(2, 0.5);
        const textPanelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        const textPanel = new THREE.Mesh(textPanelGeometry, textPanelMaterial);
        textPanel.position.y = 1.8;
        textPanel.rotation.x = -Math.PI / 12;
        station.add(textPanel);
        
        // Animation subtile
        const animate = () => {
            glow.rotation.y += 0.01;
            glow.rotation.z += 0.005;
            
            // Effet de pulsation
            const pulseFactor = 0.05 * Math.sin(Date.now() * 0.002) + 1;
            glow.scale.set(pulseFactor, pulseFactor, pulseFactor);
            
            requestAnimationFrame(animate);
        };
        
        animate();
        
        // Ajouter une propriété pour identifier facilement cet objet
        station.userData = { type: 'station', id };
        
        return station;
    }
    
    setupCharacter() {
        // Créer le personnage
        this.character = new Character(this.scene, {
            position: new THREE.Vector3(0, 0, 0),
            bodyColor: 0xffceb4,
            hairColor: 0x3c2e28,
            eyeColor: 0x1E90FF,
            outfitColor: 0x9370DB
        });
        
        // Configuration de la caméra pour suivre le personnage
        this.followCamera = true;
        this.thirdPersonCameraOffset = new THREE.Vector3(0, 3, 6);
    }
    
    setupDebugPanel() {
        try {
            // Créer un panneau de debug avec tweakpane
            this.debugPane = new Pane({
                container: this.debugPanel
            });
            
            // Paramètres du jeu
            const gameSettings = { 
                followCamera: this.followCamera,
                orbitControls: false
            };
            
            // Onglet de debug pour les paramètres du jeu
            const gameTab = this.debugPane.addFolder({ title: 'Paramètres du jeu' });
            
            // Ajouter les contrôles
            gameTab.addInput(gameSettings, 'followCamera', { label: 'Caméra 3e personne' })
                .on('change', (ev) => {
                    this.followCamera = ev.value;
                });
            
            gameTab.addInput(gameSettings, 'orbitControls', { label: 'Contrôles d\'orbite' })
                .on('change', (ev) => {
                    this.orbitControls.enabled = ev.value;
                    this.followCamera = !ev.value;
                });
            
            // Onglet de debug pour les paramètres du personnage
            const characterTab = this.debugPane.addFolder({ title: 'Personnage' });
            
            // Couleurs du personnage
            const characterColors = {
                bodyColor: '#ffceb4',
                hairColor: '#3c2e28',
                eyeColor: '#1E90FF',
                outfitColor: '#9370DB'
            };
            
            // Fonction de mise à jour des couleurs
            const updateCharacterColors = () => {
                if (this.character) {
                    this.character.updateColors({
                        bodyColor: parseInt(characterColors.bodyColor.replace('#', '0x')),
                        hairColor: parseInt(characterColors.hairColor.replace('#', '0x')),
                        eyeColor: parseInt(characterColors.eyeColor.replace('#', '0x')),
                        outfitColor: parseInt(characterColors.outfitColor.replace('#', '0x'))
                    });
                }
            };
            
            // Ajouter les contrôles de couleur
            characterTab.addInput(characterColors, 'bodyColor', { label: 'Couleur de peau' })
                .on('change', updateCharacterColors);
            
            characterTab.addInput(characterColors, 'hairColor', { label: 'Couleur de cheveux' })
                .on('change', updateCharacterColors);
            
            characterTab.addInput(characterColors, 'eyeColor', { label: 'Couleur des yeux' })
                .on('change', updateCharacterColors);
            
            characterTab.addInput(characterColors, 'outfitColor', { label: 'Couleur de tenue' })
                .on('change', updateCharacterColors);
            
            // Cacher le panneau de debug par défaut
            this.debugPane.hidden = true;
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du panneau de debug:', error);
        }
    }
    
    toggleDebugPanel() {
        if (this.debugPane) {
            this.debugPane.hidden = !this.debugPane.hidden;
        }
    }
    
    setupEventListeners() {
        // Redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Contrôles clavier
        window.addEventListener('keydown', (e) => {
            if (this.character) {
                this.character.handleKeyDown(e);
            }
            
            // Ouvrir/fermer le panneau de debug avec la touche Tab
            if (e.code === 'Tab') {
                e.preventDefault();
                this.toggleDebugPanel();
            }
            
            // Afficher les contrôles avec la touche H
            if (e.code === 'KeyH') {
                this.toggleControlsHelp();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (this.character) {
                this.character.handleKeyUp(e);
            }
        });
        
        // Cacher l'écran de chargement après un court délai
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
        }, 1500);
    }
    
    showControlsHelp() {
        this.controlsHelp.classList.remove('hidden');
        
        // Cacher après 5 secondes
        setTimeout(() => {
            this.controlsHelp.classList.add('hidden');
        }, 5000);
    }
    
    toggleControlsHelp() {
        this.controlsHelp.classList.toggle('hidden');
    }
    
    updateCamera() {
        if (this.followCamera && this.character) {
            // Position de la caméra en mode troisième personne
            const targetPosition = this.character.mesh.position.clone();
            
            // Calculer l'offset de la caméra par rapport à la rotation du personnage
            const offset = this.thirdPersonCameraOffset.clone();
            const rotation = this.character.mesh.rotation.y;
            
            const rotatedX = offset.x * Math.cos(rotation) + offset.z * Math.sin(rotation);
            const rotatedZ = -offset.x * Math.sin(rotation) + offset.z * Math.cos(rotation);
            
            offset.x = rotatedX;
            offset.z = rotatedZ;
            
            // Appliquer l'offset à la position cible
            const cameraTargetPosition = targetPosition.clone().add(offset);
            
            // Animation douce de la caméra
            this.camera.position.lerp(cameraTargetPosition, 0.05);
            
            // Faire regarder la caméra vers le personnage
            const lookAtPosition = targetPosition.clone().add(new THREE.Vector3(0, 1.7, 0));
            this.camera.lookAt(lookAtPosition);
        }
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        
        // Mettre à jour les contrôles d'orbite si activés
        if (this.orbitControls && this.orbitControls.enabled) {
            this.orbitControls.update();
        }
        
        // Mettre à jour le personnage
        if (this.character) {
            this.character.update(delta, this.camera);
            this.character.checkInteractions(this.interactiveObjects, this.camera);
        }
        
        // Mettre à jour la caméra
        this.updateCamera();
        
        // Rendu de la scène
        this.renderer.render(this.scene, this.camera);
    }
}

export default Game;