import { gsap } from 'gsap';

class PortfolioManager {
    constructor() {
        this.portfolioOverlay = document.getElementById('portfolio-overlay');
        this.portfolioContent = this.portfolioOverlay.querySelector('.content');
        this.closeBtn = this.portfolioOverlay.querySelector('.close-btn');
        
        // Initialiser les projets
        this.projects = this.initializeProjects();
        
        // Configuration des événements
        this.setupEventListeners();
    }
    
    initializeProjects() {
        // Données fictives des projets pour la démo
        return [
            {
                id: 'web-projects',
                title: 'Projets Web',
                description: 'Découvrez mes projets de développement web utilisant les technologies les plus récentes.',
                projects: [
                    {
                        title: 'E-commerce moderne',
                        description: 'Une plateforme e-commerce complète avec panier, paiements sécurisés et panneaux d\'administration.',
                        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    },
                    {
                        title: 'Application SPA de réservation',
                        description: 'Interface utilisateur intuitive pour la réservation de services avec système de calendrier avancé.',
                        technologies: ['Vue.js', 'Firebase', 'TailwindCSS'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    },
                    {
                        title: 'Dashboard Analytics',
                        description: 'Tableau de bord interactif présentant des données complexes avec visualisations personnalisables.',
                        technologies: ['React', 'D3.js', 'GraphQL', 'AWS'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    }
                ]
            },
            {
                id: 'mobile-apps',
                title: 'Applications Mobile',
                description: 'Applications mobiles natives et cross-platform pour iOS et Android.',
                projects: [
                    {
                        title: 'Fitness Tracker',
                        description: 'Application de suivi de fitness avec plans d\'entraînement personnalisés et statistiques.',
                        technologies: ['React Native', 'Redux', 'Firebase'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    },
                    {
                        title: 'Scanner de documents',
                        description: 'Application permettant de numériser, stocker et organiser des documents avec OCR intégré.',
                        technologies: ['Flutter', 'TensorFlow Lite', 'SQLite'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    }
                ]
            },
            {
                id: '3d-creations',
                title: 'Créations 3D',
                description: 'Projets 3D interactifs utilisant Three.js et WebGL.',
                projects: [
                    {
                        title: 'Visualiseur de Produits 3D',
                        description: 'Interface interactive permettant d\'explorer des produits en 3D avec personnalisation en temps réel.',
                        technologies: ['Three.js', 'WebGL', 'GLSL', 'Blender'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    },
                    {
                        title: 'Expérience musicale immersive',
                        description: 'Visualisation de musique en 3D réagissant aux fréquences audio en temps réel.',
                        technologies: ['Three.js', 'Web Audio API', 'GSAP'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    },
                    {
                        title: 'Portfolio interactif',
                        description: 'Ce portfolio 3D que vous explorez actuellement avec un personnage contrôlable.',
                        technologies: ['Three.js', 'GSAP', 'Vite', 'JavaScript ES6+'],
                        imageUrl: 'https://via.placeholder.com/600x350',
                        link: '#'
                    }
                ]
            },
            {
                id: 'about-me',
                title: 'À propos de moi',
                description: 'Développeur passionné spécialisé dans la création d\'expériences web et mobiles innovantes.',
                content: `
                    <div class="about-me-content">
                        <img src="https://via.placeholder.com/200x200" alt="Photo de profil" class="profile-image">
                        <h3>Mon parcours</h3>
                        <p>Passionné par le développement web et les technologies immersives, j'ai consacré les dernières années à me spécialiser dans la création d'expériences interactives engageantes et accessibles.</p>
                        
                        <h3>Compétences techniques</h3>
                        <ul>
                            <li><strong>Langages:</strong> JavaScript (ES6+), TypeScript, HTML5, CSS3/SASS</li>
                            <li><strong>Frameworks & Bibliothèques:</strong> React, Vue.js, Three.js, Node.js, Express</li>
                            <li><strong>Outils:</strong> Git, Webpack, Vite, Docker</li>
                            <li><strong>3D & Animation:</strong> Three.js, WebGL, GSAP, Blender</li>
                        </ul>
                        
                        <h3>Éducation</h3>
                        <p>Master en Développement Web et Applications Mobiles</p>
                        
                        <h3>Me contacter</h3>
                        <div class="contact-links">
                            <a href="#" target="_blank">LinkedIn</a>
                            <a href="#" target="_blank">GitHub</a>
                            <a href="mailto:contact@example.com">Email</a>
                        </div>
                    </div>
                `
            }
        ];
    }
    
    setupEventListeners() {
        // Fermer le portfolio lors du clic sur le bouton de fermeture
        this.closeBtn.addEventListener('click', () => {
            this.hidePortfolio();
        });
        
        // Fermer le portfolio lors de l'appui sur la touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && !this.portfolioOverlay.classList.contains('hidden')) {
                this.hidePortfolio();
            }
        });
    }
    
    getProjects() {
        return this.projects;
    }
    
    showProject(projectId) {
        // Trouver le projet correspondant
        const project = this.projects.find(p => p.id === projectId);
        
        if (!project) return;
        
        // Générer le HTML pour le projet
        let contentHTML = '';
        
        if (projectId === 'about-me') {
            // Cas spécial pour la section "À propos de moi"
            contentHTML = `
                <h2>${project.title}</h2>
                <p class="subtitle">${project.description}</p>
                ${project.content}
            `;
        } else {
            // Format pour les projets
            contentHTML = `
                <h2>${project.title}</h2>
                <p class="subtitle">${project.description}</p>
                <div class="projects-grid">
            `;
            
            // Ajouter chaque projet
            project.projects.forEach(item => {
                const techStack = item.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('');
                
                contentHTML += `
                    <div class="project-card">
                        <img src="${item.imageUrl}" alt="${item.title}" class="project-image">
                        <div class="project-info">
                            <h3>${item.title}</h3>
                            <p>${item.description}</p>
                            <div class="tech-stack">${techStack}</div>
                            <a href="${item.link}" class="project-link" target="_blank">Voir le projet</a>
                        </div>
                    </div>
                `;
            });
            
            contentHTML += '</div>';
        }
        
        // Injecter le contenu
        this.portfolioContent.innerHTML = contentHTML;
        
        // Ajouter du style spécifique à la section
        this.portfolioOverlay.style.setProperty('--section-color', this.getSectionColor(projectId));
        
        // Afficher avec animation
        this.portfolioOverlay.classList.remove('hidden');
        
        // Animation d'entrée
        gsap.fromTo(this.portfolioOverlay, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
        );
        
        // Animation de contenu
        const elements = this.portfolioContent.querySelectorAll('h2, p, .project-card');
        gsap.fromTo(elements, 
            { opacity: 0, y: 20 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 }
        );
    }
    
    hidePortfolio() {
        // Animation de sortie
        gsap.to(this.portfolioOverlay, {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                this.portfolioOverlay.classList.add('hidden');
            }
        });
    }
    
    getSectionColor(sectionId) {
        // Couleurs associées à chaque section
        const colors = {
            'web-projects': '#3498db',
            'mobile-apps': '#2ecc71',
            '3d-creations': '#9b59b6',
            'about-me': '#e67e22'
        };
        
        return colors[sectionId] || '#3498db';
    }
}

export default PortfolioManager;