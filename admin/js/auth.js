// Script d'authentification pour le back office
class AuthManager {
    constructor() {
        console.log('🔧 Initialisation AuthManager...');
        this.supabase = null;
        this.currentUser = null;
        this.initializeWhenReady();
    }

    async initializeWhenReady() {
        console.log('⏳ Attente du client Supabase...');
        
        // Attendre que supabaseClient soit disponible
        let attempts = 0;
        while (!window.supabaseClient && attempts < 100) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            if (attempts % 10 === 0) {
                console.log(`⏳ Tentative ${attempts}/100...`);
            }
        }
        
        if (!window.supabaseClient) {
            console.error('❌ Impossible de charger Supabase après 10 secondes');
            this.showError('Erreur de configuration Supabase');
            return;
        }
        
        console.log('✅ Client Supabase trouvé');
        this.supabase = window.supabaseClient;
        this.init();
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    async init() {
        console.log('🚀 Initialisation de l\'authentification...');
        
        try {
            // Vérifier si l'utilisateur est déjà connecté
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Erreur lors de la récupération de la session:', error);
                throw error;
            }
            
            if (session) {
                console.log('✅ Session existante trouvée pour:', session.user.email);
                this.currentUser = session.user;
                this.redirectToAdmin();
                return;
            }
            
            console.log('ℹ️ Aucune session existante');

            // Écouter les changements d'authentification
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('🔄 Changement d\'état auth:', event);
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    console.log('✅ Connexion réussie pour:', session.user.email);
                    this.redirectToAdmin();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    console.log('👋 Déconnexion');
                    this.redirectToLogin();
                }
            });

            this.setupLoginForm();
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur d\'initialisation: ' + error.message);
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');
        const loadingMessage = document.getElementById('loadingMessage');
        const loginBtn = document.getElementById('loginBtn');

        // Reset messages
        errorMessage.style.display = 'none';
        loadingMessage.style.display = 'block';
        loginBtn.disabled = true;

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            // Vérifier si l'utilisateur a les permissions admin
            if (await this.checkAdminPermissions(data.user)) {
                console.log('✅ Connexion administrateur réussie');
                // La redirection se fera automatiquement via onAuthStateChange
            } else {
                await this.supabase.auth.signOut();
                throw new Error('Accès non autorisé. Vous n\'avez pas les permissions administrateur.');
            }

        } catch (error) {
            console.error('❌ Erreur de connexion:', error);
            
            let errorText = 'Erreur de connexion';
            if (error.message.includes('Invalid login credentials')) {
                errorText = 'Email ou mot de passe incorrect';
            } else if (error.message.includes('non autorisé')) {
                errorText = error.message;
            } else if (error.message.includes('Email not confirmed')) {
                errorText = 'Veuillez confirmer votre email avant de vous connecter';
            }

            errorMessage.textContent = errorText;
            errorMessage.style.display = 'block';
        } finally {
            loadingMessage.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    async checkAdminPermissions(user) {
        try {
            console.log('🔍 Vérification des permissions pour:', user.email);
            
            // Option 1: Vérifier par email dans une liste prédéfinie (TEMPORAIRE POUR TEST)
            const adminEmails = [
                'admin@orangedigitalcenter.ma',
                'backoffice@odc.ma',
                user.email // TEMPORAIRE: autoriser l'email connecté pour les tests
            ];
            
            if (adminEmails.includes(user.email)) {
                console.log('✅ Email autorisé:', user.email);
                return true;
            }

            // Option 2: Vérifier dans une table Supabase 'admin_users' (désactivé temporairement)
            /*
            const { data, error } = await this.supabase
                .from('admin_users')
                .select('id, role')
                .eq('email', user.email)
                .eq('active', true)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = pas de résultat
                console.warn('Erreur lors de la vérification admin:', error);
                return false;
            }

            return data !== null;
            */
            
            return false;

        } catch (error) {
            console.error('Erreur lors de la vérification des permissions:', error);
            return false;
        }
    }

    redirectToAdmin() {
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    }

    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            console.log('✅ Déconnexion réussie');
        } catch (error) {
            console.error('❌ Erreur de déconnexion:', error);
        }
    }

    async requireAuth() {
        try {
            console.log('🔐 Vérification de l\'authentification requise...');
            
            if (!this.supabase) {
                console.error('❌ Client Supabase non disponible');
                this.redirectToLogin();
                return false;
            }
            
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('❌ Erreur lors de la récupération de la session:', error);
                this.redirectToLogin();
                return false;
            }
            
            if (!session || !session.user) {
                console.log('❌ Aucune session utilisateur trouvée');
                this.redirectToLogin();
                return false;
            }

            console.log('✅ Session trouvée pour:', session.user.email);

            // Vérifier les permissions admin
            const hasPermission = await this.checkAdminPermissions(session.user);
            if (!hasPermission) {
                console.log('❌ Permissions insuffisantes pour:', session.user.email);
                await this.supabase.auth.signOut();
                this.redirectToLogin();
                return false;
            }

            console.log('✅ Permissions admin validées pour:', session.user.email);
            this.currentUser = session.user;
            return true;
            
        } catch (error) {
            console.error('❌ Erreur lors de la vérification auth:', error);
            this.redirectToLogin();
            return false;
        }
    }
}

// Initialiser le gestionnaire d'authentification
const authManager = new AuthManager();

// Fonction pour protéger les pages admin
async function protectAdminPage() {
    const isAuthenticated = await authManager.requireAuth();
    if (!isAuthenticated) {
        return false;
    }
    
    // Ajouter le bouton de déconnexion
    addLogoutButton();
    return true;
}

// Ajouter un bouton de déconnexion
function addLogoutButton() {
    const header = document.querySelector('.admin-header');
    if (header && !document.getElementById('logoutBtn')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logoutBtn';
        logoutBtn.className = 'logout-btn';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Déconnexion';
        logoutBtn.style.cssText = `
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: #dc3545;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9rem;
            z-index: 1000;
        `;
        
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                await authManager.logout();
            }
        });
        
        document.body.appendChild(logoutBtn);
    }
}

// Exposer pour utilisation globale
window.authManager = authManager;
window.protectAdminPage = protectAdminPage;