import * as THREE from 'three';
import { gsap } from 'gsap';

class InteractiveObject {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            position: options.position || new THREE.Vector3(0, 0, 0),
            rotation: options.rotation || new THREE.Euler(0, 0, 0),
            scale: options.scale || 1.0,
            color: options.color || 0x00aaff,
            interactionDistance: options.interactionDistance || 2.0,
            type: options.type || 'default',
            data: options.data || {},
            ...options
        };
        
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.options.position);
        this.mesh.rotation.copy(this.options.rotation);
        this.mesh.scale.multiplyScalar(this.options.scale);
        
        this.isInteractable = true;
        this.isHovered = false;
        
        // Créer l'objet 3D en fonction du type
        this.createMesh();
        
        // Ajouter au parent
        if (this.options.parent) {
            this.options.parent.add(this.mesh);
        } else {
            this.scene.add(this.mesh);
        }
        
        // Animation d'horloge pour les effets
        this.clock = new THREE.Clock();
        this.animatePulse();
    }
    
    createMesh() {
        switch(this.options.type) {
            case 'info':
                this.createInfoPoint();
                break;
            case 'project':
                this.createProjectDisplay();
                break;
            case 'portal':
                this.createPortal();
                break;
            default:
                this.createDefaultObject();
                break;
        }
    }
    
    createDefaultObject() {
        // Créer un objet interactif par défaut
        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
        const material = new THREE.MeshStandardMaterial({
            color: this.options.color,
            emissive: this.options.color,
            emissiveIntensity: 0.3,
            roughness: 0.4,
            metalness: 0.6
        });
        
        const sphere = new THREE.Mesh(geometry, material);
        sphere.castShadow = true;
        
        // Ajouter un socle
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.2, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.2
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.6;
        base.castShadow = true;
        base.receiveShadow = true;
        
        // Créer un groupe pour faciliter l'animation
        this.objectGroup = new THREE.Group();
        this.objectGroup.add(sphere);
        this.objectGroup.position.y = 0.5;
        
        this.mesh.add(this.objectGroup);
        this.mesh.add(base);
        
        // Référence au matériau pour les animations
        this.material = material;
    }
    
    createInfoPoint() {
        // Créer un point d'information (i)
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.1, 16);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.3
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.05;
        base.castShadow = true;
        base.receiveShadow = true;
        
        // Sphère d'information
        const sphereGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: this.options.color,
            emissive: this.options.color,
            emissiveIntensity: 0.3,
            roughness: 0.4,
            metalness: 0.6
        });
        
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.y = 0.5;
        sphere.castShadow = true;
        
        // Ajouter le symbole "i"
        const infoSymbol = new THREE.Group();
        
        // Point du i
        const dotGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
        dot.position.set(0, 0.6, 0.15);
        
        // Trait du i
        const lineGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8);
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const line = new THREE.Mesh(lineGeometry, lineMaterial);
        line.position.set(0, 0.45, 0.15);
        
        infoSymbol.add(dot);
        infoSymbol.add(line);
        
        // Groupe principal
        this.objectGroup = new THREE.Group();
        this.objectGroup.add(sphere);
        this.objectGroup.add(infoSymbol);
        
        this.mesh.add(this.objectGroup);
        this.mesh.add(base);
        
        // Référence au matériau pour les animations
        this.material = sphereMaterial;
    }
    
    createProjectDisplay() {
        // Créer un présentoir de projet
        const baseGeometry = new THREE.BoxGeometry(1.5, 0.1, 1.5);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.8,
            metalness: 0.5
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.05;
        base.castShadow = true;
        base.receiveShadow = true;
        
        // Piédestal
        const standGeometry = new THREE.BoxGeometry(0.2, 1, 0.2);
        const standMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.7
        });
        
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.y = 0.55;
        stand.castShadow = true;
        
        // Écran / hologramme
        const screenGeometry = new THREE.PlaneGeometry(1.2, 0.8);
        const screenMaterial = new THREE.MeshBasicMaterial({
            color: this.options.color,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.y = 1.3;
        screen.rotation.x = -Math.PI / 12;
        
        // Ajouter une image de projet simulée (texture simple)
        const projectImageGeometry = new THREE.PlaneGeometry(1, 0.6);
        const projectImageMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        
        const projectImage = new THREE.Mesh(projectImageGeometry, projectImageMaterial);
        projectImage.position.y = 1.3;
        projectImage.position.z = 0.01;
        projectImage.rotation.x = -Math.PI / 12;
        
        // Groupe principal
        this.objectGroup = new THREE.Group();
        this.objectGroup.add(screen);
        this.objectGroup.add(projectImage);
        
        this.mesh.add(base);
        this.mesh.add(stand);
        this.mesh.add(this.objectGroup);
        
        // Référence au matériau pour les animations
        this.material = screenMaterial;
    }
    
    createPortal() {
        // Créer un portail interactif
        const baseGeometry = new THREE.CylinderGeometry(1, 1.2, 0.2, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.8,
            metalness: 0.5
        });
        
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.1;
        base.castShadow = true;
        base.receiveShadow = true;
        
        // Anneau du portail
        const ringGeometry = new THREE.TorusGeometry(1, 0.1, 16, 32);
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: this.options.color,
            emissive: this.options.color,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.8
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.y = 1.5;
        ring.castShadow = true;
        
        // Surface du portail (effet holographique)
        const portalGeometry = new THREE.CircleGeometry(0.9, 32);
        const portalMaterial = new THREE.MeshBasicMaterial({
            color: this.options.color,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const portal = new THREE.Mesh(portalGeometry, portalMaterial);
        portal.position.y = 1.5;
        portal.position.z = 0.01;
        
        // Piliers de support
        const createPillar = (x) => {
            const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 8);
            const pillarMaterial = new THREE.MeshStandardMaterial({
                color: 0x555555,
                roughness: 0.6,
                metalness: 0.5
            });
            
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            pillar.position.set(x, 0.7, 0);
            pillar.castShadow = true;
            
            return pillar;
        };
        
        const leftPillar = createPillar(-0.8);
        const rightPillar = createPillar(0.8);
        
        // Groupe principal
        this.objectGroup = new THREE.Group();
        this.objectGroup.add(ring);
        this.objectGroup.add(portal);
        
        this.mesh.add(base);
        this.mesh.add(leftPillar);
        this.mesh.add(rightPillar);
        this.mesh.add(this.objectGroup);
        
        // Référence aux matériaux pour les animations
        this.material = portalMaterial;
        this.ringMaterial = ringMaterial;
    }
    
    animatePulse() {
        const animate = () => {
            if (!this.material) return;
            
            // Effet de pulsation subtile sur l'émissivité
            if (this.material.emissiveIntensity !== undefined) {
                const pulseFactor = 0.2 * Math.sin(this.clock.getElapsedTime() * 2) + 0.5;
                this.material.emissiveIntensity = pulseFactor;
            }
            
            // Effet de pulsation sur l'opacité pour les matériaux transparents
            if (this.material.transparent) {
                const opacityPulse = 0.2 * Math.sin(this.clock.getElapsedTime() * 1.5) + 0.7;
                this.material.opacity = opacityPulse;
            }
            
            // Animation de rotation pour certains types d'objets
            if (this.objectGroup) {
                if (this.options.type === 'portal') {
                    this.objectGroup.rotation.y += 0.005;
                } else if (this.options.type === 'default') {
                    this.objectGroup.rotation.y += 0.01;
                }
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    onHover() {
        if (!this.isInteractable) return;
        
        this.isHovered = true;
        
        // Animation d'effet surbrillance
        gsap.to(this.objectGroup.scale, {
            x: 1.1,
            y: 1.1,
            z: 1.1,
            duration: 0.3,
            ease: "back.out(1.5)"
        });
        
        if (this.material) {
            // Augmenter l'intensité d'émission
            if (this.material.emissiveIntensity !== undefined) {
                gsap.to(this.material, {
                    emissiveIntensity: 1.0,
                    duration: 0.3
                });
            }
        }
    }
    
    onUnhover() {
        if (!this.isInteractable) return;
        
        this.isHovered = false;
        
        // Animation de retour à la normale
        gsap.to(this.objectGroup.scale, {
            x: 1.0,
            y: 1.0,
            z: 1.0,
            duration: 0.3,
            ease: "power2.out"
        });
        
        if (this.material) {
            // Restaurer l'intensité d'émission
            if (this.material.emissiveIntensity !== undefined) {
                gsap.to(this.material, {
                    emissiveIntensity: 0.5,
                    duration: 0.3
                });
            }
        }
    }
    
    onInteract(character) {
        if (!this.isInteractable) return;
        
        // Animation d'interaction
        gsap.to(this.objectGroup.scale, {
            x: 1.3,
            y: 1.3,
            z: 1.3,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });
        
        // Effet de rebond
        gsap.to(this.objectGroup.position, {
            y: this.objectGroup.position.y + 0.3,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
        });
        
        // Exécuter la callback d'interaction si elle existe
        if (this.options.onInteract) {
            this.options.onInteract(this, character);
        }
        
        // Jouer un son d'interaction (à implémenter)
        // this.playInteractionSound();
    }
    
    setInteractable(value) {
        this.isInteractable = value;
        
        if (!value) {
            // Effet visuel pour indiquer que l'objet n'est pas interactif
            if (this.material) {
                gsap.to(this.material, {
                    opacity: 0.5,
                    duration: 0.5
                });
            }
        } else {
            // Restaurer l'apparence normale
            if (this.material) {
                gsap.to(this.material, {
                    opacity: 1.0,
                    duration: 0.5
                });
            }
        }
    }
    
    update(delta, character) {
        // Vérifier la distance avec le personnage pour l'interaction
        if (character && this.isInteractable) {
            const distance = character.mesh.position.distanceTo(this.mesh.position);
            
            if (distance <= this.options.interactionDistance) {
                if (!this.isHovered) {
                    this.onHover();
                }
            } else if (this.isHovered) {
                this.onUnhover();
            }
        }
    }
    
    dispose() {
        // Nettoyer les ressources
        const disposeObject = (obj) => {
            if (obj.geometry) obj.geometry.dispose();
            
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => mat.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            
            if (obj.children && obj.children.length > 0) {
                [...obj.children].forEach(child => {
                    disposeObject(child);
                    obj.remove(child);
                });
            }
        };
        
        disposeObject(this.mesh);
        
        // Supprimer de la scène
        if (this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        } else {
            this.scene.remove(this.mesh);
        }
    }
}

export default InteractiveObject;