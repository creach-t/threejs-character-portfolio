import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Character from '../entities/Character.js';
import InteractiveObject from '../entities/InteractiveObject.js';
import PortfolioManager from './PortfolioManager.js';
import CameraController from './CameraController.js';
import InputManager from './InputManager.js';
import UIManager from './UIManager.js';

class Game {
    constructor() {
        // DOM Elements
        this.canvas = document.getElementById('game-canvas');
        
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
        
        // Gestionnaires
        this.uiManager = new UIManager();
        this.inputManager = new InputManager(this, this.canvas);
        this.portfolioManager = new PortfolioManager(this.uiManager);
        
        // Initialiser le contrôleur de caméra
        this.cameraController = new CameraController(this.camera, this.canvas);
        
        // Collections 
        this.interactiveObjects = [];
        
        // Configuration initiale
        this.setupScene();
        this.setupCharacter();
        
        // Démarrer la boucle de rendu
        this.animate();
        
        // Afficher les contrôles d'aide
        this.uiManager.showControlsHelp();
    }
    
    setupScene() {
        // Initialiser la caméra
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
        
        // Couleur de fond
        this.scene.background = new THREE.Color(0x87CEEB);
        
        // Brouillard pour l'ambiance
        this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.02);
        
        // Ajouter les lumières
        this.setupLights();
        
        // Ajouter le sol
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
        
        // Ajouter les éléments décoratifs
        this.addEnvironmentElements();
        
        // Ajouter les objets interactifs pour le portfolio
        this.addPortfolioElements();
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
        
        // Configurer le contrôleur de caméra pour suivre le personnage
        this.cameraController.setTarget(this.character);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        const delta = this.clock.getDelta();
        
        // Mettre à jour les entrées
        this.inputManager.update();
        
        // Mettre à jour la caméra
        this.cameraController.update(delta);
        
        // Mettre à jour le personnage
        if (this.character) {
            this.character.update(delta, this.camera);
            this.character.checkInteractions(this.interactiveObjects, this.camera);
        }
        
        // Rendu de la scène
        this.renderer.render(this.scene, this.camera);
    }
    
    // Méthode pour redimensionner la fenêtre
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

export default Game;