(function() {
    window.ENV = {
        SUPABASE_URL: '<!-- SUPABASE_URL_PLACEHOLDER -->',
        SUPABASE_ANON_KEY: '<!-- SUPABASE_ANON_KEY_PLACEHOLDER -->'
    };
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.warn('🔧 Mode développement détecté. Utilisation des variables de test.');
        window.ENV = {
            SUPABASE_URL: 'YOUR_DEV_SUPABASE_URL',
            SUPABASE_ANON_KEY: 'YOUR_DEV_SUPABASE_ANON_KEY'
        };
    }
})();
