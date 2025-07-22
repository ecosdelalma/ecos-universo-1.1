// Dashboard Functionality - Alex Implementation
// Funcionalidades internas del dashboard con estilo minimalista

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.userGardens = [];
        this.recentEcos = [];
        this.initialize();
    }

    async initialize() {
        // Check authentication
        ecosAuth.onAuthChange((user) => {
            this.currentUser = user;
            if (user) {
                this.loadDashboardData();
            } else {
                window.location.href = '../index.html';
            }
        });

        this.setupEventListeners();
        this.loadDashboardData();
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    setupEventListeners() {
        // Create echo button
        const createEchoBtn = document.getElementById('create-echo-btn');
        if (createEchoBtn) {
            createEchoBtn.addEventListener('click', () => this.createEcho());
        }

        // Enter key in echo content
        const echoContent = document.getElementById('echo-content');
        if (echoContent) {
            echoContent.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    this.createEcho();
                }
            });
        }

        // Eiven chat
        const chatEivenBtn = document.getElementById('chat-eiven-btn');
        const closeEivenModal = document.getElementById('close-eiven-modal');
        const sendEivenMessage = document.getElementById('send-eiven-message');
        const eivenInput = document.getElementById('eiven-input');

        if (chatEivenBtn) {
            chatEivenBtn.addEventListener('click', () => this.openEivenChat());
        }

        if (closeEivenModal) {
            closeEivenModal.addEventListener('click', () => this.closeEivenChat());
        }

        if (sendEivenMessage) {
            sendEivenMessage.addEventListener('click', () => this.sendEivenMessage());
        }

        if (eivenInput) {
            eivenInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendEivenMessage();
                }
            });
        }

        // Close modal on backdrop click
        const eivenModal = document.getElementById('eiven-modal');
        if (eivenModal) {
            eivenModal.addEventListener('click', (e) => {
                if (e.target === eivenModal) {
                    this.closeEivenChat();
                }
            });
        }
    }

    // =====================================================
    // DATA LOADING
    // =====================================================

    async loadDashboardData() {
        if (!this.currentUser) return;

        try {
            // Load user stats
            await this.loadUserStats();
            
            // Load user gardens
            await this.loadUserGardens();
            
            // Load recent ecos
            await this.loadRecentEcos();
            
            // Load Eiven insights
            await this.loadEivenInsights();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error al cargar los datos del dashboard', 'error');
        }
    }

    async loadUserStats() {
        try {
            const result = await ecosAPI.getDashboardData();
            
            if (result.success && result.dashboard) {
                const stats = result.dashboard.stats || {};
                
                // Update stats display
                document.getElementById('total-ecos').textContent = stats.total_echos || 0;
                document.getElementById('total-likes').textContent = stats.total_likes_received || 0;
                document.getElementById('this-month').textContent = stats.this_month_echos || 0;
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    async loadUserGardens() {
        try {
            const result = await ecosAPI.getGardens(this.currentUser.id);
            
            if (result.success) {
                this.userGardens = result.gardens;
            }
        } catch (error) {
            console.error('Error loading user gardens:', error);
        }
    }

    async loadRecentEcos() {
        try {
            const result = await ecosAPI.getEchos({
                userId: this.currentUser.id,
                limit: 5,
                sortBy: 'created_at',
                sortOrder: 'desc'
            });

            if (result.success) {
                this.recentEcos = result.echos;
                this.displayRecentEcos(result.echos);
            }
        } catch (error) {
            console.error('Error loading recent ecos:', error);
        }
    }

    async loadEivenInsights() {
        try {
            const { data, error } = await supabase
                .from('user_insights')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('is_read', false)
                .order('generated_at', { ascending: false })
                .limit(3);

            if (error) {
                console.error('Error loading insights:', error);
                return;
            }

            // Update insights count
            document.getElementById('eiven-insights').textContent = data?.length || 0;
            
            this.displayEivenInsights(data || []);
        } catch (error) {
            console.error('Error loading Eiven insights:', error);
        }
    }

    // =====================================================
    // ECO CREATION
    // =====================================================

    async createEcho() {
        const content = document.getElementById('echo-content').value.trim();
        const mood = document.getElementById('echo-mood').value;
        const isPublic = document.getElementById('echo-public').checked;

        if (!content) {
            this.showNotification('Por favor escribe algún contenido para tu eco', 'warning');
            return;
        }

        if (this.userGardens.length === 0) {
            this.showNotification('No tienes jardines disponibles', 'error');
            return;
        }

        // Show loading state
        const createBtn = document.getElementById('create-echo-btn');
        const originalText = createBtn.textContent;
        createBtn.textContent = 'Creando...';
        createBtn.disabled = true;

        try {
            const result = await ecosAPI.createEcho({
                content: content,
                mood: mood || null,
                gardenId: this.userGardens[0].id, // Use first garden
                isPublic: isPublic
            });

            if (result.success) {
                // Clear form
                document.getElementById('echo-content').value = '';
                document.getElementById('echo-mood').value = '';
                document.getElementById('echo-public').checked = false;

                this.showNotification('¡Eco creado exitosamente!', 'success');
                
                // Reload data
                await this.loadUserStats();
                await this.loadRecentEcos();

            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Error creating echo:', error);
            this.showNotification('Error al crear el eco: ' + error.message, 'error');
        } finally {
            // Reset button
            createBtn.textContent = originalText;
            createBtn.disabled = false;
        }
    }

    // =====================================================
    // DISPLAY METHODS
    // =====================================================

    displayRecentEcos(ecos) {
        const container = document.getElementById('recent-ecos-container');
        if (!container) return;

        if (ecos.length === 0) {
            container.innerHTML = `
                <div class="text-center text-text-secondary py-12">
                    <div class="text-4xl mb-4">🌱</div>
                    <p class="text-lg mb-2">Aún no has creado ningún eco</p>
                    <p class="text-sm">Todo comienza con un eco. Comparte tu primer pensamiento arriba.</p>
                </div>
            `;
            return;
        }

        const ecosHTML = ecos.map(eco => `
            <div class="bg-soft-gray rounded-xl p-6 border border-medium-gray hover:shadow-lg transition-all duration-200">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        ${eco.mood ? `<span class="text-2xl">${this.getMoodEmoji(eco.mood)}</span>` : ''}
                        <span class="text-text-secondary text-sm">${this.formatDate(eco.created_at)}</span>
                    </div>
                    <div class="flex items-center space-x-4 text-text-secondary text-sm">
                        <span class="flex items-center space-x-1">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path>
                            </svg>
                            <span>${eco.likes_count}</span>
                        </span>
                        <span class="flex items-center space-x-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            <span>${eco.comments_count}</span>
                        </span>
                    </div>
                </div>
                
                ${eco.title ? `<h4 class="font-display font-semibold text-text-primary mb-3">${eco.title}</h4>` : ''}
                
                <p class="text-text-primary leading-relaxed mb-4">${eco.content}</p>
                
                ${eco.tags && eco.tags.length > 0 ? `
                    <div class="flex flex-wrap gap-2">
                        ${eco.tags.map(tag => `
                            <span class="px-3 py-1 bg-primary-blue bg-opacity-10 text-primary-blue text-xs rounded-full">#${tag}</span>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');

        container.innerHTML = ecosHTML;
    }

    displayEivenInsights(insights) {
        const container = document.getElementById('eiven-insights-container');
        if (!container) return;

        if (insights.length === 0) {
            container.innerHTML = `
                <div class="text-center text-text-secondary py-8">
                    <div class="text-4xl mb-3">💙</div>
                    <p class="text-sm">No hay nuevos insights</p>
                    <p class="text-xs mt-1">Eiven está esperando escucharte</p>
                </div>
            `;
            return;
        }

        const insightsHTML = insights.map(insight => `
            <div class="bg-primary-lavender bg-opacity-10 rounded-xl p-4 border border-primary-lavender border-opacity-20">
                <h4 class="font-medium text-text-primary text-sm mb-2">${insight.title}</h4>
                <p class="text-text-secondary text-xs leading-relaxed">${insight.content.substring(0, 120)}${insight.content.length > 120 ? '...' : ''}</p>
                <button 
                    onclick="dashboardManager.markInsightAsRead('${insight.id}')"
                    class="text-primary-lavender text-xs mt-2 hover:underline"
                >
                    Marcar como leído
                </button>
            </div>
        `).join('');

        container.innerHTML = insightsHTML;
    }

    // =====================================================
    // EIVEN CHAT
    // =====================================================

    openEivenChat() {
        const modal = document.getElementById('eiven-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Load conversation
            this.loadEivenConversation();
        }
    }

    closeEivenChat() {
        const modal = document.getElementById('eiven-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    async loadEivenConversation() {
        const messagesContainer = document.getElementById('eiven-messages');
        if (!messagesContainer) return;

        // Check if there's an active conversation
        const conversation = eiven.getCurrentConversation();
        
        if (!conversation || !conversation.messages.length) {
            // Start new conversation
            const result = await eiven.startNewConversation();
            if (result.success) {
                this.displayEivenMessages(result.messages);
            }
        } else {
            this.displayEivenMessages(conversation.messages);
        }
    }

    async sendEivenMessage() {
        const input = document.getElementById('eiven-input');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        // Clear input and add user message
        input.value = '';
        this.addEivenMessage({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Show typing indicator
        this.showEivenTyping(true);

        try {
            const result = await eiven.sendMessage(message);
            
            if (result.success) {
                this.addEivenMessage(result.message);
            } else {
                this.addEivenMessage({
                    role: 'assistant',
                    content: 'Disculpa, no pude procesar tu mensaje en este momento. ¿Puedes intentar de nuevo?',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error sending message to Eiven:', error);
            this.addEivenMessage({
                role: 'assistant',
                content: 'Hubo un problema al conectar conmigo. Por favor, inténtalo nuevamente.',
                timestamp: new Date().toISOString()
            });
        } finally {
            this.showEivenTyping(false);
        }
    }

    displayEivenMessages(messages) {
        const container = document.getElementById('eiven-messages');
        if (!container) return;

        const messagesHTML = messages.map(msg => this.createEivenMessageHTML(msg)).join('');
        container.innerHTML = messagesHTML;
        container.scrollTop = container.scrollHeight;
    }

    addEivenMessage(message) {
        const container = document.getElementById('eiven-messages');
        if (!container) return;

        const messageHTML = this.createEivenMessageHTML(message);
        container.insertAdjacentHTML('beforeend', messageHTML);
        container.scrollTop = container.scrollHeight;
    }

    createEivenMessageHTML(message) {
        const isUser = message.role === 'user';
        const time = this.formatTime(message.timestamp);
        
        return `
            <div class="flex ${isUser ? 'justify-end' : 'justify-start'}">
                <div class="max-w-xs lg:max-w-md">
                    ${!isUser ? `
                        <div class="flex items-center space-x-2 mb-2">
                            <div class="w-6 h-6 bg-primary-lavender rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">💙</span>
                            </div>
                            <span class="text-text-secondary text-xs">Eiven</span>
                        </div>
                    ` : ''}
                    <div class="p-4 rounded-2xl ${
                        isUser 
                            ? 'bg-primary-blue text-white ml-8' 
                            : 'bg-soft-gray border border-medium-gray text-text-primary'
                    }">
                        <p class="text-sm leading-relaxed">${message.content}</p>
                        <p class="text-xs mt-2 ${isUser ? 'text-blue-100' : 'text-text-secondary'}">${time}</p>
                    </div>
                </div>
            </div>
        `;
    }

    showEivenTyping(show) {
        const container = document.getElementById('eiven-messages');
        if (!container) return;

        // Remove existing typing indicator
        const existingTyping = container.querySelector('.typing-indicator');
        if (existingTyping) {
            existingTyping.remove();
        }

        if (show) {
            const typingHTML = `
                <div class="flex justify-start typing-indicator">
                    <div class="max-w-xs lg:max-w-md">
                        <div class="flex items-center space-x-2 mb-2">
                            <div class="w-6 h-6 bg-primary-lavender rounded-full flex items-center justify-center">
                                <span class="text-white text-xs">💙</span>
                            </div>
                            <span class="text-text-secondary text-xs">Eiven está escribiendo...</span>
                        </div>
                        <div class="p-4 rounded-2xl bg-soft-gray border border-medium-gray">
                            <div class="flex space-x-1">
                                <div class="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                                <div class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                                <div class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', typingHTML);
            container.scrollTop = container.scrollHeight;
        }
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    async markInsightAsRead(insightId) {
        try {
            const { error } = await supabase
                .from('user_insights')
                .update({ is_read: true })
                .eq('id', insightId);

            if (!error) {
                await this.loadEivenInsights();
            }
        } catch (error) {
            console.error('Error marking insight as read:', error);
        }
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-primary-blue text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="text-sm">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 hover:opacity-75">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});