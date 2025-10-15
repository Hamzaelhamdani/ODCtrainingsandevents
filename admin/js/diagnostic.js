// Script de diagnostic complet pour ODC Events
// ========================================

async function runDiagnostics() {
    const results = [];
    
    function log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] ${message}`);
        results.push({ timestamp, message, type });
    }
    
    try {
        log('🚀 Démarrage du diagnostic complet...', 'start');
        
        // 1. Vérification des dépendances
        log('1️⃣ Vérification des dépendances...');
        
        if (typeof window.supabase === 'undefined') {
            throw new Error('❌ Supabase SDK non chargé');
        }
        log('✅ Supabase SDK chargé');
        
        if (typeof window.SupabaseAPI === 'undefined') {
            throw new Error('❌ SupabaseAPI non disponible');
        }
        log('✅ SupabaseAPI disponible');
        
        // 2. Test de connexion
        log('2️⃣ Test de connexion à Supabase...');
        const connectionOk = await window.SupabaseAPI.testConnection();
        if (!connectionOk) {
            throw new Error('❌ Connexion Supabase échouée');
        }
        log('✅ Connexion Supabase réussie');
        
        // 3. Test des formations (qui marche)
        log('3️⃣ Test du chargement des formations...');
        const formations = await window.SupabaseAPI.getFormations();
        log(`✅ ${formations.length} formations chargées`);
        
        // 4. Test des événements
        log('4️⃣ Test du chargement des événements...');
        const events = await window.SupabaseAPI.getEvents();
        log(`📅 ${events.length} événements chargés`);
        
        if (events.length === 0) {
            log('⚠️ Aucun événement trouvé - Vérifiez la base de données');
        } else {
            log(`✅ Événements trouvés:`);
            events.forEach((event, index) => {
                log(`  ${index + 1}. ${event.title} (${event.date_start}) - Status: ${event.status}`);
            });
        }
        
        // 5. Test de l'interface admin
        log('5️⃣ Vérification de l\'interface admin...');
        
        const addButton = document.getElementById('addNewBtn');
        if (!addButton) {
            log('❌ Bouton ajouter non trouvé');
        } else {
            log('✅ Bouton ajouter trouvé');
        }
        
        const eventsTableBody = document.getElementById('eventsTableBody');
        if (!eventsTableBody) {
            log('❌ Table des événements non trouvée');
        } else {
            log('✅ Table des événements trouvée');
        }
        
        const eventsPage = document.getElementById('events-page');
        if (!eventsPage) {
            log('❌ Page événements non trouvée');
        } else {
            log('✅ Page événements trouvée');
        }
        
        // 6. Test des fonctions événements
        log('6️⃣ Test des fonctions d\'événements...');
        
        if (typeof window.showEventModal === 'function') {
            log('✅ showEventModal disponible');
        } else {
            log('❌ showEventModal non disponible');
        }
        
        if (typeof window.loadEventsTable === 'function') {
            log('✅ loadEventsTable disponible');
        } else {
            log('❌ loadEventsTable non disponible');
        }
        
        log('✅ Diagnostic terminé avec succès !', 'success');
        
    } catch (error) {
        log(`❌ ERREUR: ${error.message}`, 'error');
        console.error('Erreur détaillée:', error);
    }
    
    // Afficher les résultats
    displayResults(results);
}

function displayResults(results) {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #FF7900;
        border-radius: 8px;
        padding: 20px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: monospace;
        font-size: 12px;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'Diagnostic ODC Events';
    title.style.cssText = 'color: #FF7900; margin-bottom: 15px; text-align: center;';
    container.appendChild(title);
    
    const resultsList = document.createElement('div');
    results.forEach(result => {
        const item = document.createElement('div');
        item.style.cssText = `
            margin-bottom: 8px;
            padding: 5px;
            border-left: 3px solid ${
                result.type === 'error' ? '#dc3545' : 
                result.type === 'success' ? '#28a745' : '#FF7900'
            };
            padding-left: 8px;
        `;
        item.textContent = `[${result.timestamp}] ${result.message}`;
        resultsList.appendChild(item);
    });
    
    container.appendChild(resultsList);
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fermer';
    closeButton.style.cssText = `
        background: #FF7900;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 15px;
        display: block;
        margin-left: auto;
        margin-right: auto;
    `;
    closeButton.onclick = () => container.remove();
    container.appendChild(closeButton);
    
    document.body.appendChild(container);
}

// Exposer la fonction de diagnostic pour utilisation manuelle
window.runODCDiagnostics = runDiagnostics;

// Ne plus exécuter automatiquement - le diagnostic sera déclenché manuellement
console.log('🔧 Diagnostic ODC disponible - utilisez runODCDiagnostics() pour l\'exécuter');

// Optionnel : Exécuter seulement si un paramètre URL spécifique est présent
if (window.location.search.includes('diagnostic=true')) {
    console.log('🚀 Paramètre diagnostic détecté, exécution automatique...');
    setTimeout(runDiagnostics, 2000);
}