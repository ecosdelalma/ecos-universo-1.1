// Ecos Universe - Real-time System
// Sistema de tiempo real usando Supabase Realtime para contadores, notificaciones e insights de Eiven

class EcosRealtime {
    constructor() {
        this.isConnected = false;
        this.subscriptions = new Map();
        this.counters = {
            ecos: 0,
            insights: 0,
            likes: 0,
            comments: 0
        };
        this.currentUser = null;
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Ecos Realtime System...');
        
        // Wait for auth system to be ready
        this.waitForAuth();
    }

    waitForAuth() {
        if (window.ecosAuth && ecosAuth.currentUser) {
            this.currentUser = ecosAuth.currentUser;
            this.startRealtimeSubscriptions();
        } else {
            // Listen for auth changes
            document.addEventListener('auth:user-signed-in', (event) => {
                this.currentUser = event.detail.user;
                this.startRealtimeSubscriptions();
            });
            
            document.addEventListener('auth:user-signed-out', () => {
                this.currentUser = null;
                this.stopRealtimeSubscriptions();
            });
        }
    }

    async startRealtimeSubscriptions() {
        if (!this.currentUser) return;
        
        console.log('🚀 Starting realtime subscriptions for user:', this.currentUser.id);
        
        try {
            // Subscribe to user's eco changes
            await this.subscribeToUserEcos();
            
            // Subscribe to community ecos for public garden
            await this.subscribeToCommunityEcos();
            
            // Subscribe to echo interactions (likes, comments)
            await this.subscribeToEchoInteractions();
            
            // Subscribe to Eiven insights
            await this.subscribeToEivenInsights();
            
            // Subscribe to general platform stats
            await this.subscribeToPlatformStats();
            
            // Start counter updates
            this.startCounterUpdates();
            
            this.isConnected = true;
            console.log('✅ Realtime system connected');
            
            // Notify about connection status
            if (window.ecosNotifications) {
                ecosNotifications.showConnectionStatus(true);
            }
            
        } catch (error) {
            console.error('❌ Error starting realtime subscriptions:', error);
            this.isConnected = false;
        }
    }

    async subscribeToUserEcos() {
        if (!window.supabase || !this.currentUser) return;
        
        const subscription = window.supabase
            .channel(`user-ecos-${this.currentUser.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'echos',
                filter: `user_id=eq.${this.currentUser.id}`
            }, (payload) => {
                this.handleUserEcoChange(payload);
            })
            .subscribe();
        
        this.subscriptions.set('user-ecos', subscription);
    }

    async subscribeToCommunityEcos() {
        if (!window.supabase) return;
        
        const subscription = window.supabase
            .channel('community-ecos')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'echos',
                filter: 'is_public=eq.true'
            }, (payload) => {
                this.handleCommunityEcoChange(payload);
            })
            .subscribe();
        
        this.subscriptions.set('community-ecos', subscription);
    }

    async subscribeToEchoInteractions() {
        if (!window.supabase || !this.currentUser) return;
        
        // Subscribe to likes on user's ecos
        const likesSubscription = window.supabase
            .channel(`echo-likes-${this.currentUser.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'echo_likes'
            }, (payload) => {
                this.handleEchoLike(payload);
            })
            .subscribe();
        
        // Subscribe to comments on user's ecos
        const commentsSubscription = window.supabase
            .channel(`echo-comments-${this.currentUser.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'echo_comments'
            }, (payload) => {
                this.handleEchoComment(payload);
            })
            .subscribe();
        
        this.subscriptions.set('echo-likes', likesSubscription);
        this.subscriptions.set('echo-comments', commentsSubscription);
    }

    async subscribeToEivenInsights() {
        if (!window.supabase || !this.currentUser) return;
        
        const subscription = window.supabase
            .channel(`eiven-insights-${this.currentUser.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'user_insights',
                filter: `user_id=eq.${this.currentUser.id}`
            }, (payload) => {
                this.handleNewEivenInsight(payload);
            })
            .subscribe();
        
        this.subscriptions.set('eiven-insights', subscription);
    }

    async subscribeToPlatformStats() {
        if (!window.supabase) return;
        
        // Subscribe to general platform changes for statistics
        const subscription = window.supabase
            .channel('platform-stats')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'echos'
            }, () => {
                this.updatePlatformStats();
            })
            .subscribe();
        
        this.subscriptions.set('platform-stats', subscription);
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================

    handleUserEcoChange(payload) {
        console.log('📝 User eco change:', payload);
        
        switch (payload.eventType) {
            case 'INSERT':
                this.counters.ecos++;
                this.updateCounter('ecos');
                
                if (window.ecosNotifications) {
                    ecosNotifications.showEchoCreated(payload.new.title);
                }
                
                // Trigger event for other components
                document.dispatchEvent(new CustomEvent('echo:created', {
                    detail: payload.new
                }));
                break;
                
            case 'UPDATE':
                // Handle eco updates (likes count, etc.)
                this.updateEchoInUI(payload.new);
                break;
                
            case 'DELETE':
                this.counters.ecos = Math.max(0, this.counters.ecos - 1);
                this.updateCounter('ecos');
                break;
        }
    }

    handleCommunityEcoChange(payload) {
        console.log('🌍 Community eco change:', payload);
        
        if (payload.eventType === 'INSERT') {
            // Don't show notification for user's own ecos
            if (payload.new.user_id !== this.currentUser?.id) {
                // Update community ecos count
                this.updateCommunityStats();
                
                // Trigger event for community view updates
                document.dispatchEvent(new CustomEvent('community:new-eco', {
                    detail: payload.new
                }));
            }
        }
    }

    async handleEchoLike(payload) {
        console.log('💜 Echo like:', payload);
        
        // Check if this like is on current user's echo
        if (payload.new.echo_id) {
            try {
                const { data: echo } = await window.supabase
                    .from('echos')
                    .select('user_id, title, content')
                    .eq('id', payload.new.echo_id)
                    .single();
                
                if (echo && echo.user_id === this.currentUser?.id) {
                    this.counters.likes++;
                    this.updateCounter('likes');
                    
                    // Show notification
                    if (window.ecosNotifications) {
                        ecosNotifications.showEchoInteraction('like', {
                            echo_preview: echo.title || echo.content?.substring(0, 50) + '...'
                        });
                    }
                    
                    // Trigger event
                    document.dispatchEvent(new CustomEvent('echo:new-like', {
                        detail: { echo, like: payload.new }
                    }));
                }
            } catch (error) {
                console.error('Error handling echo like:', error);
            }
        }
    }

    async handleEchoComment(payload) {
        console.log('💬 Echo comment:', payload);
        
        // Check if this comment is on current user's echo
        if (payload.new.echo_id) {
            try {
                const { data: echo } = await window.supabase
                    .from('echos')
                    .select('user_id, title, content')
                    .eq('id', payload.new.echo_id)
                    .single();
                
                if (echo && echo.user_id === this.currentUser?.id) {
                    this.counters.comments++;
                    this.updateCounter('comments');
                    
                    // Show notification
                    if (window.ecosNotifications) {
                        ecosNotifications.showEchoInteraction('comment', {
                            echo_preview: echo.title || echo.content?.substring(0, 50) + '...',
                            comment_preview: payload.new.content?.substring(0, 50) + '...'
                        });
                    }
                    
                    // Trigger event
                    document.dispatchEvent(new CustomEvent('echo:new-comment', {
                        detail: { echo, comment: payload.new }
                    }));
                }
            } catch (error) {
                console.error('Error handling echo comment:', error);
            }
        }
    }

    handleNewEivenInsight(payload) {
        console.log('💙 New Eiven insight:', payload);
        
        this.counters.insights++;
        this.updateCounter('insights');
        
        // Show notification with insight preview
        if (window.ecosNotifications) {
            ecosNotifications.showEivenInsight({
                id: payload.new.id,
                preview: payload.new.content?.substring(0, 100) + '...',
                type: payload.new.insight_type
            });
        }
        
        // Trigger event for Eiven chat to show notification
        document.dispatchEvent(new CustomEvent('eiven:new-insight', {
            detail: payload.new
        }));
        
        // Update Eiven avatar to show notification
        this.showEivenNotification();
    }

    // ========================================
    // COUNTER UPDATES
    // ========================================

    updateCounter(type) {
        const element = document.getElementById(`live-${type}-count`);
        if (element) {
            element.textContent = this.counters[type];
            element.classList.add('counter-update');
            
            setTimeout(() => {
                element.classList.remove('counter-update');
            }, 600);
        }
    }

    async loadInitialCounters() {
        if (!window.supabase || !this.currentUser) return;
        
        try {
            // Load user's ecos count
            const { count: ecosCount } = await window.supabase
                .from('echos')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.currentUser.id);
            
            // Load user's insights count
            const { count: insightsCount } = await window.supabase
                .from('user_insights')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', this.currentUser.id);
            
            // Load likes received count
            const { count: likesCount } = await window.supabase
                .from('echo_likes')
                .select('echo_id, echos!inner(user_id)', { count: 'exact', head: true })
                .eq('echos.user_id', this.currentUser.id);
            
            this.counters.ecos = ecosCount || 0;
            this.counters.insights = insightsCount || 0;
            this.counters.likes = likesCount || 0;
            
            // Update UI
            this.updateCounter('ecos');
            this.updateCounter('insights');
            this.updateCounter('likes');
            
        } catch (error) {
            console.error('Error loading initial counters:', error);
        }
    }

    startCounterUpdates() {
        // Load initial values
        this.loadInitialCounters();
        
        // Periodic sync (every 30 seconds)
        setInterval(() => {
            if (this.isConnected) {
                this.loadInitialCounters();
            }
        }, 30000);
    }

    // ========================================
    // EIVEN INTEGRATION
    // ========================================

    showEivenNotification() {
        const notificationDot = document.getElementById('eiven-notification-dot');
        const notificationCount = document.getElementById('eiven-notification-count');
        
        if (notificationDot && notificationCount) {
            const currentCount = parseInt(notificationCount.textContent) || 0;
            notificationCount.textContent = currentCount + 1;
            notificationDot.classList.remove('hidden');
            
            // Add pulsing animation to Eiven avatar
            const avatar = document.getElementById('eiven-avatar-container');
            if (avatar) {
                avatar.classList.add('animate-pulse-subtle');
            }
        }
    }

    clearEivenNotifications() {
        const notificationDot = document.getElementById('eiven-notification-dot');
        const notificationCount = document.getElementById('eiven-notification-count');
        const avatar = document.getElementById('eiven-avatar-container');
        
        if (notificationDot) notificationDot.classList.add('hidden');
        if (notificationCount) notificationCount.textContent = '0';
        if (avatar) avatar.classList.remove('animate-pulse-subtle');
    }

    // ========================================
    // PLATFORM STATISTICS
    // ========================================

    async updatePlatformStats() {
        // Update general platform statistics for landing page
        try {
            const { count: totalEcos } = await window.supabase
                .from('echos')
                .select('*', { count: 'exact', head: true });
            
            const { count: totalUsers } = await window.supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
            
            // Trigger event to update landing page stats
            document.dispatchEvent(new CustomEvent('platform:stats-updated', {
                detail: {
                    totalEcos: totalEcos || 0,
                    totalUsers: totalUsers || 0
                }
            }));
            
        } catch (error) {
            console.error('Error updating platform stats:', error);
        }
    }

    async updateCommunityStats() {
        // Check for new community ecos to show notification
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
            
            const { count: recentEcos } = await window.supabase
                .from('echos')
                .select('*', { count: 'exact', head: true })
                .eq('is_public', true)
                .gte('created_at', oneHourAgo);
            
            if (recentEcos > 0 && window.ecosNotifications) {
                ecosNotifications.showNewEcosCount(recentEcos);
            }
            
        } catch (error) {
            console.error('Error updating community stats:', error);
        }
    }

    // ========================================
    // LIFECYCLE MANAGEMENT
    // ========================================

    stopRealtimeSubscriptions() {
        console.log('🔌 Stopping realtime subscriptions...');
        
        this.subscriptions.forEach((subscription, key) => {
            try {
                window.supabase.removeChannel(subscription);
                console.log(`✅ Unsubscribed from ${key}`);
            } catch (error) {
                console.error(`❌ Error unsubscribing from ${key}:`, error);
            }
        });
        
        this.subscriptions.clear();
        this.isConnected = false;
        
        // Reset counters
        Object.keys(this.counters).forEach(key => {
            this.counters[key] = 0;
            this.updateCounter(key);
        });
        
        // Clear Eiven notifications
        this.clearEivenNotifications();
        
        if (window.ecosNotifications) {
            ecosNotifications.showConnectionStatus(false);
        }
    }

    // ========================================
    // UTILITY METHODS
    // ========================================

    getConnectionStatus() {
        return this.isConnected;
    }

    getCounters() {
        return { ...this.counters };
    }

    updateEchoInUI(echoData) {
        // Trigger event for UI components to update echo display
        document.dispatchEvent(new CustomEvent('echo:updated', {
            detail: echoData
        }));
    }
}

// Initialize global realtime system
let ecosRealtime;

document.addEventListener('DOMContentLoaded', () => {
    ecosRealtime = new EcosRealtime();
    
    // Make it globally available
    window.ecosRealtime = ecosRealtime;
});

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EcosRealtime;
}
