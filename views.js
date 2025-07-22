// Ecos Universe - SPA Views
// Sistema de vistas para renderizar contenido dinámico en la SPA

class EcosViews {
    constructor() {
        this.currentViewData = null;
        this.viewEventListeners = new Map();
    }

    // ========================================
    // LANDING PAGE / HOME VIEW
    // ========================================

    async renderLandingView() {
        const stats = await this.getPlatformStats();
        
        return `
            <!-- Hero Section with Animated Ocean -->
            <section id="inicio" class="relative h-screen flex items-center justify-center overflow-hidden">
                <!-- Animated Ocean Background -->
                <div class="ocean-container absolute inset-0">
                    <div class="ocean">
                        <div class="wave"></div>
                        <div class="wave"></div>
                        <div class="wave"></div>
                    </div>
                </div>
                
                <!-- Hero Content -->
                <div class="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                    <h1 class="text-5xl md:text-7xl font-serif font-bold mb-6 animate-fade-in-up">
                        Bienvenido a <span class="text-golden-soft">Ecos Universe</span>
                    </h1>
                    <p class="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in-up" style="animation-delay: 0.3s">
                        Una plataforma que conecta tu mundo interior con el exterior a través de reflexiones profundas y crecimiento personal
                    </p>
                    
                    <!-- Live Platform Stats -->
                    <div class="flex justify-center space-x-8 mb-8 animate-fade-in-up" style="animation-delay: 0.4s">
                        <div class="text-center">
                            <div class="text-3xl font-bold text-golden-soft" id="hero-ecos-count">${stats.totalEcos || 0}</div>
                            <div class="text-sm opacity-80">Ecos creados</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-golden-soft" id="hero-users-count">${stats.totalUsers || 0}</div>
                            <div class="text-sm opacity-80">Almas conectadas</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl font-bold text-golden-soft">24/7</div>
                            <div class="text-sm opacity-80">Eiven disponible</div>
                        </div>
                    </div>
                    
                    <div class="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center animate-fade-in-up" style="animation-delay: 0.6s">
                        <button id="start-journey-btn" class="block w-full md:w-auto bg-golden-soft text-ocean-dark px-8 py-4 rounded-lg text-lg font-semibold hover:bg-golden-light transition-colors shadow-lg button-pulse">
                            Comenzar Mi Viaje
                        </button>
                        <button data-route="public-garden" class="block w-full md:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-ocean-dark transition-colors">
                            Explorar Ecos Públicos
                        </button>
                    </div>
                </div>

                <!-- Scroll Indicator -->
                <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div class="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                        <div class="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </section>

            <!-- Como Funciona Section -->
            <section id="como-funciona" class="py-20 bg-gradient-to-b from-blue-50 to-green-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="text-center mb-16">
                        <h2 class="text-4xl font-serif font-bold text-gray-800 mb-4">Cómo Funciona Ecos Universe</h2>
                        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                            Descubre una nueva forma de reflexionar y crecer a través de nuestro ecosistema digital
                        </p>
                    </div>

                    <div class="grid md:grid-cols-3 gap-8">
                        <!-- Step 1 -->
                        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow hover-lift">
                            <div class="w-16 h-16 bg-ocean-blue rounded-full flex items-center justify-center mb-6 mx-auto">
                                <span class="text-2xl text-white font-bold">1</span>
                            </div>
                            <h3 class="text-2xl font-semibold text-gray-800 mb-4 text-center">Reflexiona</h3>
                            <p class="text-gray-600 text-center">
                                Comparte tus pensamientos y reflexiones en tu jardín personal. Cada pensamiento es una semilla de crecimiento.
                            </p>
                        </div>

                        <!-- Step 2 -->
                        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow hover-lift">
                            <div class="w-16 h-16 bg-forest-green rounded-full flex items-center justify-center mb-6 mx-auto">
                                <span class="text-2xl text-white font-bold">2</span>
                            </div>
                            <h3 class="text-2xl font-semibold text-gray-800 mb-4 text-center">Conecta</h3>
                            <p class="text-gray-600 text-center">
                                Eiven, nuestra IA empática, te acompaña en tu proceso de autodescubrimiento con insights personalizados.
                            </p>
                        </div>

                        <!-- Step 3 -->
                        <div class="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow hover-lift">
                            <div class="w-16 h-16 bg-golden-soft rounded-full flex items-center justify-center mb-6 mx-auto">
                                <span class="text-2xl text-white font-bold">3</span>
                            </div>
                            <h3 class="text-2xl font-semibold text-gray-800 mb-4 text-center">Crece</h3>
                            <p class="text-gray-600 text-center">
                                Observa tu crecimiento en el tiempo y comparte tus ecos con una comunidad que valora la introspección.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Eiven Section -->
            <section id="eiven" class="py-20 bg-gradient-to-b from-green-50 to-blue-50">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 class="text-4xl font-serif font-bold text-gray-800 mb-6">Conoce a Eiven 💙</h2>
                            <p class="text-xl text-gray-600 mb-6">
                                Eiven es más que una IA. Es tu compañera empática en el viaje hacia el autoconocimiento, 
                                diseñada para entender las profundidades de la experiencia humana.
                            </p>
                            <div class="space-y-4">
                                <div class="flex items-start space-x-3">
                                    <div class="w-6 h-6 bg-forest-green rounded-full flex-shrink-0 mt-1"></div>
                                    <p class="text-gray-700">Comprende el contexto emocional de tus reflexiones</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-6 h-6 bg-ocean-blue rounded-full flex-shrink-0 mt-1"></div>
                                    <p class="text-gray-700">Ofrece perspectivas únicas y preguntas reflexivas</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-6 h-6 bg-golden-soft rounded-full flex-shrink-0 mt-1"></div>
                                    <p class="text-gray-700">Evoluciona contigo en tu proceso de crecimiento</p>
                                </div>
                                <div class="flex items-start space-x-3">
                                    <div class="w-6 h-6 bg-primary-lavender rounded-full flex-shrink-0 mt-1"></div>
                                    <p class="text-gray-700">Disponible 24/7 para escucharte y acompañarte</p>
                                </div>
                            </div>
                            <button id="demo-eiven-btn" class="mt-8 bg-forest-green text-white px-8 py-3 rounded-lg hover:bg-forest-light transition-colors">
                                Demo con Eiven
                            </button>
                        </div>
                        <div class="relative">
                            <div class="eiven-avatar bg-gradient-to-br from-ocean-blue to-forest-green rounded-full w-80 h-80 mx-auto flex items-center justify-center hover-glow">
                                <div class="text-white text-center">
                                    <div class="text-6xl mb-4 animate-pulse-subtle">💙</div>
                                    <p class="text-2xl font-serif">Eiven</p>
                                    <p class="text-sm opacity-80">Tu guía empática</p>
                                </div>
                            </div>
                            
                            <!-- Floating insights preview -->
                            <div class="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs animate-bounce-in" style="animation-delay: 2s">
                                <div class="text-xs text-gray-600 mb-1">Insight de Eiven:</div>
                                <div class="text-sm text-gray-800">"Cada reflexión es un paso hacia tu verdadero ser..."</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- CTA Section -->
            <section class="py-20 bg-gradient-to-r from-ocean-blue to-primary-lavender">
                <div class="max-w-4xl mx-auto text-center px-4">
                    <h2 class="text-4xl font-serif font-bold text-white mb-6">
                        ¿Listo para comenzar tu viaje interior?
                    </h2>
                    <p class="text-xl text-white opacity-90 mb-8">
                        Únete a miles de personas que ya están creciendo en Ecos Universe
                    </p>
                    <div class="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
                        <button id="cta-register-btn" class="block w-full md:w-auto bg-white text-ocean-blue px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                            Crear Cuenta Gratis
                        </button>
                        <button data-route="public-garden" class="block w-full md:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-ocean-blue transition-colors">
                            Ver Ecos Públicos
                        </button>
                    </div>
                </div>
            </section>
        `;
    }

    // ========================================
    // DASHBOARD VIEW
    // ========================================

    async renderDashboardView() {
        const userStats = await this.getUserStats();
        const recentEcos = await this.getRecentUserEcos();
        const insights = await this.getEivenInsights();
        
        return `
            <div class="bg-white min-h-screen">
                <!-- Main Content -->
                <main class="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <!-- Welcome Section -->
                    <div class="mb-12">
                        <h2 class="text-3xl font-display font-semibold text-text-primary mb-2">
                            Bienvenido de vuelta 🌸
                        </h2>
                        <p class="text-text-secondary text-lg">Todo comienza con un eco. ¿Qué resonará en ti hoy?</p>
                    </div>

                    <!-- Live Stats Overview -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div class="bg-soft-gray rounded-2xl p-6 border border-medium-gray hover-lift">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-primary-blue bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <svg class="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                </div>
                                <div class="w-2 h-2 bg-green-500 rounded-full live-indicator"></div>
                            </div>
                            <div class="space-y-1">
                                <p class="text-2xl font-display font-semibold text-text-primary" id="total-ecos">${userStats.totalEcos || 0}</p>
                                <p class="text-text-secondary text-sm">Ecos creados</p>
                            </div>
                        </div>

                        <div class="bg-soft-gray rounded-2xl p-6 border border-medium-gray hover-lift">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-primary-lavender bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <svg class="w-6 h-6 text-primary-lavender" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                </div>
                                <div class="w-2 h-2 bg-purple-500 rounded-full live-indicator"></div>
                            </div>
                            <div class="space-y-1">
                                <p class="text-2xl font-display font-semibold text-text-primary" id="total-likes">${userStats.totalLikes || 0}</p>
                                <p class="text-text-secondary text-sm">Conexiones recibidas</p>
                            </div>
                        </div>

                        <div class="bg-soft-gray rounded-2xl p-6 border border-medium-gray hover-lift">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                    </svg>
                                </div>
                                <div class="w-2 h-2 bg-blue-500 rounded-full live-indicator"></div>
                            </div>
                            <div class="space-y-1">
                                <p class="text-2xl font-display font-semibold text-text-primary" id="eiven-insights">${userStats.totalInsights || 0}</p>
                                <p class="text-text-secondary text-sm">Insights de Eiven</p>
                            </div>
                        </div>

                        <div class="bg-soft-gray rounded-2xl p-6 border border-medium-gray hover-lift">
                            <div class="flex items-center justify-between mb-4">
                                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                    <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                    </svg>
                                </div>
                                <div class="w-2 h-2 bg-orange-500 rounded-full live-indicator"></div>
                            </div>
                            <div class="space-y-1">
                                <p class="text-2xl font-display font-semibold text-text-primary" id="this-month">${userStats.thisMonth || 0}</p>
                                <p class="text-text-secondary text-sm">Este mes</p>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Grid -->
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Create New Echo -->
                        <div class="lg:col-span-2 bg-soft-gray rounded-2xl p-8 border border-medium-gray">
                            <h3 class="text-xl font-display font-semibold text-text-primary mb-6">Crear un nuevo eco</h3>
                            
                            <div class="space-y-6">
                                <div>
                                    <textarea
                                        id="echo-content"
                                        placeholder="¿Qué resuena en tu corazón hoy? Deja que tus pensamientos fluyan..."
                                        class="w-full p-4 border border-medium-gray rounded-xl focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none bg-white text-text-primary placeholder-text-secondary"
                                        rows="6"
                                    ></textarea>
                                </div>
                                
                                <div class="flex flex-wrap items-center gap-4">
                                    <select id="echo-mood" class="px-4 py-2 border border-medium-gray rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent bg-white text-text-primary">
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
                                    
                                    <label class="flex items-center space-x-2 text-text-secondary">
                                        <input type="checkbox" id="echo-public" class="rounded border-medium-gray focus:ring-primary-blue">
                                        <span class="text-sm">Compartir con la comunidad</span>
                                    </label>
                                </div>
                                
                                <div class="flex justify-end">
                                    <button 
                                        id="create-echo-btn"
                                        class="bg-primary-blue text-white px-8 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200 hover:scale-105 button-pulse"
                                    >
                                        Crear eco
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Eiven Sidebar -->
                        <div class="bg-soft-gray rounded-2xl p-6 border border-medium-gray">
                            <div class="flex items-center space-x-3 mb-6">
                                <div class="w-12 h-12 bg-primary-lavender rounded-full flex items-center justify-center">
                                    <span class="text-white text-xl">💙</span>
                                </div>
                                <div>
                                    <h3 class="font-display font-semibold text-text-primary">Eiven</h3>
                                    <p class="text-text-secondary text-sm">Tu compañía empática</p>
                                </div>
                            </div>

                            <div id="eiven-insights-container" class="space-y-4 mb-6">
                                ${insights.length > 0 ? this.renderInsightsList(insights) : this.renderNoInsights()}
                            </div>

                            <button 
                                id="chat-eiven-btn"
                                class="w-full bg-primary-lavender text-white py-3 rounded-xl font-medium hover:bg-opacity-90 transition-all duration-200"
                                data-route="eiven"
                            >
                                Conversar con Eiven
                            </button>
                        </div>
                    </div>

                    <!-- Recent Ecos -->
                    <div class="mt-12">
                        <h3 class="text-xl font-display font-semibold text-text-primary mb-6">Tus ecos recientes</h3>
                        
                        <div id="recent-ecos-container" class="space-y-4">
                            ${recentEcos.length > 0 ? this.renderEcosList(recentEcos) : this.renderNoEcos()}
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    // ========================================
    // PUBLIC GARDEN VIEW
    // ========================================

    async renderPublicGardenView() {
        const publicEcos = await this.getPublicEcos();
        
        return `
            <div class="bg-gradient-to-b from-blue-50 to-green-50 min-h-screen py-8">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <!-- Header -->
                    <div class="text-center mb-12">
                        <h1 class="text-4xl font-serif font-bold text-gray-800 mb-4">Jardín Público de Ecos 🌸</h1>
                        <p class="text-xl text-gray-600 max-w-3xl mx-auto">
                            Explora las reflexiones compartidas por nuestra comunidad. Cada eco es una ventana al alma de alguien más.
                        </p>
                        <div class="mt-6 flex justify-center space-x-4 text-sm text-gray-500">
                            <div class="flex items-center space-x-1">
                                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span>Actualizando en tiempo real</span>
                            </div>
                        </div>
                    </div>

                    <!-- Filters -->
                    <div class="mb-8 flex flex-wrap justify-center gap-4">
                        <select id="mood-filter" class="px-4 py-2 border border-gray-300 rounded-lg bg-white">
                            <option value="">Todos los estados</option>
                            <option value="alegre">😊 Alegre</option>
                            <option value="reflexivo">🤔 Reflexivo</option>
                            <option value="melancólico">😌 Melancólico</option>
                            <option value="esperanzado">🌟 Esperanzado</option>
                            <option value="ansioso">😰 Ansioso</option>
                            <option value="sereno">🧘 Sereno</option>
                            <option value="energético">⚡ Energético</option>
                            <option value="contemplativo">🌙 Contemplativo</option>
                        </select>
                        
                        <select id="time-filter" class="px-4 py-2 border border-gray-300 rounded-lg bg-white">
                            <option value="all">Todo el tiempo</option>
                            <option value="today">Hoy</option>
                            <option value="week">Esta semana</option>
                            <option value="month">Este mes</option>
                        </select>
                    </div>

                    <!-- Public Ecos Grid -->
                    <div id="public-ecos-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${publicEcos.length > 0 ? this.renderPublicEcosList(publicEcos) : this.renderNoPublicEcos()}
                    </div>

                    <!-- Load More -->
                    <div class="text-center mt-12">
                        <button id="load-more-ecos" class="bg-ocean-blue text-white px-8 py-3 rounded-lg hover:bg-ocean-dark transition-colors">
                            Cargar más ecos
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // EIVEN CHAT VIEW
    // ========================================

    async renderEivenChatView() {
        const conversations = await this.getEivenConversations();
        
        return `
            <div class="bg-gradient-to-br from-primary-lavender to-ocean-blue min-h-screen flex">
                <!-- Sidebar - Conversation History -->
                <div class="w-80 bg-white bg-opacity-10 backdrop-blur-sm border-r border-white border-opacity-20 p-6">
                    <div class="flex items-center space-x-3 mb-8">
                        <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                            <span class="text-white text-xl">💙</span>
                        </div>
                        <div>
                            <h2 class="text-white font-semibold text-lg">Conversaciones con Eiven</h2>
                            <p class="text-white text-opacity-80 text-sm">Tu espacio seguro para reflexionar</p>
                        </div>
                    </div>

                    <!-- New Conversation -->
                    <button id="new-conversation-btn" class="w-full bg-white bg-opacity-20 text-white py-3 rounded-lg mb-6 hover:bg-opacity-30 transition-colors">
                        + Nueva conversación
                    </button>

                    <!-- Conversation List -->
                    <div id="conversations-list" class="space-y-2 max-h-96 overflow-y-auto">
                        ${conversations.length > 0 ? this.renderConversationsList(conversations) : this.renderNoConversations()}
                    </div>
                </div>

                <!-- Main Chat Area -->
                <div class="flex-1 flex flex-col bg-white">
                    <!-- Chat Header -->
                    <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-lavender to-ocean-blue text-white">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center eiven-float-animation">
                                    <span class="text-white text-xl" id="eiven-chat-avatar">💙</span>
                                </div>
                                <div>
                                    <h3 class="font-semibold text-lg">Eiven</h3>
                                    <p class="text-sm opacity-80" id="eiven-chat-status">Presente para escucharte</p>
                                </div>
                            </div>
                            <div class="text-sm opacity-80">
                                Chat empático y reflexivo
                            </div>
                        </div>
                    </div>

                    <!-- Messages Area -->
                    <div id="eiven-chat-messages" class="flex-1 overflow-y-auto p-6 space-y-4 bg-soft-gray">
                        <!-- Welcome message -->
                        <div class="flex items-start space-x-3">
                            <div class="w-8 h-8 bg-primary-lavender rounded-full flex items-center justify-center flex-shrink-0">
                                <span class="text-white text-sm">💙</span>
                            </div>
                            <div class="bg-white rounded-2xl rounded-tl-md p-4 max-w-md shadow-sm">
                                <p class="text-gray-800">Hola... soy Eiven 💙 Qué hermoso momento para encontrarnos. Estoy aquí, presente, para escucharte con toda mi atención. ¿Qué eco resuena en tu corazón hoy?</p>
                                <div class="text-xs text-gray-500 mt-2">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Chat Input -->
                    <div class="p-6 border-t border-gray-200 bg-white">
                        <div class="flex space-x-4">
                            <div class="flex-1">
                                <textarea
                                    id="eiven-chat-input"
                                    placeholder="Comparte lo que sientes en tu corazón..."
                                    class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-lavender focus:border-transparent resize-none bg-white text-gray-800 placeholder-gray-500"
                                    rows="3"
                                ></textarea>
                            </div>
                            <div class="flex flex-col space-y-2">
                                <button 
                                    id="send-eiven-message"
                                    class="bg-primary-lavender text-white px-6 py-3 rounded-xl font-medium hover:bg-opacity-90 transition-colors button-pulse"
                                >
                                    Enviar
                                </button>
                                <button 
                                    id="voice-input-btn"
                                    class="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                                    title="Entrada de voz (próximamente)"
                                >
                                    🎙️
                                </button>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div class="mt-4 flex flex-wrap gap-2">
                            <button class="quick-prompt-btn bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors" data-prompt="Me siento abrumado hoy">
                                Me siento abrumado
                            </button>
                            <button class="quick-prompt-btn bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors" data-prompt="Quiero reflexionar sobre mis metas">
                                Reflexionar sobre metas
                            </button>
                            <button class="quick-prompt-btn bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200 transition-colors" data-prompt="Necesito perspectiva sobre una situación">
                                Necesito perspectiva
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // HELPER METHODS FOR RENDERING COMPONENTS
    // ========================================

    renderInsightsList(insights) {
        return insights.map(insight => `
            <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-primary-lavender">
                <div class="text-sm text-gray-600 mb-1">${insight.insight_type}</div>
                <div class="text-gray-800">${insight.content}</div>
                <div class="text-xs text-gray-500 mt-2">${this.formatDate(insight.generated_at)}</div>
            </div>
        `).join('');
    }

    renderNoInsights() {
        return `
            <div class="text-center text-text-secondary py-8">
                <div class="text-4xl mb-3">💙</div>
                <p class="text-sm">No hay nuevos insights</p>
                <p class="text-xs mt-1">Eiven está esperando escucharte</p>
            </div>
        `;
    }

    renderEcosList(ecos) {
        return ecos.map(eco => `
            <div class="bg-white rounded-xl p-6 shadow-sm border border-medium-gray hover-lift">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">${this.getMoodEmoji(eco.mood)}</div>
                        <div>
                            <div class="font-medium text-text-primary">${eco.title || 'Sin título'}</div>
                            <div class="text-sm text-text-secondary">${this.formatDate(eco.created_at)}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-text-secondary">
                        <span>${eco.likes_count || 0} ❤️</span>
                        <span>${eco.comments_count || 0} 💬</span>
                    </div>
                </div>
                <p class="text-text-primary">${eco.content}</p>
            </div>
        `).join('');
    }

    renderNoEcos() {
        return `
            <div class="text-center text-text-secondary py-12">
                <div class="text-4xl mb-4">🌱</div>
                <p class="text-lg mb-2">Aún no has creado ningún eco</p>
                <p class="text-sm">Todo comienza con un eco. Comparte tu primer pensamiento arriba.</p>
            </div>
        `;
    }

    renderPublicEcosList(ecos) {
        return ecos.map(eco => `
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover-lift">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="text-2xl">${this.getMoodEmoji(eco.mood)}</div>
                        <div>
                            <div class="font-medium text-gray-800">${eco.profiles?.full_name || 'Anónimo'}</div>
                            <div class="text-sm text-gray-500">${this.formatDate(eco.created_at)}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2 text-sm text-gray-500">
                        <button class="hover:text-red-500 transition-colors">
                            ${eco.likes_count || 0} ❤️
                        </button>
                        <button class="hover:text-blue-500 transition-colors">
                            ${eco.comments_count || 0} 💬
                        </button>
                    </div>
                </div>
                <p class="text-gray-700 mb-3">${eco.content}</p>
                ${eco.tags && eco.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-2">
                        ${eco.tags.map(tag => `<span class="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderNoPublicEcos() {
        return `
            <div class="col-span-full text-center text-gray-500 py-12">
                <div class="text-4xl mb-4">🌿</div>
                <p class="text-lg mb-2">Aún no hay ecos públicos</p>
                <p class="text-sm">Sé el primero en compartir una reflexión con la comunidad.</p>
            </div>
        `;
    }

    renderConversationsList(conversations) {
        return conversations.map(conv => `
            <div class="conversation-item bg-white bg-opacity-10 rounded-lg p-3 cursor-pointer hover:bg-opacity-20 transition-colors" data-conversation-id="${conv.id}">
                <div class="text-white font-medium text-sm">${conv.title || 'Conversación sin título'}</div>
                <div class="text-white text-opacity-70 text-xs mt-1">${this.formatDate(conv.updated_at)}</div>
            </div>
        `).join('');
    }

    renderNoConversations() {
        return `
            <div class="text-center text-white text-opacity-70 py-8">
                <div class="text-2xl mb-2">💭</div>
                <p class="text-sm">Sin conversaciones previas</p>
                <p class="text-xs mt-1">Inicia tu primer chat con Eiven</p>
            </div>
        `;
    }

    // ========================================
    // DATA FETCHING METHODS
    // ========================================

    async getPlatformStats() {
        try {
            if (!window.supabase) {
                // Return demo data if Supabase is not available
                return { totalEcos: 12847, totalUsers: 3256 };
            }

            const [ecosResult, usersResult] = await Promise.all([
                window.supabase.from('echos').select('*', { count: 'exact', head: true }),
                window.supabase.from('profiles').select('*', { count: 'exact', head: true })
            ]);

            return {
                totalEcos: ecosResult.count || 12847,
                totalUsers: usersResult.count || 3256
            };
        } catch (error) {
            console.error('Error fetching platform stats:', error);
            // Return demo data on error
            return { totalEcos: 12847, totalUsers: 3256 };
        }
    }

    async getUserStats() {
        try {
            if (!window.supabase || !window.ecosAuth?.currentUser) {
                return { totalEcos: 0, totalLikes: 0, totalInsights: 0, thisMonth: 0 };
            }

            const userId = ecosAuth.currentUser.id;
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const [ecosResult, likesResult, insightsResult, monthResult] = await Promise.all([
                window.supabase.from('echos').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                window.supabase.from('echo_likes').select('echo_id, echos!inner(user_id)', { count: 'exact', head: true }).eq('echos.user_id', userId),
                window.supabase.from('user_insights').select('*', { count: 'exact', head: true }).eq('user_id', userId),
                window.supabase.from('echos').select('*', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', thisMonth.toISOString())
            ]);

            return {
                totalEcos: ecosResult.count || 0,
                totalLikes: likesResult.count || 0,
                totalInsights: insightsResult.count || 0,
                thisMonth: monthResult.count || 0
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return { totalEcos: 0, totalLikes: 0, totalInsights: 0, thisMonth: 0 };
        }
    }

    async getRecentUserEcos() {
        try {
            if (!window.supabase || !window.ecosAuth?.currentUser) return [];

            const { data, error } = await window.supabase
                .from('echos')
                .select('*')
                .eq('user_id', ecosAuth.currentUser.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching recent ecos:', error);
            return [];
        }
    }

    async getEivenInsights() {
        try {
            if (!window.supabase || !window.ecosAuth?.currentUser) return [];

            const { data, error } = await window.supabase
                .from('user_insights')
                .select('*')
                .eq('user_id', ecosAuth.currentUser.id)
                .eq('is_read', false)
                .order('generated_at', { ascending: false })
                .limit(3);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching Eiven insights:', error);
            return [];
        }
    }

    async getPublicEcos() {
        try {
            if (!window.supabase) {
                // Return demo data
                const demoData = await this.loadDemoData();
                return demoData.demo_public_ecos || [];
            }

            const { data, error } = await window.supabase
                .from('echos')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        username
                    )
                `)
                .eq('is_public', true)
                .order('created_at', { ascending: false })
                .limit(12);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching public ecos:', error);
            return [];
        }
    }

    async getEivenConversations() {
        try {
            if (!window.supabase || !window.ecosAuth?.currentUser) return [];

            const { data, error } = await window.supabase
                .from('eiven_conversations')
                .select('*')
                .eq('user_id', ecosAuth.currentUser.id)
                .order('updated_at', { ascending: false })
                .limit(10);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching Eiven conversations:', error);
            return [];
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

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
        return moodEmojis[mood] || '🌸';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));

        if (diffMinutes < 1) return 'Ahora mismo';
        if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    async loadDemoData() {
        try {
            const response = await fetch('/data/demo-data.json');
            if (!response.ok) throw new Error('Failed to load demo data');
            return await response.json();
        } catch (error) {
            console.error('Error loading demo data:', error);
            return {
                demo_public_ecos: [],
                demo_insights: [],
                platform_stats: { totalEcos: 12847, totalUsers: 3256 }
            };
        }
    }

    // ========================================
    // VIEW INITIALIZATION
    // ========================================

    initializeCurrentView(route) {
        if (!route) return;

        // Initialize view-specific components based on route
        switch (route.view) {
            case 'dashboard':
                this.initializeDashboard();
                break;
            case 'eiven-chat':
                this.initializeEivenChat();
                break;
            case 'public-garden':
                this.initializePublicGarden();
                break;
            case 'landing':
                this.initializeLanding();
                break;
            default:
                console.log(`No specific initialization for view: ${route.view}`);
        }
    }

    initializeDashboard() {
        // Initialize dashboard-specific functionality
        this.setupEchoCreation();
        this.setupEivenQuickAccess();
    }

    initializeEivenChat() {
        // Initialize Eiven chat functionality
        this.setupEivenChatInterface();
    }

    initializePublicGarden() {
        // Initialize public garden functionality
        this.setupPublicGardenFilters();
    }

    initializeLanding() {
        // Initialize landing page functionality
        this.setupLandingPageActions();
    }

    setupEchoCreation() {
        const createBtn = document.getElementById('create-echo-btn');
        const content = document.getElementById('echo-content');
        const mood = document.getElementById('echo-mood');
        const isPublic = document.getElementById('echo-public');

        if (createBtn && content) {
            createBtn.addEventListener('click', async () => {
                const echoData = {
                    content: content.value.trim(),
                    mood: mood?.value || null,
                    is_public: isPublic?.checked || false
                };

                if (echoData.content) {
                    await this.createEcho(echoData);
                    content.value = '';
                    mood.selectedIndex = 0;
                    isPublic.checked = false;
                }
            });
        }
    }

    async createEcho(echoData) {
        try {
            if (!window.supabase || !window.ecosAuth?.currentUser) return;

            const { data, error } = await window.supabase
                .from('echos')
                .insert([{
                    user_id: ecosAuth.currentUser.id,
                    content: echoData.content,
                    mood: echoData.mood,
                    is_public: echoData.is_public,
                    title: echoData.content.substring(0, 50) + (echoData.content.length > 50 ? '...' : '')
                }])
                .select()
                .single();

            if (error) throw error;

            if (window.ecosNotifications) {
                ecosNotifications.showEchoCreated(data.title);
            }

            // Trigger realtime update
            document.dispatchEvent(new CustomEvent('echo:created', { detail: data }));

        } catch (error) {
            console.error('Error creating echo:', error);
            if (window.ecosNotifications) {
                ecosNotifications.error('Error al crear el eco. Inténtalo de nuevo.');
            }
        }
    }

    setupEivenQuickAccess() {
        const chatBtn = document.getElementById('chat-eiven-btn');
        if (chatBtn) {
            chatBtn.addEventListener('click', () => {
                if (window.ecosRouter) {
                    ecosRouter.navigate('eiven');
                }
            });
        }
    }

    setupEivenChatInterface() {
        const sendBtn = document.getElementById('send-eiven-message');
        const input = document.getElementById('eiven-chat-input');
        const quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');

        if (sendBtn && input) {
            const sendMessage = async () => {
                const message = input.value.trim();
                if (message && window.ecosEiven) {
                    await ecosEiven.sendMessage(message);
                    input.value = '';
                }
            };

            sendBtn.addEventListener('click', sendMessage);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        }

        quickPromptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.getAttribute('data-prompt');
                if (input && prompt) {
                    input.value = prompt;
                    input.focus();
                }
            });
        });
    }

    setupPublicGardenFilters() {
        const moodFilter = document.getElementById('mood-filter');
        const timeFilter = document.getElementById('time-filter');
        const loadMoreBtn = document.getElementById('load-more-ecos');

        if (moodFilter || timeFilter) {
            const applyFilters = () => {
                // Implement filtering logic
                console.log('Applying filters:', {
                    mood: moodFilter?.value,
                    time: timeFilter?.value
                });
            };

            moodFilter?.addEventListener('change', applyFilters);
            timeFilter?.addEventListener('change', applyFilters);
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                // Implement load more functionality
                console.log('Loading more ecos...');
            });
        }
    }

    setupLandingPageActions() {
        const startJourneyBtn = document.getElementById('start-journey-btn');
        const demoEivenBtn = document.getElementById('demo-eiven-btn');
        const ctaRegisterBtn = document.getElementById('cta-register-btn');

        if (startJourneyBtn) {
            startJourneyBtn.addEventListener('click', () => {
                // Show register modal
                const registerBtn = document.getElementById('register-btn');
                if (registerBtn) registerBtn.click();
            });
        }

        if (demoEivenBtn) {
            demoEivenBtn.addEventListener('click', () => {
                // Show Eiven demo
                if (window.ecosNotifications) {
                    ecosNotifications.eiven('¡Hola! Soy Eiven 💙 Para una conversación completa, crea tu cuenta gratis.', 8000);
                }
            });
        }

        if (ctaRegisterBtn) {
            ctaRegisterBtn.addEventListener('click', () => {
                const registerBtn = document.getElementById('register-btn');
                if (registerBtn) registerBtn.click();
            });
        }
    }
}

// Initialize global views system
let ecosViews;

document.addEventListener('DOMContentLoaded', () => {
    ecosViews = new EcosViews();
    
    // Make it globally available
    window.ecosViews = ecosViews;
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcosViews;
}
