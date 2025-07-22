// Ecos Platform - Authentication System
// Sistema de autenticación completo con Supabase

class EcosAuth {
    constructor() {
        this.currentUser = null;
        this.authCallbacks = [];
        this.initialize();
    }

    async initialize() {
        // Check current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user) {
            await this.setCurrentUser(session.user);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session?.user) {
                await this.setCurrentUser(session.user);
                this.handleAuthSuccess();
            } else if (event === 'SIGNED_OUT') {
                this.setCurrentUser(null);
                this.handleSignOut();
            }
        });
    }

    async setCurrentUser(user) {
        this.currentUser = user;
        
        if (user) {
            // Get user profile
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                this.currentUser.profile = profile;
            }
        }

        // Trigger auth callbacks
        this.authCallbacks.forEach(callback => callback(this.currentUser));
    }

    onAuthChange(callback) {
        this.authCallbacks.push(callback);
    }

    // =====================================================
    // AUTHENTICATION METHODS
    // =====================================================

    async signUp(email, password, userData = {}) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: userData.fullName || '',
                        username: userData.username || ''
                    }
                }
            });

            if (error) {
                console.error('SignUp error:', error);
                throw error;
            }

            if (data.user && !data.session) {
                // Email confirmation required
                return {
                    success: true,
                    requiresConfirmation: true,
                    message: 'Por favor revisa tu email para confirmar tu cuenta'
                };
            }

            return {
                success: true,
                user: data.user,
                session: data.session
            };

        } catch (error) {
            console.error('SignUp error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('SignIn error:', error);
                throw error;
            }

            return {
                success: true,
                user: data.user,
                session: data.session
            };

        } catch (error) {
            console.error('SignIn error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('SignOut error:', error);
                throw error;
            }

            return { success: true };

        } catch (error) {
            console.error('SignOut error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async resetPassword(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) {
                console.error('Password reset error:', error);
                throw error;
            }

            return {
                success: true,
                message: 'Te hemos enviado un enlace de recuperación por email'
            };

        } catch (error) {
            console.error('Password reset error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error('Password update error:', error);
                throw error;
            }

            return {
                success: true,
                message: 'Contraseña actualizada correctamente'
            };

        } catch (error) {
            console.error('Password update error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =====================================================
    // PROFILE METHODS
    // =====================================================

    async updateProfile(profileData) {
        if (!this.currentUser) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    username: profileData.username,
                    full_name: profileData.fullName,
                    bio: profileData.bio,
                    avatar_url: profileData.avatarUrl,
                    location: profileData.location,
                    website: profileData.website,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.currentUser.id)
                .select()
                .single();

            if (error) {
                console.error('Profile update error:', error);
                throw error;
            }

            // Update current user profile
            this.currentUser.profile = data;

            return {
                success: true,
                profile: data
            };

        } catch (error) {
            console.error('Profile update error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async uploadAvatar(file) {
        if (!this.currentUser) {
            throw new Error('Usuario no autenticado');
        }

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${this.currentUser.id}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.error('Avatar upload error:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile with new avatar URL
            await this.updateProfile({
                ...this.currentUser.profile,
                avatarUrl: data.publicUrl
            });

            return {
                success: true,
                avatarUrl: data.publicUrl
            };

        } catch (error) {
            console.error('Avatar upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getCurrentUserId() {
        return this.currentUser?.id || null;
    }

    getUserProfile() {
        return this.currentUser?.profile || null;
    }

    handleAuthSuccess() {
        // Hide login/register modals
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        
        if (loginModal) loginModal.classList.add('hidden');
        if (registerModal) registerModal.classList.add('hidden');

        // Show success message
        this.showMessage('¡Bienvenido a Ecos!', 'success');

        // Redirect to dashboard or reload page
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    handleSignOut() {
        // Show landing page elements
        document.getElementById('app-container')?.classList.add('hidden');
        document.querySelector('nav')?.classList.remove('hidden');
        document.querySelector('#inicio')?.classList.remove('hidden');

        this.showMessage('Sesión cerrada correctamente', 'info');
    }

    showMessage(message, type = 'info') {
        // Create and show toast message
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
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // =====================================================
    // ERROR HANDLING
    // =====================================================

    translateError(error) {
        const errorMessages = {
            'Invalid login credentials': 'Email o contraseña incorrectos',
            'Email not confirmed': 'Por favor confirma tu email antes de iniciar sesión',
            'User already registered': 'Este email ya está registrado',
            'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
            'Invalid email': 'Email inválido'
        };

        return errorMessages[error] || error;
    }
}

// Initialize auth system
const ecosAuth = new EcosAuth();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcosAuth, ecosAuth };
}
