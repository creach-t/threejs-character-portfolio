import * as THREE from 'three';

class VisualComponent {
    constructor(entity, options = {}) {
        this.entity = entity;
        this.config = {
            bodyColor: options.bodyColor || 0xffceb4,
            headColor: options.headColor || 0xffceb4,
            hairColor: options.hairColor || 0x3c2e28,
            eyeColor: options.eyeColor || 0x1E90FF,
            outfitColor: options.outfitColor || 0x9370DB,
            scale: options.scale || 1.0
        };
        
        this.visualGroup = new THREE.Group();
        this.entity.mesh.add(this.visualGroup);
        
        this.parts = {
            head: null,
            body: null,
            leftArm: null,
            rightArm: null,
            leftLeg: null,
            rightLeg: null,
            hair: null,
            eyes: []
        };
        
        this.animationTime = 0;
        this.walking = false;
        
        this.createCharacter();
    }
    
    createCharacter() {
        this.createHead();
        this.createHair();
        this.createEyes();
        this.createBody();
        this.createArms();
        this.createLegs();
        
        this.visualGroup.scale.set(this.config.scale, this.config.scale, this.config.scale);
    }
    
    createHead() {
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.config.headColor,
            roughness: 0.3,
            metalness: 0.0
        });
        
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        headGeometry.scale(1.0, 1.1, 1.0);
        
        this.parts.head = new THREE.Mesh(headGeometry, headMaterial);
        this.parts.head.position.y = 2;
        this.parts.head.castShadow = true;
        
        this.visualGroup.add(this.parts.head);
        
        // Joues
        const cheekMaterial = new THREE.MeshBasicMaterial({
            color: 0xFF6B6B,
            transparent: true,
            opacity: 0.4
        });
        
        const cheekGeometry = new THREE.CircleGeometry(0.12, 16);
        
        const leftCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        leftCheek.position.set(-0.25, -0.1, 0.4);
        leftCheek.rotation.y = Math.PI * 0.25;
        this.parts.head.add(leftCheek);
        
        const rightCheek = new THREE.Mesh(cheekGeometry, cheekMaterial);
        rightCheek.position.set(0.25, -0.1, 0.4);
        rightCheek.rotation.y = -Math.PI * 0.25;
        this.parts.head.add(rightCheek);
        
        // Bouche
        const mouthGeometry = new THREE.BufferGeometry();
        const mouthCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-0.1, -0.25, 0.4),
            new THREE.Vector3(0, -0.3, 0.52),
            new THREE.Vector3(0.1, -0.25, 0.4)
        );
        
        mouthGeometry.setFromPoints(mouthCurve.getPoints(10));
        
        const mouthMaterial = new THREE.LineBasicMaterial({ 
            color: 0x000000,
            linewidth: 2
        });
        
        const mouth = new THREE.Line(mouthGeometry, mouthMaterial);
        this.parts.head.add(mouth);
    }
    
    createHair() {
        const hairMaterial = new THREE.MeshStandardMaterial({
            color: this.config.hairColor,
            roughness: 0.7,
            metalness: 0.0
        });
        
        const hairGeometry = new THREE.SphereGeometry(0.58, 46, 46, 0, Math.PI * 1.97, 0, Math.PI * 0.5);
        
        this.parts.hair = new THREE.Mesh(hairGeometry, hairMaterial);
        this.parts.hair.position.set(0, 0.15, 0);
        
        this.parts.head.add(this.parts.hair);
    }
    
    createEyes() {
        const materials = {
            white: new THREE.MeshBasicMaterial({ color: 0xFFFFFF }),
            iris: new THREE.MeshBasicMaterial({ color: this.config.eyeColor }),
            pupil: new THREE.MeshBasicMaterial({ color: 0x000000 }),
        };
        
        const geometries = {
            white: new THREE.SphereGeometry(0.12, 16, 16),
            iris: new THREE.SphereGeometry(0.07, 16, 16),
            pupil: new THREE.SphereGeometry(0.04, 16, 16),
        };
        
        // Créer les deux yeux
        const eyePositions = [
            { x: -0.18, z: 0.44, reflectionX: 0.03 },
            { x: 0.18, z: 0.44, reflectionX: -0.03 }
        ];
        
        eyePositions.forEach(pos => {
            const eyeGroup = new THREE.Group();
            eyeGroup.position.set(pos.x, 0, pos.z);
            
            const eyeWhite = new THREE.Mesh(geometries.white, materials.white);
            eyeGroup.add(eyeWhite);
            
            const iris = new THREE.Mesh(geometries.iris, materials.iris);
            iris.position.z = 0.06;
            eyeGroup.add(iris);
            
            const pupil = new THREE.Mesh(geometries.pupil, materials.pupil);
            pupil.position.z = 0.11;
            eyeGroup.add(pupil);
            
            this.parts.head.add(eyeGroup);
            this.parts.eyes.push(eyeGroup);
        });
    }
    
    createBody() {
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.config.bodyColor,
            roughness: 0.4,
            metalness: 0.0
        });
        
        const bodyGeometry = new THREE.CapsuleGeometry(0.3, 0.4, 16, 16);
        this.parts.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.parts.body.position.y = 1.0;
        this.parts.body.scale.set(1.1, 1.0, 0.9);
        
        const shouldersGeometry = new THREE.SphereGeometry(0.28, 18, 10);
        const shoulders = new THREE.Mesh(shouldersGeometry, bodyMaterial);
        shoulders.position.y = 1.3;
        shoulders.scale.set(1.2, 0.5, 0.9);
        shoulders.castShadow = true;
        
        this.visualGroup.add(this.parts.body);
        this.visualGroup.add(shoulders);
    }
    
    createArms() {
        const armMaterial = new THREE.MeshStandardMaterial({
            color: this.config.bodyColor,
            roughness: 0.4,
            metalness: 0.0
        });
        
        const armGeometry = new THREE.CapsuleGeometry(0.1, 0.4, 8, 8);
        const handGeometry = new THREE.SphereGeometry(0.1, 17, 17);
        
        // Créer les deux bras
        const armConfigs = [
            { name: 'leftArm', x: 0.2, rotZ: Math.PI * 0.13 },
            { name: 'rightArm', x: -0.2, rotZ: -Math.PI * 0.13 }
        ];
        
        armConfigs.forEach(config => {
            const armGroup = new THREE.Group();
            armGroup.position.set(config.x, 1.5, 0);
            armGroup.rotation.z = config.rotZ;
            
            const armMesh = new THREE.Mesh(armGeometry, armMaterial);
            armMesh.geometry.translate(0, -0.23, 0);
            armMesh.castShadow = true;
            armGroup.add(armMesh);
            
            const hand = new THREE.Mesh(handGeometry, armMaterial);
            hand.position.set(0, -0.7, 0);
            hand.castShadow = true;
            armGroup.add(hand);
            
            this.visualGroup.add(armGroup);
            this.parts[config.name] = armGroup;
        });
    }
    
    createLegs() {
        const legMaterial = new THREE.MeshStandardMaterial({
            color: this.config.outfitColor,
            roughness: 0.4,
            metalness: 0.0
        });
        
        const footMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.1
        });
        
        const legGeometry = new THREE.CapsuleGeometry(0.12, 0.35, 8, 8);
        const footGeometry = new THREE.SphereGeometry(0.13, 16, 16);
        
        // Créer les deux jambes
        const legConfigs = [
            { name: 'leftLeg', x: -0.2 },
            { name: 'rightLeg', x: 0.2 }
        ];
        
        legConfigs.forEach(config => {
            const legGroup = new THREE.Group();
            legGroup.position.set(config.x, 0.8, 0);
            
            const legMesh = new THREE.Mesh(legGeometry, legMaterial);
            legMesh.geometry.translate(0, -0.15, 0);
            legMesh.castShadow = true;
            legGroup.add(legMesh);
            
            const foot = new THREE.Mesh(footGeometry, footMaterial);
            foot.position.set(0, -0.6, 0.05);
            foot.scale.set(1, 0.5, 1.2);
            foot.castShadow = true;
            legGroup.add(foot);
            
            this.visualGroup.add(legGroup);
            this.parts[config.name] = legGroup;
        });
    }
    
    update(delta) {
        this.updateMovementState();
        
        if (this.walking) {
            this.animationTime += delta * 15;
            this.animateWalking(this.animationTime);
        } else {
            this.resetAnimation(delta * 3);
        }
        
        this.animateEyes(delta);
    }
    
    updateMovementState() {
        if (this.entity.physics) {
            this.walking = this.entity.physics.getSpeed() > 0.01;
        } else if (this.entity.moveState) {
            this.walking = this.entity.moveState.forward || this.entity.moveState.backward;
        }
    }
    
    animateWalking(time) {
        const legAmplitude = 0.6;
        const armAmplitude = 0.6;
        
        if (this.parts.leftLeg) this.parts.leftLeg.rotation.x = Math.sin(time + Math.PI) * legAmplitude;
        if (this.parts.rightLeg) this.parts.rightLeg.rotation.x = Math.sin(time) * legAmplitude;
        
        if (this.parts.leftArm) this.parts.leftArm.rotation.x = Math.sin(time + Math.PI) * armAmplitude;
        if (this.parts.rightArm) this.parts.rightArm.rotation.x = Math.sin(time) * armAmplitude;
    }
    
    resetAnimation(factor) {
        factor = Math.min(factor, 1);
        
        // Réinitialise uniquement la rotation X pour les jambes et bras (mouvement de marche)
        ['leftLeg', 'rightLeg', 'leftArm', 'rightArm'].forEach(part => {
            if (this.parts[part]) this.parts[part].rotation.x *= (1 - factor);
        });
        
        // Réinitialise la rotation Z pour le corps et la tête (balancement)
        ['body', 'head', 'hair'].forEach(part => {
            if (this.parts[part]) this.parts[part].rotation.z *= (1 - factor);
        });
        
        // Préserve l'inclinaison des bras sur l'axe Z (ne pas réinitialiser)
    }
    
    animateEyes(delta) {
        if (Math.random() < 0.005) {
            this.parts.eyes.forEach(eye => {
                const blinkTween = {
                    progress: 0,
                    update: () => {
                        if (blinkTween.progress < 0.5) {
                            const scale = 1 - (blinkTween.progress * 2);
                            eye.children.forEach(part => { part.scale.y = scale; });
                        } else {
                            const scale = (blinkTween.progress - 0.5) * 2;
                            eye.children.forEach(part => { part.scale.y = scale; });
                        }
                        
                        blinkTween.progress += delta * 5;
                        
                        if (blinkTween.progress >= 1) {
                            eye.children.forEach(part => { part.scale.y = 1; });
                        } else {
                            requestAnimationFrame(blinkTween.update);
                        }
                    }
                };
                
                blinkTween.update();
            });
        }
    }
    
    setColors(colors = {}) {
        if (colors.bodyColor && this.parts.body) {
            this.parts.body.material.color.setHex(colors.bodyColor);
        }
        
        if (colors.headColor && this.parts.head) {
            this.parts.head.material.color.setHex(colors.headColor);
        }
        
        if (colors.hairColor && this.parts.hair) {
            this.parts.hair.material.color.setHex(colors.hairColor);
        }
        
        if (colors.eyeColor && this.parts.eyes.length > 0) {
            this.parts.eyes.forEach(eye => {
                if (eye.children.length > 1) {
                    eye.children[1].material.color.setHex(colors.eyeColor);
                }
            });
        }
    }
    
    onRemove() {
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
        
        disposeObject(this.visualGroup);
    }
}

export default VisualComponent;