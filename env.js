// Script pour injecter les variables d'environnement
// Ce script sera exécuté au chargement de la page
(function() {
    // Configuration des variables d'environnement
    window.ENV = {
        SUPABASE_URL: '<!-- SUPABASE_URL_PLACEHOLDER -->',
        SUPABASE_ANON_KEY: '<!-- SUPABASE_ANON_KEY_PLACEHOLDER -->'
    };
    
    // En développement local, utiliser des valeurs de test
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('🔧 Mode développement détecté. Utilisation des variables de test.');
        // Vous devrez remplacer ces valeurs par vos vraies clés pour le développement local
        window.ENV = {
            SUPABASE_URL: 'YOUR_DEV_SUPABASE_URL',
            SUPABASE_ANON_KEY: 'YOUR_DEV_SUPABASE_ANON_KEY'
        };
    }
})();