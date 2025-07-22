// Ecos Universe - SPA Router
// Sistema de navegación para Single Page Application con transiciones suaves

class EcosRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.isTransitioning = false;
        this.history = [];
        this.init();
    }

    init() {
        this.setupRoutes();
        this.setupEventListeners();
        this.loadInitialRoute();
    }

    setupRoutes() {
        // Define all application routes
        this.routes.set('home', {
            path: '/',
            title: 'Inicio',
            view: 'landing',
            requiresAuth: false,
            component: 'renderLandingView'
        });

        this.routes.set('how-it-works', {
            path: '/como-funciona',
            title: 'Cómo Funciona',
            view: 'how-it-works',
            requiresAuth: false,
            component: 'renderHowItWorksView'
        });

        this.routes.set('public-garden', {
            path: '/jardin-publico',
            title: 'Jardín Público',
            view: 'public-garden',
            requiresAuth: false,
            component: 'renderPublicGardenView'
        });

        this.routes.set('eiven-info', {
            path: '/conoce-eiven',
            title: 'Conoce a Eiven',
            view: 'eiven-info',
            requiresAuth: false,
            component: 'renderEivenInfoView'
        });

        this.routes.set('dashboard', {
            path: '/dashboard',
            title: 'Dashboard',
            view: 'dashboard',
            requiresAuth: true,
            component: 'renderDashboardView'
        });

        this.routes.set('garden', {
            path: '/mi-jardin',
            title: 'Mi Jardín',
            view: 'garden',
            requiresAuth: true,
            component: 'renderGardenView'
        });

        this.routes.set('community', {
            path: '/comunidad',
            title: 'Comunidad',
            view: 'community',
            requiresAuth: true,
            component: 'renderCommunityView'
        });

        this.routes.set('eiven', {
            path: '/eiven',
            title: 'Chat con Eiven',
            view: 'eiven-chat',
            requiresAuth: true,
            component: 'renderEivenChatView'
        });

        this.routes.set('profile', {
            path: '/perfil',
            title: 'Mi Perfil',
            view: 'profile',
            requiresAuth: true,
            component: 'renderProfileView'
        });

        this.routes.set('settings', {
            path: '/configuracion',
            title: 'Configuración',
            view: 'settings',
            requiresAuth: true,
            component: 'renderSettingsView'
        });
    }

    setupEventListeners() {
        // Handle navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigateToRoute(e.state.route, false);
            } else {
                this.loadInitialRoute();
            }
        });

        // Handle auth state changes
        document.addEventListener('auth:user-signed-in', () => {
            // If on a public route, redirect to dashboard
            if (this.currentRoute && !this.currentRoute.requiresAuth) {
                this.navigate('dashboard');
            }
        });

        document.addEventListener('auth:user-signed-out', () => {
            // If on a protected route, redirect to home
            if (this.currentRoute && this.currentRoute.requiresAuth) {
                this.navigate('home');
            }
        });
    }

    loadInitialRoute() {
        const hash = window.location.hash.substr(1);
        const path = window.location.pathname;
        
        // Determine initial route
        let initialRoute = 'home';
        
        if (hash) {
            // Check if hash corresponds to a route
            for (const [routeName, route] of this.routes) {
                if (route.path === '/' + hash || routeName === hash) {
                    initialRoute = routeName;
                    break;
                }
            }
        } else if (path !== '/') {
            // Check if path corresponds to a route
            for (const [routeName, route] of this.routes) {
                if (route.path === path) {
                    initialRoute = routeName;
                    break;
                }
            }
        }

        this.navigate(initialRoute, false);
    }

    async navigate(routeName, addToHistory = true) {
        if (this.isTransitioning) {
            console.log('Navigation in progress, ignoring request');
            return;
        }

        const route = this.routes.get(routeName);
        if (!route) {
            console.error(`Route '${routeName}' not found`);
            return;
        }

        // Check authentication requirements
        if (route.requiresAuth && !this.isAuthenticated()) {
            console.log('Route requires authentication, redirecting to login');
            this.showLoginModal();
            return;
        }

        if (!route.requiresAuth && this.isAuthenticated() && routeName === 'home') {
            // If user is authenticated and trying to go to home, redirect to dashboard
            this.navigate('dashboard', addToHistory);
            return;
        }

        await this.navigateToRoute(route, addToHistory);
    }

    async navigateToRoute(route, addToHistory = true) {
        if (this.isTransitioning) return;

        this.isTransitioning = true;

        try {
            // Update navigation state
            this.updateNavigationState(route);

            // Add to history
            if (addToHistory) {
                this.addToHistory(route);
            }

            // Transition out current view
            await this.transitionOut();

            // Load new view
            await this.loadView(route);

            // Transition in new view
            await this.transitionIn();

            // Update current route
            this.currentRoute = route;

            // Update document title
            document.title = `${route.title} - Ecos Universe`;

            // Update URL
            this.updateURL(route);

            console.log(`✅ Navigated to: ${route.title}`);

        } catch (error) {
            console.error('❌ Navigation error:', error);
        } finally {
            this.isTransitioning = false;
        }
    }

    updateNavigationState(route) {
        // Update navigation links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('border-b-2', 'border-primary-blue', 'text-text-primary');
            link.classList.add('text-text-secondary');
        });

        // Highlight active nav link
        const activeLink = document.querySelector(`[data-route="${this.getRouteNameByPath(route.path)}"]`);
        if (activeLink) {
            activeLink.classList.add('border-b-2', 'border-primary-blue', 'text-text-primary');
            activeLink.classList.remove('text-text-secondary');
        }

        // Show/hide navigation based on auth state
        this.updateNavigationVisibility();
    }

    updateNavigationVisibility() {
        const isAuth = this.isAuthenticated();
        const publicNav = document.getElementById('public-nav');
        const authNav = document.getElementById('auth-nav');
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');

        if (isAuth) {
            publicNav?.classList.add('hidden');
            authNav?.classList.remove('hidden');
            authButtons?.classList.add('hidden');
            userMenu?.classList.remove('hidden');
        } else {
            publicNav?.classList.remove('hidden');
            authNav?.classList.add('hidden');
            authButtons?.classList.remove('hidden');
            userMenu?.classList.add('hidden');
        }
    }

    async transitionOut() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.add('view-transition-fade-out');
            await this.wait(200);
        }
    }

    async transitionIn() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.classList.remove('view-transition-fade-out');
            mainContent.classList.add('view-transition-fade-in');
            
            await this.wait(400);
            mainContent.classList.remove('view-transition-fade-in');
        }
    }

    async loadView(route) {
        if (!window.ecosViews) {
            console.error('EcosViews not available');
            return;
        }

        const componentMethod = ecosViews[route.component];
        if (typeof componentMethod === 'function') {
            try {
                const content = await componentMethod.call(ecosViews);
                this.renderContent(content);
            } catch (error) {
                console.error(`Error rendering component '${route.component}':`, error);
                this.renderErrorContent();
            }
        } else {
            console.error(`Component method '${route.component}' not found`);
            this.renderErrorContent();
        }
    }

    renderContent(content) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = content;
            
            // Trigger view-specific initialization
            this.initializeViewComponents();
        }
    }

    renderErrorContent() {
        const content = `
            <div class="container mx-auto px-4 py-16 text-center">
                <div class="max-w-md mx-auto">
                    <div class="text-6xl mb-4">😕</div>
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">Página no encontrada</h1>
                    <p class="text-gray-600 mb-8">Lo sentimos, la página que buscas no existe.</p>
                    <button onclick="ecosRouter.navigate('home')" class="bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors">
                        Volver al inicio
                    </button>
                </div>
            </div>
        `;
        this.renderContent(content);
    }

    initializeViewComponents() {
        // Trigger initialization for any view-specific components
        document.dispatchEvent(new CustomEvent('view:loaded', {
            detail: { route: this.currentRoute }
        }));

        // Initialize any dynamic elements in the new view
        if (window.ecosViews && ecosViews.initializeCurrentView) {
            ecosViews.initializeCurrentView(this.currentRoute);
        }
    }

    addToHistory(route) {
        this.history.push(route);
        window.history.pushState({ route }, route.title, route.path);
    }

    updateURL(route) {
        // Update URL without triggering navigation
        if (window.location.pathname !== route.path) {
            window.history.replaceState({ route }, route.title, route.path);
        }
    }

    getRouteNameByPath(path) {
        for (const [routeName, route] of this.routes) {
            if (route.path === path) {
                return routeName;
            }
        }
        return null;
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    isAuthenticated() {
        return window.ecosAuth && ecosAuth.currentUser && ecosAuth.isAuthenticated();
    }

    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.remove('hidden');
            const modalContent = document.getElementById('login-modal-content');
            setTimeout(() => {
                modalContent.classList.remove('scale-95', 'opacity-0');
                modalContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    }

    getCurrentRoute() {
        return this.currentRoute;
    }

    getHistory() {
        return [...this.history];
    }

    canGoBack() {
        return this.history.length > 1;
    }

    goBack() {
        if (this.canGoBack()) {
            // Remove current route from history
            this.history.pop();
            // Get previous route
            const previousRoute = this.history[this.history.length - 1];
            this.navigateToRoute(previousRoute, false);
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ========================================
    // PUBLIC API
    // ========================================

    // Programmatic navigation methods
    goToHome() { this.navigate('home'); }
    goToDashboard() { this.navigate('dashboard'); }
    goToGarden() { this.navigate('garden'); }
    goToCommunity() { this.navigate('community'); }
    goToEiven() { this.navigate('eiven'); }
    goToProfile() { this.navigate('profile'); }
    goToSettings() { this.navigate('settings'); }

    // Route information
    getRoutes() {
        return new Map(this.routes);
    }

    getRouteByName(name) {
        return this.routes.get(name);
    }
}

// Initialize global router
let ecosRouter;

document.addEventListener('DOMContentLoaded', () => {
    ecosRouter = new EcosRouter();
    
    // Make it globally available
    window.ecosRouter = ecosRouter;
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcosRouter;
}
