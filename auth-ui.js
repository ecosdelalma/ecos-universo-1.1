// Authentication UI - Alex Implementation
// Interfaz de autenticación con estilo minimalista

class AuthUI {
    constructor() {
        this.currentForm = 'login';
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupAuthListener();
        this.checkInitialAuth();
    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    setupEventListeners() {
        // Form switching
        document.getElementById('show-register')?.addEventListener('click', () => this.showForm('register'));
        document.getElementById('show-login')?.addEventListener('click', () => this.showForm('login'));
        document.getElementById('forgot-password-btn')?.addEventListener('click', () => this.showForm('forgot'));
        document.getElementById('back-to-login')?.addEventListener('click', () => this.showForm('login'));

        // Form submissions
        document.getElementById('login-form-element')?.addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('register-form-element')?.addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('forgot-password-form-element')?.addEventListener('submit', (e) => this.handleForgotPassword(e));

        // Password visibility toggles
        document.getElementById('toggle-login-password')?.addEventListener('click', () => this.togglePasswordVisibility('login-password'));
        document.getElementById('toggle-register-password')?.addEventListener('click', () => this.togglePasswordVisibility('register-password'));

        // Demo login
        document.getElementById('demo-login')?.addEventListener('click', () => this.handleDemoLogin());

        // Password confirmation validation
        document.getElementById('register-password-confirm')?.addEventListener('input', () => this.validatePasswordMatch());
    }

    setupAuthListener() {
        // Listen for auth state changes
        ecosAuth.onAuthChange((user) => {
            if (user) {
                this.handleAuthSuccess();
            }
        });
    }

    async checkInitialAuth() {
        // Check if user is already authenticated
        if (ecosAuth.isAuthenticated()) {
            this.redirectToDashboard();
        }
    }

    // =====================================================
    // FORM MANAGEMENT
    // =====================================================

    showForm(formType) {
        // Hide all forms
        document.getElementById('login-form')?.classList.add('hidden');
        document.getElementById('register-form')?.classList.add('hidden');
        document.getElementById('forgot-password-form')?.classList.add('hidden');

        // Show selected form
        document.getElementById(`${formType}-form`)?.classList.remove('hidden');
        
        this.currentForm = formType;
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = document.querySelector(`#${formType}-form input`);
            firstInput?.focus();
        }, 100);
    }

    // =====================================================
    // AUTHENTICATION HANDLERS
    // =====================================================

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!this.validateEmail(email)) {
            this.showError('Por favor ingresa un email válido');
            return;
        }

        if (!password) {
            this.showError('Por favor ingresa tu contraseña');
            return;
        }

        this.setLoading(true);

        try {
            const result = await ecosAuth.signIn(email, password);
            
            if (result.success) {
                this.showSuccess('¡Bienvenido de vuelta!');
                // handleAuthSuccess will be called by auth listener
            } else {
                this.showError(this.translateAuthError(result.error));
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
        } finally {
            this.setLoading(false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        const termsAccepted = document.getElementById('terms-accept').checked;

        // Validation
        if (!name) {
            this.showError('Por favor ingresa tu nombre');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('Por favor ingresa un email válido');
            return;
        }

        if (password.length < 6) {
            this.showError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Las contraseñas no coinciden');
            return;
        }

        if (!termsAccepted) {
            this.showError('Debes aceptar los términos de servicio');
            return;
        }

        this.setLoading(true);

        try {
            const result = await ecosAuth.signUp(email, password, {
                fullName: name
            });
            
            if (result.success) {
                if (result.requiresConfirmation) {
                    this.showSuccess('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.');
                    this.showForm('login');
                } else {
                    this.showSuccess('¡Cuenta creada exitosamente!');
                    // handleAuthSuccess will be called by auth listener
                }
            } else {
                this.showError(this.translateAuthError(result.error));
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showError('Error al crear la cuenta. Por favor, inténtalo de nuevo.');
        } finally {
            this.setLoading(false);
        }
    }

    async handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value.trim();

        if (!this.validateEmail(email)) {
            this.showError('Por favor ingresa un email válido');
            return;
        }

        this.setLoading(true);

        try {
            const result = await ecosAuth.resetPassword(email);
            
            if (result.success) {
                this.showSuccess(result.message);
                this.showForm('login');
            } else {
                this.showError(result.error);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            this.showError('Error al enviar el enlace de recuperación');
        } finally {
            this.setLoading(false);
        }
    }

    async handleDemoLogin() {
        this.setLoading(true);

        try {
            // Demo credentials
            const result = await ecosAuth.signIn('demo@ecos.com', 'demo123456');
            
            if (result.success) {
                this.showSuccess('¡Bienvenido a la demo de Ecos!');
            } else {
                // If demo account doesn't exist, create it
                const createResult = await ecosAuth.signUp('demo@ecos.com', 'demo123456', {
                    fullName: 'Usuario Demo'
                });

                if (createResult.success) {
                    this.showSuccess('¡Cuenta demo creada! Puedes explorar Ecos.');
                } else {
                    this.showError('Error al acceder a la cuenta demo');
                }
            }
        } catch (error) {
            console.error('Demo login error:', error);
            this.showError('Error al acceder a la cuenta demo');
        } finally {
            this.setLoading(false);
        }
    }

    // =====================================================
    // UI HELPERS
    // =====================================================

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(`toggle-${inputId.replace('-password', '')}-password`);
        
        if (input.type === 'password') {
            input.type = 'text';
            button.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12.000m6.878-6.878L21 3m-6.878 6.878L12 12.000"></path>
                </svg>
            `;
        } else {
            input.type = 'password';
            button.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
            `;
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        const confirmInput = document.getElementById('register-password-confirm');

        if (confirmPassword && password !== confirmPassword) {
            confirmInput.classList.add('border-red-500');
            confirmInput.classList.remove('border-medium-gray');
        } else {
            confirmInput.classList.remove('border-red-500');
            confirmInput.classList.add('border-medium-gray');
        }
    }

    setLoading(loading) {
        const overlay = document.getElementById('loading-overlay');
        const submitButtons = document.querySelectorAll('button[type="submit"]');

        if (loading) {
            overlay?.classList.remove('hidden');
            submitButtons.forEach(btn => {
                btn.disabled = true;
                btn.classList.add('opacity-50');
            });
        } else {
            overlay?.classList.add('hidden');
            submitButtons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('opacity-50');
            });
        }
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // =====================================================
    // MESSAGING
    // =====================================================

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' :
            type === 'error' ? 'bg-red-500 text-white' :
            type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-primary-blue text-white'
        }`;
        
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="flex-shrink-0">
                    ${type === 'success' ? `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    ` : type === 'error' ? `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    ` : `
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    `}
                </div>
                <span class="text-sm font-medium">${message}</span>
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
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    translateAuthError(error) {
        const errorMessages = {
            'Invalid login credentials': 'Email o contraseña incorrectos',
            'Email not confirmed': 'Por favor confirma tu email antes de iniciar sesión',
            'User already registered': 'Este email ya está registrado',
            'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres',
            'Invalid email': 'Email inválido',
            'Signup requires a valid password': 'Se requiere una contraseña válida',
            'Unable to validate email address: invalid format': 'Formato de email inválido',
            'User not found': 'Usuario no encontrado'
        };

        return errorMessages[error] || error || 'Error de autenticación';
    }

    // =====================================================
    // NAVIGATION
    // =====================================================

    handleAuthSuccess() {
        this.showSuccess('¡Autenticación exitosa! Redirigiendo...');
        
        setTimeout(() => {
            this.redirectToDashboard();
        }, 1500);
    }

    redirectToDashboard() {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Initialize Auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authUI = new AuthUI();
});