// Ecos Universe - Notification System
// Sistema de notificaciones en tiempo real con soporte para insights de Eiven

class EcosNotifications {
    constructor() {
        this.container = null;
        this.notifications = new Map();
        this.maxNotifications = 5;
        this.defaultDuration = 5000;
        this.init();
    }

    init() {
        this.container = document.getElementById('notification-container');
        if (!this.container) {
            console.error('Notification container not found');
            return;
        }
        
        // Listen for real-time events
        this.setupRealtimeListeners();
    }

    setupRealtimeListeners() {
        // Listen for new insights from Eiven
        document.addEventListener('eiven:new-insight', (event) => {
            this.showEivenInsight(event.detail);
        });

        // Listen for echo interactions
        document.addEventListener('echo:new-like', (event) => {
            this.showEchoInteraction('like', event.detail);
        });

        document.addEventListener('echo:new-comment', (event) => {
            this.showEchoInteraction('comment', event.detail);
        });

        // Listen for system notifications
        document.addEventListener('system:notification', (event) => {
            this.show(event.detail.message, event.detail.type, event.detail.duration);
        });
    }

    show(message, type = 'info', duration = null, options = {}) {
        const id = this.generateId();
        const notification = this.createNotificationElement(id, message, type, options);
        
        // Add to container
        this.container.appendChild(notification);
        this.notifications.set(id, notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Auto-remove
        const finalDuration = duration || this.defaultDuration;
        if (finalDuration > 0) {
            setTimeout(() => {
                this.hide(id);
            }, finalDuration);
        }
        
        // Limit max notifications
        this.enforceMaxNotifications();
        
        return id;
    }

    createNotificationElement(id, message, type, options) {
        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.className = `notification ${this.getTypeClass(type)} rounded-lg shadow-lg p-4 mb-2 text-white flex items-start space-x-3 min-w-80`;
        
        const icon = this.getIcon(type);
        const timestamp = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        notification.innerHTML = `
            <div class="flex-shrink-0 text-xl">
                ${icon}
            </div>
            <div class="flex-1">
                <div class="text-sm font-medium">
                    ${message}
                </div>
                ${options.subtitle ? `<div class="text-xs opacity-80 mt-1">${options.subtitle}</div>` : ''}
                <div class="text-xs opacity-60 mt-1">
                    ${timestamp}
                </div>
            </div>
            <button onclick="ecosNotifications.hide('${id}')" class="flex-shrink-0 text-white hover:text-gray-200 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;
        
        // Add click handler for interactive notifications
        if (options.action) {
            notification.style.cursor = 'pointer';
            notification.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                    options.action();
                    this.hide(id);
                }
            });
        }
        
        return notification;
    }

    hide(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.notifications.delete(id);
        }, 300);
    }

    getTypeClass(type) {
        const typeClasses = {
            'success': 'notification-success',
            'info': 'notification-info',
            'warning': 'notification-warning',
            'error': 'notification-error',
            'eiven': 'notification-eiven'
        };
        return typeClasses[type] || typeClasses['info'];
    }

    getIcon(type) {
        const icons = {
            'success': '✅',
            'info': 'ℹ️',
            'warning': '⚠️',
            'error': '❌',
            'eiven': '💙'
        };
        return icons[type] || icons['info'];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    enforceMaxNotifications() {
        const notificationElements = this.container.children;
        while (notificationElements.length > this.maxNotifications) {
            const oldest = notificationElements[0];
            if (oldest) {
                const id = oldest.id.replace('notification-', '');
                this.hide(id);
            }
        }
    }

    // ========================================
    // SPECIFIC NOTIFICATION TYPES
    // ========================================

    showEivenInsight(insight) {
        const message = insight.preview || 'Eiven tiene un nuevo insight para ti';
        const options = {
            subtitle: 'Haz clic para ver el insight completo',
            action: () => {
                // Navigate to Eiven chat or show insight modal
                window.ecosRouter?.navigate('eiven');
                // Trigger event to show specific insight
                document.dispatchEvent(new CustomEvent('eiven:show-insight', {
                    detail: insight
                }));
            }
        };
        
        return this.show(message, 'eiven', 8000, options);
    }

    showEchoInteraction(interactionType, data) {
        let message = '';
        let subtitle = '';
        
        switch (interactionType) {
            case 'like':
                message = `💜 Alguien conectó con tu eco`;
                subtitle = `"${data.echo_preview || 'Tu reflexión'}"`;
                break;
            case 'comment':
                message = `💬 Nuevo comentario en tu eco`;
                subtitle = `"${data.comment_preview || 'Alguien respondió'}"`;
                break;
        }
        
        const options = {
            subtitle,
            action: () => {
                // Navigate to echo or garden
                window.ecosRouter?.navigate('garden');
            }
        };
        
        return this.show(message, 'info', 6000, options);
    }

    showWelcomeMessage(userName) {
        const message = `¡Bienvenido de vuelta, ${userName}! 🌸`;
        const options = {
            subtitle: 'Tu jardín de ecos te está esperando'
        };
        
        return this.show(message, 'success', 4000, options);
    }

    showEchoCreated(ecoTitle) {
        const message = '🌱 Tu eco ha sido plantado';
        const options = {
            subtitle: `"${ecoTitle || 'Tu nueva reflexión'}" está ahora en tu jardín`
        };
        
        return this.show(message, 'success', 4000, options);
    }

    showConnectionStatus(isOnline) {
        if (isOnline) {
            this.show('🌐 Conectado a Ecos Universe', 'success', 2000);
        } else {
            this.show('🔌 Sin conexión - Modo offline', 'warning', 5000);
        }
    }

    showNewEcosCount(count) {
        if (count > 0) {
            const message = `${count} nuevo${count > 1 ? 's' : ''} eco${count > 1 ? 's' : ''} en la comunidad`;
            const options = {
                subtitle: 'Explora las nuevas reflexiones compartidas',
                action: () => {
                    window.ecosRouter?.navigate('community');
                }
            };
            
            return this.show(message, 'info', 6000, options);
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    success(message, duration, options) {
        return this.show(message, 'success', duration, options);
    }

    info(message, duration, options) {
        return this.show(message, 'info', duration, options);
    }

    warning(message, duration, options) {
        return this.show(message, 'warning', duration, options);
    }

    error(message, duration, options) {
        return this.show(message, 'error', duration, options);
    }

    eiven(message, duration, options) {
        return this.show(message, 'eiven', duration, options);
    }

    clear() {
        Array.from(this.notifications.keys()).forEach(id => {
            this.hide(id);
        });
    }

    count() {
        return this.notifications.size;
    }
}

// Initialize global notifications system
let ecosNotifications;

document.addEventListener('DOMContentLoaded', () => {
    ecosNotifications = new EcosNotifications();
    
    // Make it globally available
    window.ecosNotifications = ecosNotifications;
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcosNotifications;
}
