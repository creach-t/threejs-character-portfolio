import * as THREE from 'three';
import VisualComponent from '../components/VisualComponent.js';
import { gsap } from 'gsap';

class Character {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.options = {
            position: options.position || new THREE.Vector3(0, 0, 0),
            rotation: options.rotation || new THREE.Euler(0, 0, 0),
            scale: options.scale || 1.0,
            speed: options.speed || 5,
            turnSpeed: options.turnSpeed || 8,
            jumpForce: options.jumpForce || 10,
            gravity: options.gravity || 30,
            ...options
        };
        
        // États du personnage
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            interact: false
        };
        
        this.physics = {
            velocity: new THREE.Vector3(),
            grounded: true,
            jumped: false,
            getSpeed: () => this.physics.velocity.length()
        };
        
        // Création du mesh parent
        this.mesh = new THREE.Group();
        this.mesh.position.copy(this.options.position);
        this.mesh.rotation.copy(this.options.rotation);
        this.scene.add(this.mesh);
        
        // Ajout du composant visuel
        this.visual = new VisualComponent(this, {
            bodyColor: this.options.bodyColor,
            headColor: this.options.headColor,
            hairColor: this.options.hairColor,
            eyeColor: this.options.eyeColor,
            outfitColor: this.options.outfitColor,
            scale: this.options.scale
        });
        
        // Création du collider
        this.setupCollider();
        
        // Config pour la camera follow
        this.cameraTarget = new THREE.Object3D();
        this.cameraTarget.position.set(0, 1.7, 0);
        this.mesh.add(this.cameraTarget);
        
        // État de l'animation
        this.state = 'idle';
        this.animDuration = 0;
        
        // Flag d'interaction
        this.isInteracting = false;
    }
    
    setupCollider() {
        // Utilisation d'un cylindre comme collider pour le personnage
        const colliderGeo = new THREE.CylinderGeometry(0.4, 0.4, 2, 8);
        const colliderMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, 
            wireframe: true,
            visible: false  // Invisible par défaut
        });
        
        this.collider = new THREE.Mesh(colliderGeo, colliderMat);
        this.collider.position.y = 1; // Centre du corps
        this.mesh.add(this.collider);
    }
    
    // Gestion des contrôles utilisateur
    handleKeyDown(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveState.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveState.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveState.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveState.right = true;
                break;
            case 'Space':
                if (this.physics.grounded) {
                    this.moveState.jump = true;
                }
                break;
            case 'KeyE':
                this.moveState.interact = true;
                this.isInteracting = true;
                break;
        }
    }
    
    handleKeyUp(event) {
        switch(event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.moveState.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.moveState.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.moveState.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.moveState.right = false;
                break;
            case 'Space':
                this.moveState.jump = false;
                break;
            case 'KeyE':
                this.moveState.interact = false;
                // Nous ne réinitialisons pas isInteracting ici pour permettre à l'interaction d'être détectée
                // même si la touche est relâchée entre les frames
                break;
        }
    }
    
    // Méthode pour mettre à jour les mouvement du personnage
    update(delta, camera) {
        this.updateMovement(delta, camera);
        this.updatePhysics(delta);
        
        // Mise à jour du visuel
        if (this.visual) {
            this.visual.update(delta);
        }
    }
    
    updateMovement(delta, camera) {
        // Calculer la direction de la caméra
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        // Calculer la direction perpendiculaire (droite)
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(new THREE.Vector3(0, 1, 0), cameraDirection);
        
        // Vitesse de base
        const speedMultiplier = delta * this.options.speed;
        
        // Réinitialiser la vitesse horizontale
        this.physics.velocity.x = 0;
        this.physics.velocity.z = 0;
        
        // Application des mouvements
        if (this.moveState.forward) {
            this.physics.velocity.add(cameraDirection.clone().multiplyScalar(speedMultiplier));
        }
        
        if (this.moveState.backward) {
            this.physics.velocity.add(cameraDirection.clone().multiplyScalar(-speedMultiplier));
        }
        
        // Inverser les directions gauche/droite pour corriger le comportement
        if (this.moveState.left) {
            // Correction: utilisez une valeur positive pour le mouvement vers la gauche
            this.physics.velocity.add(cameraRight.clone().multiplyScalar(-speedMultiplier));
        }
        
        if (this.moveState.right) {
            // Correction: utilisez une valeur négative pour le mouvement vers la droite
            this.physics.velocity.add(cameraRight.clone().multiplyScalar(speedMultiplier));
        }
        
        // Appliquer le saut
        if (this.moveState.jump && this.physics.grounded && !this.physics.jumped) {
            this.physics.velocity.y = this.options.jumpForce;
            this.physics.grounded = false;
            this.physics.jumped = true;
            
            // Animation de saut
            gsap.to(this.mesh.position, {
                y: this.mesh.position.y + 0.2,
                duration: 0.2,
                ease: "power2.out",
                onComplete: () => {
                    gsap.to(this.mesh.position, {
                        y: this.mesh.position.y,
                        duration: 0.2,
                        ease: "power2.in"
                    });
                }
            });
        }
        
        // Orientation du personnage en fonction de la direction
        if (this.physics.velocity.x !== 0 || this.physics.velocity.z !== 0) {
            const newDirection = new THREE.Vector3(this.physics.velocity.x, 0, this.physics.velocity.z).normalize();
            const targetRotation = Math.atan2(newDirection.x, newDirection.z);
            
            // Lisser la rotation
            const currentRotation = this.mesh.rotation.y;
            const rotationDiff = targetRotation - currentRotation;
            
            // Adapter la rotation pour prendre le chemin le plus court
            let adjustedRotation = rotationDiff;
            if (rotationDiff > Math.PI) adjustedRotation = rotationDiff - Math.PI * 2;
            if (rotationDiff < -Math.PI) adjustedRotation = rotationDiff + Math.PI * 2;
            
            // Appliquer la rotation lissée
            this.mesh.rotation.y += adjustedRotation * Math.min(delta * this.options.turnSpeed, 1);
        }
    }
    
    updatePhysics(delta) {
        // Appliquer la gravité
        if (!this.physics.grounded) {
            this.physics.velocity.y -= this.options.gravity * delta;
        }
        
        // Déplacement
        this.mesh.position.x += this.physics.velocity.x;
        this.mesh.position.y += this.physics.velocity.y * delta;
        this.mesh.position.z += this.physics.velocity.z;
        
        // Détection du sol (temporaire)
        if (this.mesh.position.y < 0) {
            this.mesh.position.y = 0;
            this.physics.velocity.y = 0;
            this.physics.grounded = true;
            this.physics.jumped = false;
        }
    }
    
    // Méthode pour faire interagir le personnage avec un objet
    interact(interactable) {
        // Vérifier si la touche d'interaction est pressée ou a été pressée récemment
        if (this.moveState.interact || this.isInteracting) {
            interactable.onInteract(this);
            
            // Animation simple d'interaction
            gsap.to(this.visual.parts.rightArm.rotation, {
                x: -Math.PI * 0.4,
                duration: 0.3,
                ease: "power1.out",
                onComplete: () => {
                    gsap.to(this.visual.parts.rightArm.rotation, {
                        x: 0,
                        duration: 0.3,
                        ease: "power1.in"
                    });
                }
            });
            
            // Réinitialiser le flag après l'interaction
            this.isInteracting = false;
            
            return true;
        }
        
        return false;
    }
    
    // Méthode pour changer la couleur du personnage
    updateColors(colors = {}) {
        if (this.visual) {
            this.visual.setColors(colors);
        }
    }
    
    // Méthode pour vérifier les collisions avec les objets interactifs
    checkInteractions(interactables, camera) {
        // Si aucun objet interactif, ne rien faire
        if (!interactables || interactables.length === 0) {
            return false;
        }
        
        // Obtenir la direction de la caméra
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        
        // Créer un raycaster pour détecter les objets en face du personnage
        const raycaster = new THREE.Raycaster(
            this.mesh.position.clone().add(new THREE.Vector3(0, 1, 0)),
            cameraDirection,
            0,  // Distance minimale
            3   // Distance maximale d'interaction
        );
        
        // Obtenir tous les meshes interactifs
        const interactableMeshes = [];
        interactables.forEach(item => {
            if (item.mesh) {
                interactableMeshes.push(item.mesh);
            }
        });
        
        // Vérifier les intersections
        const intersects = raycaster.intersectObjects(interactableMeshes, true);
        
        if (intersects.length > 0) {
            // Trouver l'objet interactif correspondant à l'objet intersecté
            for (let i = 0; i < intersects.length; i++) {
                const intersectedObj = intersects[i].object;
                
                // Chercher l'objet interactif qui contient ce mesh
                for (let j = 0; j < interactables.length; j++) {
                    const interactable = interactables[j];
                    
                    if (interactable.mesh === intersectedObj || 
                        (interactable.mesh && intersectedObj.isDescendantOf && 
                         intersectedObj.isDescendantOf(interactable.mesh)) ||
                        this.isDescendantOf(intersectedObj, interactable.mesh)) {
                        
                        return this.interact(interactable);
                    }
                }
            }
        }
        
        return false;
    }
    
    // Méthode utilitaire pour vérifier si un objet est descendant d'un autre
    isDescendantOf(child, parent) {
        let current = child;
        while (current) {
            if (current === parent) {
                return true;
            }
            current = current.parent;
        }
        return false;
    }
    
    // Méthode pour nettoyer les ressources
    dispose() {
        if (this.visual) {
            this.visual.onRemove();
        }
        
        if (this.collider) {
            this.collider.geometry.dispose();
            this.collider.material.dispose();
            this.mesh.remove(this.collider);
        }
        
        this.scene.remove(this.mesh);
    }
}

export default Character;