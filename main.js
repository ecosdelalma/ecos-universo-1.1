// Ecos Platform - Main Application Script
// Script principal que conecta todos los sistemas

class EcosApp {
    constructor() {
        this.currentView = 'landing';
        this.currentUser = null;
        this.currentGarden = null;
        this.isLoading = false;
        
        this.initialize();
    }

    async initialize() {
        // Show loading screen
        this.showLoading();

        // Initialize authentication listener
        ecosAuth.onAuthChange((user) => {
            this.currentUser = user;
            this.handleAuthChange(user);
        });

        // Setup event listeners
        this.setupEventListeners();

        // Setup navigation
        this.setupNavigation();

        // Initialize Eiven if features enabled
        if (APP_CONFIG.features.eiven) {
            this.initializeEiven();
        }

        // Hide loading screen after initialization
        setTimeout(() => {
            this.hideLoading();
        }, 2000);
    }

    // =====================================================
    // AUTHENTICATION HANDLING
    // =====================================================

    handleAuthChange(user) {
        if (user) {
            this.handleUserSignedIn(user);
        } else {
            this.handleUserSignedOut();
        }
    }

    async handleUserSignedIn(user) {
        console.log('User signed in:', user);
        
        // Load user data
        await this.loadUserData();
        
        // Show dashboard
        this.showDashboard();
        
        // Initialize user's default garden
        await this.loadUserGardens();
    }

    handleUserSignedOut() {
        console.log('User signed out');
        
        // Clear user data
        this.currentUser = null;
        this.currentGarden = null;
        
        // Show landing page
        this.showLandingPage();
    }

    async loadUserData() {
        try {
            const result = await ecosAPI.getDashboardData();
            if (result.success) {
                this.userDashboardData = result.dashboard;
            }
        } catch (error) {
            console.error('Load user data error:', error);
        }
    }

    async loadUserGardens() {
        try {
            const result = await ecosAPI.getGardens();
            if (result.success && result.gardens.length > 0) {
                this.currentGarden = result.gardens[0]; // Set first garden as current
            }
        } catch (error) {
            console.error('Load user gardens error:', error);
        }
    }

    // =====================================================
    // VIEW MANAGEMENT
    // =====================================================

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                loadingScreen.style.opacity = '1';
            }, 500);
        }
    }

    showLandingPage() {
        this.currentView = 'landing';
        
        // Hide app container
        const appContainer = document.getElementById('app-container');
        if (appContainer) {
            appContainer.classList.add('hidden');
        }

        // Show landing sections
        const sections = ['inicio', 'como-funciona', 'eiven'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.remove('hidden');
            }
        });

        // Show navigation
        const navbar = document.getElementById('navbar');
        if (navbar) {
            navbar.classList.remove('hidden');
        }

        // Update navigation buttons
        this.updateNavButtons(false);
    }

    showDashboard() {
        this.currentView = 'dashboard';
        
        // Hide landing sections
        const sections = ['inicio', 'como-funciona', 'eiven'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('hidden');
            }
        });

        // Create and show dashboard
        this.createDashboard();
        
        // Update navigation buttons
        this.updateNavButtons(true);
    }

    updateNavButtons(isAuthenticated) {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        
        if (isAuthenticated) {
            if (loginBtn) {
                loginBtn.textContent = 'Mi Jardín';
                loginBtn.onclick = () => this.showGarden();
            }
            if (registerBtn) {
                registerBtn.textContent = 'Cerrar Sesión';
                registerBtn.onclick = () => this.signOut();
                registerBtn.className = 'bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors';
            }
        } else {
            if (loginBtn) {
                loginBtn.textContent = 'Iniciar Sesión';
                loginBtn.onclick = () => this.showLoginModal();
            }
            if (registerBtn) {
                registerBtn.textContent = 'Registrarse';
                registerBtn.onclick = () => this.showRegisterModal();
                registerBtn.className = 'bg-forest-green text-white px-4 py-2 rounded-lg hover:bg-forest-light transition-colors';
            }
        }
    }

    // =====================================================
    // DASHBOARD CREATION
    // =====================================================

    createDashboard() {
        const appContainer = document.getElementById('app-container');
        if (!appContainer) return;

        const dashboardHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100">
                <!-- Dashboard Navigation -->
                <nav class="bg-white shadow-sm border-b">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between h-16">
                            <div class="flex items-center">
                                <h1 class="text-2xl font-serif font-bold text-ocean-dark">Ecos</h1>
                                <span class="ml-4 text-gray-500">Tu espacio de crecimiento</span>
                            </div>
                            <div class="flex items-center space-x-4">
                                <button id="dashboard-btn" class="nav-btn active">Dashboard</button>
                                <button id="garden-btn" class="nav-btn">Mi Jardín</button>
                                <button id="community-btn" class="nav-btn">Comunidad</button>
                                <button id="eiven-btn" class="nav-btn">Eiven</button>
                                <button id="profile-btn" class="nav-btn">Perfil</button>
                            </div>
                        </div>
                    </div>
                </nav>

                <!-- Dashboard Content -->
                <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    <!-- Welcome Section -->
                    <div class="mb-8">
                        <h2 class="text-3xl font-serif font-bold text-gray-800 mb-2">
                            Bienvenido de vuelta, ${this.currentUser?.profile?.full_name || 'Usuario'}
                        </h2>
                        <p class="text-gray-600">¿Qué reflexiones florecerán en tu jardín hoy?</p>
                    </div>

                    <!-- Stats Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div class="dashboard-card">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-ocean-blue rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">🌱</span>
                                </div>
                                <div class="ml-4">
                                    <p class="text-gray-500 text-sm">Ecos Totales</p>
                                    <p class="stats-number">${this.userDashboardData?.stats?.total_echos || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="dashboard-card">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-forest-green rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">🏞️</span>
                                </div>
                                <div class="ml-4">
                                    <p class="text-gray-500 text-sm">Jardines</p>
                                    <p class="stats-number">${this.userDashboardData?.stats?.total_gardens || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="dashboard-card">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-golden-soft rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">💝</span>
                                </div>
                                <div class="ml-4">
                                    <p class="text-gray-500 text-sm">Likes Recibidos</p>
                                    <p class="stats-number">${this.userDashboardData?.stats?.total_likes_received || 0}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="dashboard-card">
                            <div class="flex items-center">
                                <div class="w-12 h-12 bg-earth-brown rounded-lg flex items-center justify-center">
                                    <span class="text-white text-xl">📅</span>
                                </div>
                                <div class="ml-4">
                                    <p class="text-gray-500 text-sm">Este Mes</p>
                                    <p class="stats-number">${this.userDashboardData?.stats?.this_month_echos || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <!-- New Echo -->
                        <div class="dashboard-card lg:col-span-2">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">Crear Nuevo Eco</h3>
                            <div class="space-y-4">
                                <textarea
                                    id="quick-echo-content"
                                    placeholder="¿Qué reflexiones surgen en ti hoy? Comparte tus pensamientos..."
                                    class="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-blue resize-none"
                                    rows="4"
                                ></textarea>
                                <div class="flex items-center justify-between">
                                    <div class="flex space-x-2">
                                        <select id="quick-echo-mood" class="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-blue">
                                            <option value="">¿Cómo te sientes?</option>
                                            <option value="alegre">😊 Alegre</option>
                                            <option value="reflexivo">🤔 Reflexivo</option>
                                            <option value="melancólico">😌 Melancólico</option>
                                            <option value="esperanzado">🌟 Esperanzado</option>
                                            <option value="ansioso">😰 Ansioso</option>
                                            <option value="sereno">🧘 Sereno</option>
                                            <option value="energético">⚡ Energético</option>
                                            <option value="contemplativo">🌙 Contemplativo</option>
                                        </select>
                                        <label class="flex items-center space-x-2">
                                            <input type="checkbox" id="quick-echo-public" class="rounded">
                                            <span class="text-sm text-gray-600">Compartir públicamente</span>
                                        </label>
                                    </div>
                                    <button id="create-quick-echo" class="bg-ocean-blue text-white px-6 py-2 rounded-lg hover:bg-ocean-dark transition-colors btn-float">
                                        Plantar Eco
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Eiven Insights -->
                        <div class="dashboard-card">
                            <h3 class="text-xl font-semibold text-gray-800 mb-4">Insights de Eiven</h3>
                            <div id="eiven-insights-container" class="space-y-3">
                                <div class="text-center text-gray-500 py-4">
                                    <span class="text-4xl mb-2 block">🌸</span>
                                    <p>No hay insights nuevos</p>
                                    <button id="chat-with-eiven" class="mt-2 text-ocean-blue hover:text-ocean-dark">
                                        Conversar con Eiven
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Echos -->
                    <div class="dashboard-card">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">Ecos Recientes</h3>
                        <div id="recent-echos-container" class="space-y-4">
                            <div class="text-center text-gray-500 py-8">
                                <span class="text-4xl mb-2 block">🌱</span>
                                <p>Aún no has plantado ningún eco</p>
                                <p class="text-sm">Comienza compartiendo tus reflexiones</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Eiven Chat Modal -->
                <div id="eiven-chat-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center">
                    <div class="bg-white rounded-2xl w-full max-w-2xl h-3/4 mx-4 flex flex-col">
                        <!-- Chat Header -->
                        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-12 h-12 bg-gradient-to-br from-ocean-blue to-forest-green rounded-full flex items-center justify-center">
                                    <span class="text-white text-xl">🌸</span>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-800">Eiven</h3>
                                    <p class="text-sm text-gray-500">Tu guía empática</p>
                                </div>
                            </div>
                            <button id="close-eiven-chat" class="text-gray-400 hover:text-gray-600">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <!-- Chat Messages -->
                        <div id="eiven-messages" class="flex-1 overflow-y-auto p-6 space-y-4">
                            <!-- Messages will be added here -->
                        </div>

                        <!-- Chat Input -->
                        <div class="p-6 border-t border-gray-200">
                            <div class="flex space-x-3">
                                <input
                                    type="text"
                                    id="eiven-message-input"
                                    placeholder="Comparte tus pensamientos con Eiven..."
                                    class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-blue"
                                />
                                <button id="send-eiven-message" class="bg-ocean-blue text-white px-6 py-2 rounded-lg hover:bg-ocean-dark transition-colors">
                                    Enviar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        appContainer.innerHTML = dashboardHTML;
        appContainer.classList.remove('hidden');

        // Setup dashboard event listeners
        this.setupDashboardEvents();
        
        // Load recent echos
        this.loadRecentEchos();
        
        // Load Eiven insights
        this.loadEivenInsights();
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    setupEventListeners() {
        // Modal event listeners
        this.setupModalEvents();
        
        // Navigation event listeners
        this.setupNavigationEvents();
        
        // Form event listeners
        this.setupFormEvents();
    }

    setupModalEvents() {
        // Login modal
        const loginBtn = document.getElementById('login-btn');
        const loginModal = document.getElementById('login-modal');
        const closeLoginModal = document.getElementById('close-login-modal');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.showLoginModal());
        }

        if (closeLoginModal) {
            closeLoginModal.addEventListener('click', () => this.hideLoginModal());
        }

        // Register modal
        const registerBtn = document.getElementById('register-btn');
        const registerModal = document.getElementById('register-modal');
        const closeRegisterModal = document.getElementById('close-register-modal');

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.showRegisterModal());
        }

        if (closeRegisterModal) {
            closeRegisterModal.addEventListener('click', () => this.hideRegisterModal());
        }

        // Click outside to close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fixed') && e.target.classList.contains('inset-0')) {
                this.hideAllModals();
            }
        });
    }

    setupNavigationEvents() {
        // Smooth scroll for navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });

        // CTA buttons
        const startJourneyBtn = document.getElementById('start-journey-btn');
        const exploreBtn = document.getElementById('explore-btn');

        if (startJourneyBtn) {
            startJourneyBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.showDashboard();
                } else {
                    this.showRegisterModal();
                }
            });
        }

        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                const section = document.getElementById('como-funciona');
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    setupFormEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    setupDashboardEvents() {
        // Quick echo creation
        const createQuickEchoBtn = document.getElementById('create-quick-echo');
        if (createQuickEchoBtn) {
            createQuickEchoBtn.addEventListener('click', () => this.createQuickEcho());
        }

        // Enter key in quick echo textarea
        const quickEchoContent = document.getElementById('quick-echo-content');
        if (quickEchoContent) {
            quickEchoContent.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    this.createQuickEcho();
                }
            });
        }

        // Eiven chat
        const chatWithEivenBtn = document.getElementById('chat-with-eiven');
        const closeEivenChatBtn = document.getElementById('close-eiven-chat');
        const sendEivenMessageBtn = document.getElementById('send-eiven-message');
        const eivenMessageInput = document.getElementById('eiven-message-input');

        if (chatWithEivenBtn) {
            chatWithEivenBtn.addEventListener('click', () => this.showEivenChat());
        }

        if (closeEivenChatBtn) {
            closeEivenChatBtn.addEventListener('click', () => this.hideEivenChat());
        }

        if (sendEivenMessageBtn) {
            sendEivenMessageBtn.addEventListener('click', () => this.sendEivenMessage());
        }

        if (eivenMessageInput) {
            eivenMessageInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendEivenMessage();
                }
            });
        }
    }

    setupNavigation() {
        // Update active navigation item based on scroll
        window.addEventListener('scroll', () => {
            const sections = ['inicio', 'como-funciona', 'jardin', 'eiven'];
            const navLinks = document.querySelectorAll('.nav-link');
            
            let current = '';
            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 100 && rect.bottom >= 100) {
                        current = section;
                    }
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // =====================================================
    // AUTHENTICATION ACTIONS
    // =====================================================

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.querySelector('.bg-white').classList.add('modal-enter');
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.querySelector('.bg-white').classList.add('modal-enter');
        }
    }

    hideRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    hideAllModals() {
        this.hideLoginModal();
        this.hideRegisterModal();
        this.hideEivenChat();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            this.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        this.setLoading(true);
        
        const result = await ecosAuth.signIn(email, password);
        
        this.setLoading(false);

        if (result.success) {
            this.hideLoginModal();
            this.showMessage('¡Bienvenido de vuelta!', 'success');
        } else {
            this.showMessage(ecosAuth.translateError(result.error), 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        if (!name || !email || !password) {
            this.showMessage('Por favor completa todos los campos', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        this.setLoading(true);
        
        const result = await ecosAuth.signUp(email, password, {
            fullName: name
        });
        
        this.setLoading(false);

        if (result.success) {
            this.hideRegisterModal();
            if (result.requiresConfirmation) {
                this.showMessage(result.message, 'info');
            } else {
                this.showMessage('¡Cuenta creada exitosamente!', 'success');
            }
        } else {
            this.showMessage(ecosAuth.translateError(result.error), 'error');
        }
    }

    async signOut() {
        const result = await ecosAuth.signOut();
        if (result.success) {
            this.showMessage('Sesión cerrada correctamente', 'info');
        }
    }

    // =====================================================
    // ECHO MANAGEMENT
    // =====================================================

    async createQuickEcho() {
        const content = document.getElementById('quick-echo-content').value.trim();
        const mood = document.getElementById('quick-echo-mood').value;
        const isPublic = document.getElementById('quick-echo-public').checked;

        if (!content) {
            this.showMessage('Por favor escribe algún contenido para tu eco', 'error');
            return;
        }

        if (!this.currentGarden) {
            this.showMessage('No hay jardín disponible', 'error');
            return;
        }

        this.setLoading(true);

        const result = await ecosAPI.createEcho({
            content: content,
            mood: mood || null,
            gardenId: this.currentGarden.id,
            isPublic: isPublic
        });

        this.setLoading(false);

        if (result.success) {
            // Clear form
            document.getElementById('quick-echo-content').value = '';
            document.getElementById('quick-echo-mood').value = '';
            document.getElementById('quick-echo-public').checked = false;

            this.showMessage('¡Eco plantado exitosamente!', 'success');
            
            // Trigger echo created event
            const event = new CustomEvent('echo-created', {
                detail: { echo: result.echo }
            });
            document.dispatchEvent(event);

            // Reload recent echos
            this.loadRecentEchos();
        } else {
            this.showMessage('Error al crear el eco: ' + result.error, 'error');
        }
    }

    async loadRecentEchos() {
        if (!this.currentUser) return;

        try {
            const result = await ecosAPI.getEchos({
                userId: this.currentUser.id,
                limit: 5,
                sortBy: 'created_at',
                sortOrder: 'desc'
            });

            if (result.success) {
                this.displayRecentEchos(result.echos);
            }
        } catch (error) {
            console.error('Load recent echos error:', error);
        }
    }

    displayRecentEchos(echos) {
        const container = document.getElementById('recent-echos-container');
        if (!container) return;

        if (echos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <span class="text-4xl mb-2 block">🌱</span>
                    <p>Aún no has plantado ningún eco</p>
                    <p class="text-sm">Comienza compartiendo tus reflexiones</p>
                </div>
            `;
            return;
        }

        const echosHTML = echos.map(echo => `
            <div class="eco-card p-4 rounded-lg border border-gray-200">
                <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        ${echo.mood ? `<span class="text-2xl">${this.getMoodEmoji(echo.mood)}</span>` : ''}
                        <span class="text-sm text-gray-500">${this.formatDate(echo.created_at)}</span>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-gray-500">
                        <span>❤️ ${echo.likes_count}</span>
                        <span>💬 ${echo.comments_count}</span>
                    </div>
                </div>
                ${echo.title ? `<h4 class="font-semibold text-gray-800 mb-2">${echo.title}</h4>` : ''}
                <p class="text-gray-700 mb-3">${echo.content}</p>
                ${echo.tags && echo.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-1">
                        ${echo.tags.map(tag => `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = echosHTML;
    }

    // =====================================================
    // EIVEN CHAT
    // =====================================================

    initializeEiven() {
        // Listen for Eiven events
        document.addEventListener('eiven-typing', (e) => {
            this.updateEivenTypingIndicator(e.detail.typing);
        });

        document.addEventListener('eiven-insight', (e) => {
            this.showEivenInsight(e.detail.insight, e.detail.echo);
        });
    }

    showEivenChat() {
        const modal = document.getElementById('eiven-chat-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            // Load conversation if exists
            this.loadEivenConversation();
        }
    }

    hideEivenChat() {
        const modal = document.getElementById('eiven-chat-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async loadEivenConversation() {
        const messagesContainer = document.getElementById('eiven-messages');
        if (!messagesContainer) return;

        const conversation = eiven.getCurrentConversation();
        
        if (!conversation || !conversation.messages.length) {
            // Start new conversation
            await eiven.startNewConversation();
            this.loadEivenConversation();
            return;
        }

        // Display messages
        const messagesHTML = conversation.messages.map(message => 
            this.createChatMessageHTML(message)
        ).join('');

        messagesContainer.innerHTML = messagesHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async sendEivenMessage() {
        const input = document.getElementById('eiven-message-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Clear input
        input.value = '';

        // Add user message to UI
        this.addChatMessage({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Send to Eiven
        const result = await eiven.sendMessage(message);
        
        if (result.success) {
            this.addChatMessage(result.message);
        } else {
            this.addChatMessage({
                role: 'assistant',
                content: 'Lo siento, no pude procesar tu mensaje en este momento. ¿Puedes intentar nuevamente?',
                timestamp: new Date().toISOString()
            });
        }
    }

    addChatMessage(message) {
        const messagesContainer = document.getElementById('eiven-messages');
        if (!messagesContainer) return;

        const messageHTML = this.createChatMessageHTML(message);
        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    createChatMessageHTML(message) {
        const isUser = message.role === 'user';
        const time = this.formatTime(message.timestamp);
        
        return `
            <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
                <div class="chat-bubble ${isUser ? 'user' : 'eiven'} p-3 rounded-lg max-w-xs lg:max-w-md">
                    <p class="text-sm">${message.content}</p>
                    <p class="text-xs opacity-70 mt-1">${time}</p>
                </div>
            </div>
        `;
    }

    updateEivenTypingIndicator(isTyping) {
        const messagesContainer = document.getElementById('eiven-messages');
        if (!messagesContainer) return;

        // Remove existing typing indicator
        const existingIndicator = messagesContainer.querySelector('.typing-indicator');
        if (existingIndicator) {
            existingIndicator.parentElement.remove();
        }

        if (isTyping) {
            const typingHTML = `
                <div class="flex justify-start">
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    async loadEivenInsights() {
        // Load user insights from database
        try {
            const { data, error } = await supabase
                .from('user_insights')
                .select('*')
                .eq('user_id', this.currentUser?.id)
                .eq('is_read', false)
                .order('generated_at', { ascending: false })
                .limit(3);

            if (error) {
                console.error('Load insights error:', error);
                return;
            }

            this.displayEivenInsights(data || []);
        } catch (error) {
            console.error('Load insights error:', error);
        }
    }

    displayEivenInsights(insights) {
        const container = document.getElementById('eiven-insights-container');
        if (!container || insights.length === 0) return;

        const insightsHTML = insights.map(insight => `
            <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 class="font-semibold text-blue-800 text-sm mb-1">${insight.title}</h4>
                <p class="text-blue-700 text-xs">${insight.content.substring(0, 100)}...</p>
                <button class="text-blue-600 text-xs mt-1 hover:underline" onclick="ecosApp.markInsightAsRead('${insight.id}')">
                    Marcar como leído
                </button>
            </div>
        `).join('');

        container.innerHTML = insightsHTML;
    }

    async markInsightAsRead(insightId) {
        try {
            const { error } = await supabase
                .from('user_insights')
                .update({ is_read: true })
                .eq('id', insightId);

            if (!error) {
                this.loadEivenInsights();
            }
        } catch (error) {
            console.error('Mark insight as read error:', error);
        }
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    setLoading(loading) {
        this.isLoading = loading;
        // You can add loading indicators here
    }

    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    getMoodEmoji(mood) {
        const moodEmojis = {
            'alegre': '😊',
            'reflexivo': '🤔',
            'melancólico': '😌',
            'esperanzado': '🌟',
            'ansioso': '😰',
            'sereno': '🧘',
            'energético': '⚡',
            'contemplativo': '🌙'
        };
        return moodEmojis[mood] || '💭';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Hoy';
        } else if (diffDays === 2) {
            return 'Ayer';
        } else if (diffDays < 7) {
            return `Hace ${diffDays} días`;
        } else {
            return date.toLocaleDateString('es-ES');
        }
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    showGarden() {
        // TODO: Implement garden view
        this.showMessage('Vista de jardín en desarrollo', 'info');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.ecosApp = new EcosApp();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcosApp };
}