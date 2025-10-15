// ========================================
// GESTION D'ERREURS GLOBALE
// ========================================

window.addEventListener('error', function(e) {
    console.error('❌ Erreur JavaScript globale:', e.error);
    console.error('  Fichier:', e.filename);
    console.error('  Ligne:', e.lineno);
    console.error('  Colonne:', e.colno);
});

// ========================================
// ADMIN ODC - AVEC SUPABASE
// ========================================

// Variables globales
let formations = [];
let events = [];
let settings = {};
let currentEditId = null;
let currentPage = 'dashboard';

// Variables pour le filtrage
let filteredFormations = [];
let currentFilters = {
    search: '',
    category: '',
    city: ''
};

// ========================================
// INITIALISATION
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation de l\'interface admin...');
    
    // Tester la connexion Supabase
    const connectionOk = await window.SupabaseAPI.testConnection();
    if (!connectionOk) {
        showNotification('Erreur de connexion à Supabase. Vérifiez votre configuration.', 'error');
        return;
    } else {
        showNotification('Connexion Supabase établie avec succès !', 'success');
    }
    
    // Initialiser le stockage d'images
    try {
        console.log('📸 Vérification du stockage d\'images...');
        const bucketReady = await window.SupabaseAPI.createImageBucket();
        if (bucketReady) {
            console.log('✅ Stockage d\'images prêt');
            showNotification('Stockage d\'images Supabase disponible', 'success');
        } else {
            console.warn('⚠️ Bucket odc-images manquant');
            showNotification('⚠️ Créez le bucket "odc-images" dans Supabase Storage pour activer l\'upload cloud', 'warning');
        }
    } catch (error) {
        console.error('❌ Erreur de vérification du stockage:', error);
        showNotification('Mode local activé - Stockage cloud indisponible', 'info');
    }
    
    // Charger les données
    await loadAllData();
    
    // Initialiser l'interface
    initializeNavigation();
    showPage('dashboard');
    updateDashboardStats();
    
    console.log('✅ Interface admin initialisée');
});

// ========================================
// CHARGEMENT DES DONNÉES
// ========================================

function getDefaultSettings() {
    return {
        siteTitle: 'Orange Digital Center - Formations & Événements du Mois',
        heroTitle: 'Orange Digital Center',
        heroSubtitle: 'Découvrez nos formations et événements dans tous nos centres Orange Digital Center',
        contactEmail: 'contact@odc.orange.ma',
        contactPhone: '',
        odcCenters: [
            { name: 'ODC Rabat', address: 'Technopolis Rabat-Shore, Rabat', phone: '' },
            { name: 'ODC Agadir', address: 'Quartier Industriel, Agadir', phone: '' },
            { name: 'ODC Ben M\'sik', address: 'Ben M\'sik, Casablanca', phone: '' },
            { name: 'ODC Sidi Maarouf', address: 'Sidi Maarouf, Casablanca', phone: '' }
        ]
    };
}

async function loadAllData() {
    try {
        console.log('🔄 Chargement des données...');
        
        // Vérifier que SupabaseAPI est disponible
        if (!window.SupabaseAPI) {
            console.error('❌ SupabaseAPI non disponible, attente...');
            // Attendre que SupabaseAPI soit disponible
            let attempts = 0;
            while (!window.SupabaseAPI && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.SupabaseAPI) {
                console.error('❌ Impossible de charger SupabaseAPI');
                // Utiliser des données par défaut
                formations = [];
                events = [];
                settings = getDefaultSettings();
                filteredFormations = [];
                return;
            }
        }
        
        console.log('✅ SupabaseAPI disponible, chargement des données...');
        
        // Charger en parallèle
        const [loadedFormations, loadedEvents, loadedSettings] = await Promise.all([
            window.SupabaseAPI.getFormations(),
            window.SupabaseAPI.getEvents(),
            window.SupabaseAPI.getSettings()
        ]);
        
        formations = loadedFormations;
        events = loadedEvents;
        settings = loadedSettings;
        
        // Initialiser les formations filtrées
        filteredFormations = [...formations];
        
        console.log(`✅ ${formations.length} formations, ${events.length} événements chargés`);
        
        // Rafraîchir l'affichage
        loadFormationsTable();
        loadEventsTable();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement des données', 'error');
    }
}

// ========================================
// NAVIGATION
// ========================================

function initializeNavigation() {
    // Navigation dans la sidebar
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer la classe active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            // Ajouter la classe active au lien cliqué
            this.classList.add('active');
            
            // Afficher la page correspondante
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Bouton d'ajout
    const addButton = document.getElementById('addNewBtn');
    if (addButton) {
        addButton.addEventListener('click', handleAddButton);
    }

    // Sidebar toggle pour mobile
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    // Bouton test stockage
    const testStorageBtn = document.getElementById('testStorageBtn');
    if (testStorageBtn) {
        testStorageBtn.addEventListener('click', handleTestStorage);
    }

    // Bouton test événements
    const testEventsBtn = document.getElementById('testEventsBtn');
    if (testEventsBtn) {
        testEventsBtn.addEventListener('click', handleTestEvents);
    }

    // Modal close
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Gestionnaires de filtrage
    setupFilterHandlers();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}

function showPage(pageId) {
    console.log(`🔄 Navigation vers la page: ${pageId}`);
    currentPage = pageId;
    
    // Masquer toutes les pages
    const pages = document.querySelectorAll('.content-page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Afficher la page demandée
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
        console.log(`✅ Page ${pageId} activée`);
    } else {
        console.error(`❌ Page ${pageId}-page non trouvée`);
    }
    
    // Mettre à jour le titre et le bouton d'ajout
    updatePageHeader(pageId);
    
    // Actions spécifiques par page
    switch(pageId) {
        case 'dashboard':
            updateDashboardStats();
            break;
        case 'formations':
            loadFormationsTable();
            break;
        case 'events':
            loadEventsTable();
            break;
        case 'settings':
            loadSettingsForm();
            break;
    }
}

function updatePageHeader(pageId) {
    const pageTitle = document.getElementById('pageTitle');
    const addButton = document.getElementById('addNewBtn');
    
    const pageTitles = {
        'dashboard': 'Tableau de bord',
        'formations': 'Gestion des formations',
        'events': 'Gestion des événements',
        'settings': 'Paramètres du site'
    };
    
    if (pageTitle) {
        pageTitle.textContent = pageTitles[pageId] || 'Page';
    }
    
    if (addButton) {
        addButton.style.display = ['formations', 'events'].includes(pageId) ? 'flex' : 'none';
    }
}

// ========================================
// DASHBOARD
// ========================================

function updateDashboardStats() {
    // Mettre à jour les statistiques avec vérification des éléments
    const totalFormationsEl = document.getElementById('totalFormations');
    const totalEventsEl = document.getElementById('totalEvents');
    const totalParticipantsEl = document.getElementById('totalParticipants');
    
    if (totalFormationsEl) {
        totalFormationsEl.textContent = formations.filter(f => f.status === 'active').length;
    }
    
    if (totalEventsEl) {
        totalEventsEl.textContent = events.filter(e => e.status === 'active').length;
    }
    
    if (totalParticipantsEl) {
        const totalParticipants = formations.reduce((sum, f) => sum + (f.current_participants || 0), 0) +
                                events.reduce((sum, e) => sum + (e.current_participants || 0), 0);
        totalParticipantsEl.textContent = totalParticipants;
    }
    
    console.log('📊 Statistiques mises à jour:', {
        formations: formations.length,
        events: events.length,
        participants: totalParticipantsEl?.textContent
    });
    
    // Mettre à jour les activités récentes
    updateRecentActivities();
    updateUpcomingEvents();
}

function updateRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;

    // Combiner et trier les activités récentes
    const allActivities = [
        ...formations.map(f => ({...f, type: 'formation', date: f.created_at})),
        ...events.map(e => ({...e, type: 'event', date: e.created_at}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
     .slice(0, 5);

    const activitiesHTML = allActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.type}">
                <i class="fas ${activity.type === 'formation' ? 'fa-graduation-cap' : 'fa-calendar-alt'}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.type === 'formation' ? 'Formation' : 'Événement'} ajouté(e)</p>
                <small>${new Date(activity.date).toLocaleDateString('fr-FR')}</small>
            </div>
        </div>
    `).join('');

    container.innerHTML = activitiesHTML || '<p class="text-muted">Aucune activité récente</p>';
}

function updateUpcomingEvents() {
    const container = document.getElementById('upcomingEvents');
    if (!container) return;

    const today = new Date();
    const upcoming = [
        ...formations.filter(f => new Date(f.date_start) > today),
        ...events.filter(e => new Date(e.date_start) > today)
    ].sort((a, b) => {
        const dateA = new Date(a.date_start);
        const dateB = new Date(b.date_start);
        return dateA - dateB;
    }).slice(0, 5);

    const upcomingHTML = upcoming.map(item => {
        const itemDate = new Date(item.date_start);
        return `
            <div class="upcoming-item">
                <h4>${item.title}</h4>
                <p><i class="fas fa-calendar"></i> ${itemDate.toLocaleDateString('fr-FR')}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${item.location}</p>
            </div>
        `;
    }).join('');

    container.innerHTML = upcomingHTML || '<p class="text-muted">Aucun événement à venir</p>';
}

// ========================================
// FONCTION DE DÉBOGAGE
// ========================================

function debugFunctions() {
    const functionsToCheck = [
        'toggleSidebar', 'updateRecentActivities', 'updateUpcomingEvents',
        'showFormationModal', 'showEventModal', 'initializeAdmin',
        'loadFormations', 'loadEvents', 'filterFormations', 'filterEvents'
    ];
    
    console.log('🔍 Vérification des fonctions disponibles:');
    functionsToCheck.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ ${funcName} - OK`);
        } else {
            console.log(`❌ ${funcName} - MANQUANTE`);
        }
    });
}

// Ajout des fonctions au window pour le debug
window.debugFunctions = debugFunctions;

// ========================================
// GESTION DES FORMATIONS
// ========================================

function loadFormationsTable() {
    const tableBody = document.getElementById('formationsTableBody');
    if (!tableBody) return;

    // Utiliser les formations filtrées ou toutes les formations si pas de filtre
    const displayFormations = filteredFormations.length > 0 || 
        currentFilters.search || 
        currentFilters.category !== 'all' || 
        currentFilters.status !== 'all' 
        ? filteredFormations 
        : formations;

    if (displayFormations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-search fa-2x text-muted mb-2"></i>
                        <p class="text-muted">Aucune formation trouvée avec ces critères</p>
                        <button class="btn btn-outline-primary btn-sm" onclick="resetFilters()">
                            <i class="fas fa-refresh"></i> Réinitialiser les filtres
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const formationsHTML = displayFormations.map(formation => `
        <tr>
            <td>
                <div class="d-flex align-center gap-1">
                    <img src="${formation.image}" alt="${formation.title}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                    <div>
                        <strong>${formation.title}</strong>
                    </div>
                </div>
            </td>
            <td>
                <span class="status-badge ${formation.category === 'ecole-du-code' ? 'status-active' : 'status-badge'}">
                    ${formation.category === 'ecole-du-code' ? 'École du Code' : 'FabLab'}
                </span>
            </td>
            <td>
                ${new Date(formation.date_start).toLocaleDateString('fr-FR')}
                ${formation.date_end !== formation.date_start ? ' - ' + new Date(formation.date_end).toLocaleDateString('fr-FR') : ''}
            </td>
            <td>${getCityName(formation.city)}</td>
            <td>
                <div class="d-flex align-center gap-1">
                    <span>${formation.current_participants || 0}/${formation.max_participants}</span>
                    <div style="width: 60px; height: 4px; background: #e9ecef; border-radius: 2px;">
                        <div style="width: ${((formation.current_participants || 0) / formation.max_participants) * 100}%; height: 100%; background: var(--primary-color); border-radius: 2px;"></div>
                    </div>
                </div>
            </td>
            <td>
                ${formation.registration_link ? 
                    `<button class="btn btn-sm btn-success" onclick="window.open('${formation.registration_link}', '_blank')" title="Ouvrir le formulaire d'inscription">
                        <i class="fas fa-external-link-alt"></i> S'inscrire
                    </button>` : 
                    '<span class="text-muted">Non défini</span>'
                }
            </td>
            <td>
                <span class="status-badge status-${formation.status}">${formation.status === 'active' ? 'Active' : 'Inactive'}</span>
            </td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-sm btn-primary" onclick="editFormation('${formation.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteFormation('${formation.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = formationsHTML;
}

async function saveFormation(formationData) {
    try {
        console.log('🔧 Validation et transformation des données pour Supabase...');
        
        // Validation des longueurs selon les contraintes de la base
        const validationErrors = [];
        
        if (!formationData.title || formationData.title.length > 255) {
            validationErrors.push('Le titre doit faire entre 1 et 255 caractères');
        }
        
        if (!formationData.category || !['ecole-du-code', 'fablab'].includes(formationData.category)) {
            validationErrors.push('Catégorie invalide');
        }
        
        if (!formationData.city || !['rabat', 'agadir', 'benmisk', 'sidimaarouf'].includes(formationData.city)) {
            validationErrors.push('Ville invalide');
        }
        
        if (formationData.location && formationData.location.length > 255) {
            validationErrors.push('Le lieu doit faire moins de 255 caractères');
        }
        
        if (formationData.registrationLink && formationData.registrationLink.length > 500) {
            validationErrors.push('Le lien d\'inscription doit faire moins de 500 caractères');
        }
        
        if (validationErrors.length > 0) {
            throw new Error('Erreurs de validation:\n' + validationErrors.join('\n'));
        }
        
        // Convertir les données au format Supabase avec nettoyage
        const supabaseData = {
            id: currentEditId || crypto.randomUUID(),
            title: formationData.title.trim().substring(0, 255),
            category: formationData.category,
            description: (formationData.description || '').trim(),
            date_start: formationData.dateStart,
            date_end: formationData.dateEnd || formationData.dateStart,
            time_start: formationData.timeStart,
            time_end: formationData.timeEnd,
            city: formationData.city,
            location: (formationData.location || `ODC ${formationData.city}`).trim().substring(0, 255),
            image: formationData.image ? formationData.image.substring(0, 500) : null,
            max_participants: Math.max(1, parseInt(formationData.maxParticipants) || 20),
            current_participants: currentEditId ? 
                (formations.find(f => f.id === currentEditId)?.current_participants || 0) : 0,
            registration_link: formationData.registrationLink ? 
                formationData.registrationLink.trim().substring(0, 500) : null,
            status: ['active', 'inactive'].includes(formationData.status) ? 
                formationData.status : 'active',
            price: 0
        };
        
        console.log('📤 Envoi vers Supabase:', supabaseData);
        
        const savedFormation = await window.SupabaseAPI.saveFormation(supabaseData);
        
        // Mettre à jour les données locales
        const existingIndex = formations.findIndex(f => f.id === savedFormation.id);
        if (existingIndex >= 0) {
            formations[existingIndex] = savedFormation;
        } else {
            formations.push(savedFormation);
        }
        
        // Rafraîchir l'affichage
        loadFormationsTable();
        updateDashboardStats();
        closeModal();
        
        showNotification('Formation sauvegardée avec succès !', 'success');
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        
        let errorMessage = 'Erreur lors de la sauvegarde de la formation';
        
        // Messages d'erreur plus spécifiques
        if (error.message.includes('validation')) {
            errorMessage = error.message;
        } else if (error.message.includes('value too long')) {
            errorMessage = 'Une des valeurs est trop longue. Vérifiez la longueur de vos champs.';
        } else if (error.message.includes('duplicate key')) {
            errorMessage = 'Cette formation existe déjà.';
        } else if (error.message.includes('invalid input syntax')) {
            errorMessage = 'Format de date ou d\'heure invalide.';
        } else if (error.code) {
            errorMessage = `Erreur Supabase (${error.code}): ${error.message}`;
        }
        
        showNotification(errorMessage, 'error');
    }
}

// ========================================
// UTILITAIRES
// ========================================

function getCityName(city) {
    const cityNames = {
        'rabat': 'Rabat',
        'agadir': 'Agadir',
        'benmisk': 'Ben M\'sik',
        'sidimaarouf': 'Sidi Maarouf'
    };
    return cityNames[city] || city;
}

function showNotification(message, type = 'info') {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';
                
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('show');
    }
    currentEditId = null;
}

// ========================================
// GESTION DES IMAGES
// ========================================

function createImageUploader(containerId, currentImageUrl = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="image-upload-container" id="${containerId}-dropzone">
            <div class="image-upload-content">
                ${currentImageUrl ? 
                    `<img src="${currentImageUrl}" alt="Image actuelle" class="image-preview" id="${containerId}-preview">` :
                    `<div class="image-upload-icon">
                        <i class="fas fa-cloud-upload-alt"></i>
                    </div>`
                }
                <div class="image-upload-text">
                    ${currentImageUrl ? 'Cliquez pour changer l\'image' : 'Cliquez pour sélectionner une image'}
                </div>
                <div class="image-upload-hint">
                    Formats supportés: JPG, PNG, GIF, WebP (max 5MB)
                </div>
                ${currentImageUrl ? 
                    `<div class="image-actions">
                        <button type="button" class="btn btn-sm btn-outline" onclick="changeImage('${containerId}')">
                            <i class="fas fa-edit"></i> Changer
                        </button>
                        <button type="button" class="btn btn-sm btn-danger" onclick="removeImage('${containerId}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>` : ''
                }
            </div>
            <div class="upload-progress" id="${containerId}-progress">
                <div class="upload-progress-bar" id="${containerId}-progress-bar"></div>
            </div>
        </div>
        <input type="file" id="${containerId}-input" accept="image/*" style="display: none;">
    `;
    
    // Gérer les événements
    setupImageUploadEvents(containerId);
}

function setupImageUploadEvents(containerId) {
    const dropzone = document.getElementById(`${containerId}-dropzone`);
    const fileInput = document.getElementById(`${containerId}-input`);
    
    // Clic sur la zone de drop
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Changement de fichier
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0], containerId);
        }
    });
    
    // Drag & Drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0], containerId);
        }
    });
}

async function handleImageUpload(file, containerId) {
    try {
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            showNotification('Veuillez sélectionner un fichier image valide', 'error');
            return;
        }
        
        // Vérifier la taille (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('L\'image ne doit pas dépasser 5MB', 'error');
            return;
        }
        
        // Afficher la progression
        const progressContainer = document.getElementById(`${containerId}-progress`);
        const progressBar = document.getElementById(`${containerId}-progress-bar`);
        
        progressContainer.style.display = 'block';
        progressBar.style.width = '30%';
        
        // Compresser l'image
        console.log('🔄 Compression de l\'image...');
        const compressedFile = await window.SupabaseAPI.compressImage(file);
        progressBar.style.width = '60%';
        
        // Uploader vers Supabase
        console.log('📤 Upload vers Supabase...');
        const imageUrl = await window.SupabaseAPI.uploadImage(compressedFile, 'formations');
        progressBar.style.width = '100%';
        
        // Afficher l'aperçu
        setTimeout(() => {
            showImagePreview(imageUrl, containerId);
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';
        }, 500);
        
        showNotification('Image uploadée avec succès !', 'success');
        
        // Stocker l'URL pour la sauvegarde
        const hiddenInput = document.getElementById('image') || 
                           document.getElementById('eventImage');
        if (hiddenInput) {
            hiddenInput.value = imageUrl;
        }
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'upload:', error);
        showNotification('Erreur lors de l\'upload de l\'image', 'error');
        
        // Cacher la progression
        const progressContainer = document.getElementById(`${containerId}-progress`);
        progressContainer.style.display = 'none';
    }
}

function showImagePreview(imageUrl, containerId) {
    const container = document.getElementById(`${containerId}-dropzone`);
    
    container.innerHTML = `
        <img src="${imageUrl}" alt="Aperçu" class="image-preview" id="${containerId}-preview">
        <div class="image-upload-text">Image uploadée avec succès</div>
        <div class="image-actions">
            <button type="button" class="btn btn-sm btn-outline" onclick="changeImage('${containerId}')">
                <i class="fas fa-edit"></i> Changer
            </button>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeImage('${containerId}')">
                <i class="fas fa-trash"></i> Supprimer
            </button>
        </div>
    `;
}

function changeImage(containerId) {
    const currentImageUrl = document.getElementById(`${containerId}-preview`)?.src || '';
    createImageUploader(containerId, currentImageUrl);
}

async function removeImage(containerId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;
    
    try {
        const preview = document.getElementById(`${containerId}-preview`);
        if (preview && preview.src) {
            await window.SupabaseAPI.deleteImage(preview.src);
        }
        
        // Réinitialiser l'uploader
        createImageUploader(containerId);
        
        // Vider le champ caché
        const hiddenInput = document.getElementById('image') || 
                           document.getElementById('eventImage');
        if (hiddenInput) {
            hiddenInput.value = '';
        }
        
        showNotification('Image supprimée avec succès', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression de l\'image', 'error');
    }
}

// ========================================
// GESTION DES MODALS ET FORMULAIRES
// ========================================

function handleAddButton() {
    console.log('🔥 Bouton Ajouter cliqué - Page actuelle:', currentPage);
    
    // Debug supplémentaire
    const activeNavLink = document.querySelector('.nav-link.active');
    const activePage = document.querySelector('.content-page.active');
    console.log('🔍 Debug navigation:');
    console.log('  - Lien actif:', activeNavLink ? activeNavLink.getAttribute('data-page') : 'aucun');
    console.log('  - Page active:', activePage ? activePage.id : 'aucune');
    
    // Réinitialiser l'ID d'édition pour un nouvel élément
    currentEditId = null;
    
    switch(currentPage) {
        case 'formations':
            console.log('📚 Ouverture du modal de formation (nouveau)');
            showFormationModal();
            break;
        case 'events':
            console.log('🎉 Ouverture du modal d\'événement (nouveau)');
            showEventModal();
            break;
        default:
            console.warn('⚠️ Page non reconnue ou fonctionnalité non implémentée pour:', currentPage);
            showNotification('Fonctionnalité en cours de développement', 'info');
    }
}

async function handleTestEvents() {
    console.log('🔍 Test des événements demandé');
    
    try {
        showNotification('🔍 Test du chargement des événements...', 'info');
        
        // Forcer le rechargement des événements
        console.log('📅 Chargement forcé des événements...');
        await loadEventsTable();
        
        showNotification('✅ Test des événements terminé - Vérifiez la console', 'success');
        
    } catch (error) {
        console.error('❌ Erreur lors du test des événements:', error);
        showNotification('❌ Erreur lors du test des événements: ' + error.message, 'error');
    }
}

async function handleTestStorage() {
    console.log('🔍 Test de connexion Supabase Storage demandé');
    
    try {
        // Afficher un message de test en cours
        showNotification('🔍 Test de connexion au stockage cloud...', 'info');
        
        // Tester la connexion au bucket
        const bucketReady = await window.SupabaseAPI.createImageBucket();
        
        if (bucketReady) {
            // Test supplémentaire : essayer de lister les images existantes
            try {
                const { data, error } = await supabase.storage
                    .from('odc-images')
                    .list('formations', { limit: 5 });
                
                if (error) throw error;
                
                console.log('📁 Images existantes dans le bucket:', data);
                showNotification(`✅ Connexion réussie - Bucket "odc-images" opérationnel (${data.length} images trouvées)`, 'success');
                
                // Afficher quelques URLs d'exemple si des images existent
                if (data.length > 0) {
                    data.slice(0, 3).forEach((file, index) => {
                        const { data: urlData } = supabase.storage
                            .from('odc-images')
                            .getPublicUrl(`formations/${file.name}`);
                        console.log(`🖼️ Image ${index + 1}:`, urlData.publicUrl);
                    });
                }
                
            } catch (listError) {
                console.warn('⚠️ Erreur lors de la liste des images:', listError);
                showNotification('✅ Bucket disponible mais erreur lors de la liste des images', 'warning');
            }
            
        } else {
            showNotification('⚠️ Bucket "odc-images" manquant - Voir BUCKET-SETUP.md pour la création', 'warning');
            console.warn('⚠️ Test stockage: Bucket non trouvé');
        }
        
    } catch (error) {
        console.error('❌ Erreur test stockage:', error);
        const errorMsg = error.message || 'Service de stockage indisponible';
        showNotification(`❌ Test échoué: ${errorMsg}`, 'error');
    }
}

function showFormationModal(formation = null) {
    currentEditId = formation?.id || null;
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Configuration du titre du modal
    modalTitle.textContent = formation ? 'Modifier la formation' : 'Nouvelle formation';
    modalTitle.innerHTML = `
        <i class="fas fa-graduation-cap"></i>
        ${formation ? 'Modifier la formation' : 'Nouvelle formation'}
    `;
    
    const formHTML = `
        <form id="formationForm" class="formation-form">
            <div class="form-section">
                <h4><i class="fas fa-info-circle"></i> Informations générales</h4>
                
                <div class="form-group">
                    <label for="formationTitle" class="required">Titre de la formation</label>
                    <input type="text" id="formationTitle" name="title" value="${formation?.title || ''}" required
                           placeholder="Ex: Développement Web Full Stack">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="formationCategory" class="required">Catégorie</label>
                        <select id="formationCategory" name="category" required>
                            <option value="">Choisir une catégorie</option>
                            <option value="ecole-du-code" ${formation?.category === 'ecole-du-code' ? 'selected' : ''}>École du Code</option>
                            <option value="fablab" ${formation?.category === 'fablab' ? 'selected' : ''}>FabLab</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="formationStatus">Statut</label>
                        <select id="formationStatus" name="status">
                            <option value="active" ${formation?.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="inactive" ${formation?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="formationDescription">Description</label>
                    <textarea id="formationDescription" name="description" rows="4" 
                              placeholder="Décrivez le contenu et les objectifs de la formation...">${formation?.description || ''}</textarea>
                </div>
            </div>
            
            <div class="form-section">
                <h4><i class="fas fa-calendar-alt"></i> Planning</h4>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="formationDateStart" class="required">Date de début</label>
                        <input type="date" id="formationDateStart" name="dateStart" value="${formation?.date_start || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="formationDateEnd" class="required">Date de fin</label>
                        <input type="date" id="formationDateEnd" name="dateEnd" value="${formation?.date_end || ''}" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="formationTimeStart" class="required">Heure de début</label>
                        <input type="time" id="formationTimeStart" name="timeStart" value="${formation?.time_start || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="formationTimeEnd" class="required">Heure de fin</label>
                        <input type="time" id="formationTimeEnd" name="timeEnd" value="${formation?.time_end || ''}" required>
                    </div>
                </div>
            </div>
            
            <div class="form-section">
                <h4><i class="fas fa-map-marker-alt"></i> Localisation</h4>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="formationCity" class="required">Ville</label>
                        <select id="formationCity" name="city" required>
                            <option value="">Choisir une ville</option>
                            <option value="rabat" ${formation?.city === 'rabat' ? 'selected' : ''}>Rabat</option>
                            <option value="agadir" ${formation?.city === 'agadir' ? 'selected' : ''}>Agadir</option>
                            <option value="benmisk" ${formation?.city === 'benmisk' ? 'selected' : ''}>Ben M'sik</option>
                            <option value="sidimaarouf" ${formation?.city === 'sidimaarouf' ? 'selected' : ''}>Sidi Maarouf</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="formationMaxParticipants" class="required">Participants max</label>
                        <input type="number" id="formationMaxParticipants" name="maxParticipants" 
                               value="${formation?.max_participants || ''}" min="1" max="100" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="formationLocation">Lieu exact</label>
                    <input type="text" id="formationLocation" name="location" value="${formation?.location || ''}"
                           placeholder="Ex: ODC Rabat - Salle de formation A">
                </div>
            </div>
            
            <div class="form-section">
                <h4><i class="fas fa-image"></i> Image de la formation</h4>
                <div id="formationImageUploader" class="image-uploader-section"></div>
                <input type="hidden" id="formationImage" name="image" value="${formation?.image || ''}">
            </div>
            
            <div class="form-section">
                <h4><i class="fas fa-link"></i> Inscription</h4>
                
                <div class="form-group">
                    <label for="formationRegistrationLink">Lien d'inscription</label>
                    <input type="url" id="formationRegistrationLink" name="registrationLink" 
                           value="${formation?.registration_link || ''}"
                           placeholder="https://forms.google.com/...">
                    <small class="form-help">Lien vers le formulaire d'inscription Google Forms ou autre</small>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">
                    <i class="fas fa-times"></i> Annuler
                </button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${formation ? 'Mettre à jour la formation' : 'Créer la formation'}
                </button>
            </div>
        </form>
    `;
    
    modalBody.innerHTML = formHTML;
    modal.classList.add('show');
    
    // Initialiser l'uploader d'images spécifique aux formations
    setTimeout(() => {
        createFormationImageUploader('formationImageUploader', formation?.image || '');
    }, 100);
    
    // Gérer la soumission du formulaire
    const form = document.getElementById('formationForm');
    form.addEventListener('submit', handleFormationSubmit);
    
    console.log('✅ Modal formation affiché', formation ? 'mode édition' : 'mode création');
}

async function handleFormationSubmit(e) {
    e.preventDefault();
    
    try {
        const formData = new FormData(e.target);
        const formationData = Object.fromEntries(formData);
        
        console.log('📝 Données du formulaire:', formationData);
        
        // Validation des champs obligatoires et formats
        if (!formationData.title?.trim()) {
            showNotification('Le titre est obligatoire', 'error');
            return;
        }
        
        if (!formationData.category) {
            showNotification('La catégorie est obligatoire', 'error');
            return;
        }
        
        if (!formationData.dateStart) {
            showNotification('La date de début est obligatoire', 'error');
            return;
        }
        
        if (!formationData.timeStart || !formationData.timeEnd) {
            showNotification('Les heures de début et fin sont obligatoires', 'error');
            return;
        }
        
        if (!formationData.city) {
            showNotification('La ville est obligatoire', 'error');
            return;
        }
        
        // Validation des dates
        const startDate = new Date(formationData.dateStart);
        const endDate = new Date(formationData.dateEnd || formationData.dateStart);
        
        if (isNaN(startDate.getTime())) {
            showNotification('Format de date de début invalide', 'error');
            return;
        }
        
        if (endDate < startDate) {
            showNotification('La date de fin ne peut pas être antérieure à la date de début', 'error');
            return;
        }
        
        // Validation du nombre de participants
        const maxParticipants = parseInt(formationData.maxParticipants);
        if (isNaN(maxParticipants) || maxParticipants < 1) {
            showNotification('Le nombre maximum de participants doit être supérieur à 0', 'error');
            return;
        }
        
        console.log('💾 Sauvegarde de la formation...');
        
        await saveFormation(formationData);
        
    } catch (error) {
        console.error('❌ Erreur lors de la soumission:', error);
        showNotification(`Erreur lors de la sauvegarde: ${error.message}`, 'error');
    }
}

// ========================================
// GESTION DES IMAGES SPÉCIALISÉE
// ========================================

function createFormationImageUploader(containerId, currentImage = '') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container pour uploader image formation non trouvé:', containerId);
        return;
    }
    
    const uploaderHTML = `
        <div class="image-uploader formation-uploader">
            <div class="upload-area" id="formationUploadArea" style="${currentImage ? 'display: none' : 'display: flex'}">
                <div class="upload-content">
                    <i class="fas fa-graduation-cap"></i>
                    <p>Image pour la formation</p>
                    <small>Glissez une image ici ou cliquez pour parcourir</small>
                    <small>Formats: JPG, PNG, GIF, WEBP (max 5MB)</small>
                </div>
                <input type="file" id="formationImageInput" accept="image/*" style="display: none;">
            </div>
            <div class="image-preview" id="formationImagePreview" style="display: ${currentImage ? 'block' : 'none'}">
                <img src="${currentImage}" alt="Aperçu formation" id="formationPreviewImg">
                <div class="image-overlay">
                    <button type="button" class="btn-icon" onclick="changeFormationImage()" title="Changer l'image">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn-icon btn-danger" onclick="removeFormationImage()" title="Supprimer l'image">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = uploaderHTML;
    
    // Événements pour l'upload
    const uploadArea = document.getElementById('formationUploadArea');
    const imageInput = document.getElementById('formationImageInput');
    const imageField = document.getElementById('formationImage');
    
    uploadArea.addEventListener('click', () => imageInput.click());
    
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleFormationImageUpload(file);
        }
    });
    
    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleFormationImageUpload(files[0]);
        }
    });
    
    // Mettre à jour le champ caché si une image est déjà sélectionnée
    if (currentImage && imageField) {
        imageField.value = currentImage;
    }
}

async function handleFormationImageUpload(file) {
    try {
        // Validation du fichier
        if (!file.type.startsWith('image/')) {
            showNotification('Veuillez sélectionner un fichier image valide', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Le fichier doit faire moins de 5MB', 'error');
            return;
        }
        
        console.log('📸 Upload d\'image formation vers Supabase:', file.name);
        showNotification('Upload de l\'image de formation...', 'info');
        
        // Afficher un aperçu immédiat pendant l'upload
        const reader = new FileReader();
        reader.onload = (e) => {
            updateFormationImagePreview(e.target.result, true); // true = preview temporaire
        };
        reader.readAsDataURL(file);
        
        // Essayer l'upload vers Supabase Storage
        try {
            const imageUrl = await window.SupabaseAPI.uploadImage(file, 'formations');
            
            if (imageUrl) {
                // Mettre à jour avec l'URL définitive de Supabase
                updateFormationImagePreview(imageUrl, false); // false = URL définitive
                showNotification('Image de formation uploadée avec succès !', 'success');
                return;
            }
        } catch (uploadError) {
            console.warn('⚠️ Échec upload Supabase pour formation:', uploadError.message);
            
            // Fallback : utiliser l'image base64 temporaire
            const reader = new FileReader();
            reader.onload = (e) => {
                updateFormationImagePreview(e.target.result, false);
                showNotification('Image chargée en mode local pour la formation', 'info');
            };
            reader.readAsDataURL(file);
            return;
        }
        
    } catch (error) {
        console.error('❌ Erreur upload image formation:', error);
        showNotification(`Erreur lors de l'upload de l'image: ${error.message}`, 'error');
    }
}

function updateFormationImagePreview(imageSrc, isTemporary = false) {
    const preview = document.getElementById('formationImagePreview');
    const previewImg = document.getElementById('formationPreviewImg');
    const uploadArea = document.getElementById('formationUploadArea');
    const imageField = document.getElementById('formationImage');
    
    if (preview && previewImg && uploadArea) {
        previewImg.src = imageSrc;
        preview.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Ajouter un indicateur visuel si c'est temporaire
        if (isTemporary) {
            previewImg.style.opacity = '0.7';
            previewImg.style.border = '2px dashed #FF7900';
        } else {
            previewImg.style.opacity = '1';
            previewImg.style.border = '2px solid var(--border-color)';
            
            // Seulement mettre à jour le champ caché avec l'URL définitive
            if (imageField) {
                imageField.value = imageSrc;
            }
        }
    }
}

function changeFormationImage() {
    const uploadArea = document.getElementById('formationUploadArea');
    const preview = document.getElementById('formationImagePreview');
    const imageInput = document.getElementById('formationImageInput');
    
    if (uploadArea && preview) {
        uploadArea.style.display = 'flex';
        preview.style.display = 'none';
        imageInput.click();
    }
}

function removeFormationImage() {
    const preview = document.getElementById('formationImagePreview');
    const uploadArea = document.getElementById('formationUploadArea');
    const imageField = document.getElementById('formationImage');
    
    if (preview && uploadArea) {
        preview.style.display = 'none';
        uploadArea.style.display = 'flex';
    }
    
    if (imageField) {
        imageField.value = '';
    }
    
    showNotification('Image de formation supprimée', 'info');
}

function createEventImageUploader(containerId, currentImage = '') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error('Container pour uploader image événement non trouvé:', containerId);
        return;
    }
    
    const uploaderHTML = `
        <div class="image-uploader event-uploader">
            <div class="upload-area" id="eventUploadArea" style="${currentImage ? 'display: none' : 'display: flex'}">
                <div class="upload-content">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Image pour l'événement</p>
                    <small>Glissez une image ici ou cliquez pour parcourir</small>
                    <small>Formats: JPG, PNG, GIF, WEBP (max 5MB)</small>
                </div>
                <input type="file" id="eventImageInput" accept="image/*" style="display: none;">
            </div>
            <div class="image-preview" id="eventImagePreview" style="display: ${currentImage ? 'block' : 'none'}">
                <img src="${currentImage}" alt="Aperçu événement" id="eventPreviewImg">
                <div class="image-overlay">
                    <button type="button" class="btn-icon" onclick="changeEventImage()" title="Changer l'image">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button type="button" class="btn-icon btn-danger" onclick="removeEventImage()" title="Supprimer l'image">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = uploaderHTML;
    
    // Événements pour l'upload
    const uploadArea = document.getElementById('eventUploadArea');
    const imageInput = document.getElementById('eventImageInput');
    const imageField = document.getElementById('eventImage');
    
    uploadArea.addEventListener('click', () => imageInput.click());
    
    imageInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleEventImageUpload(file);
        }
    });
    
    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            await handleEventImageUpload(files[0]);
        }
    });
    
    // Mettre à jour le champ caché si une image est déjà sélectionnée
    if (currentImage && imageField) {
        imageField.value = currentImage;
    }
}

async function handleEventImageUpload(file) {
    try {
        // Validation du fichier
        if (!file.type.startsWith('image/')) {
            showNotification('Veuillez sélectionner un fichier image valide', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Le fichier doit faire moins de 5MB', 'error');
            return;
        }
        
        console.log('📸 Upload d\'image événement vers Supabase:', file.name);
        showNotification('Upload de l\'image d\'événement...', 'info');
        
        // Afficher un aperçu immédiat pendant l'upload
        const reader = new FileReader();
        reader.onload = (e) => {
            updateEventImagePreview(e.target.result, true); // true = preview temporaire
        };
        reader.readAsDataURL(file);
        
        // Essayer l'upload vers Supabase Storage
        try {
            const imageUrl = await window.SupabaseAPI.uploadImage(file, 'events');
            
            if (imageUrl) {
                // Mettre à jour avec l'URL définitive de Supabase
                updateEventImagePreview(imageUrl, false); // false = URL définitive
                showNotification('Image d\'événement uploadée avec succès !', 'success');
                return;
            }
        } catch (uploadError) {
            console.warn('⚠️ Échec upload Supabase pour événement:', uploadError.message);
            
            // Fallback : utiliser l'image base64 temporaire
            const reader = new FileReader();
            reader.onload = (e) => {
                updateEventImagePreview(e.target.result, false);
                showNotification('Image chargée en mode local pour l\'événement', 'info');
            };
            reader.readAsDataURL(file);
            return;
        }
        
    } catch (error) {
        console.error('❌ Erreur upload image événement:', error);
        showNotification(`Erreur lors de l'upload de l'image: ${error.message}`, 'error');
    }
}

function updateEventImagePreview(imageSrc, isTemporary = false) {
    const preview = document.getElementById('eventImagePreview');
    const previewImg = document.getElementById('eventPreviewImg');
    const uploadArea = document.getElementById('eventUploadArea');
    const imageField = document.getElementById('eventImage');
    
    if (preview && previewImg && uploadArea) {
        previewImg.src = imageSrc;
        preview.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // Ajouter un indicateur visuel si c'est temporaire
        if (isTemporary) {
            previewImg.style.opacity = '0.7';
            previewImg.style.border = '2px dashed #FF7900';
        } else {
            previewImg.style.opacity = '1';
            previewImg.style.border = '2px solid var(--border-color)';
            
            // Seulement mettre à jour le champ caché avec l'URL définitive
            if (imageField) {
                imageField.value = imageSrc;
            }
        }
    }
}

function changeEventImage() {
    const uploadArea = document.getElementById('eventUploadArea');
    const preview = document.getElementById('eventImagePreview');
    const imageInput = document.getElementById('eventImageInput');
    
    if (uploadArea && preview) {
        uploadArea.style.display = 'flex';
        preview.style.display = 'none';
        imageInput.click();
    }
}

function removeEventImage() {
    const preview = document.getElementById('eventImagePreview');
    const uploadArea = document.getElementById('eventUploadArea');
    const imageField = document.getElementById('eventImage');
    
    if (preview && uploadArea) {
        preview.style.display = 'none';
        uploadArea.style.display = 'flex';
    }
    
    if (imageField) {
        imageField.value = '';
    }
    
    showNotification('Image d\'événement supprimée', 'info');
}

// ========================================
// MODAL ET ÉVÉNEMENTS
// ========================================

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function showEventModal(event = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Configuration du titre
    modalTitle.textContent = event ? 'Modifier l\'événement' : 'Ajouter un événement';
    currentEditId = event ? event.id : null;
    
    // Génération du formulaire
    modalBody.innerHTML = `
        <form id="eventForm">
            <div class="form-row">
                <div class="form-group">
                    <label for="eventTitle" class="required">Titre de l'événement</label>
                    <input type="text" id="eventTitle" name="title" required 
                           placeholder="Ex: Workshop IA & Machine Learning"
                           value="${event ? event.title || '' : ''}">
                </div>
                <div class="form-group">
                    <label for="eventCategory">Catégorie</label>
                    <select id="eventCategory" name="category">
                        <option value="workshop" ${event && event.category === 'workshop' ? 'selected' : ''}>Workshop</option>
                        <option value="conference" ${event && event.category === 'conference' ? 'selected' : ''}>Conférence</option>
                        <option value="formation" ${event && event.category === 'formation' ? 'selected' : ''}>Formation spéciale</option>
                        <option value="networking" ${event && event.category === 'networking' ? 'selected' : ''}>Networking</option>
                        <option value="hackathon" ${event && event.category === 'hackathon' ? 'selected' : ''}>Hackathon</option>
                        <option value="autre" ${event && event.category === 'autre' ? 'selected' : ''}>Autre</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="eventDescription" class="required">Description</label>
                <textarea id="eventDescription" name="description" rows="4" required 
                          placeholder="Décrivez l'événement, ses objectifs et ce que les participants vont apprendre...">${event ? event.description || '' : ''}</textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="eventDate" class="required">Date</label>
                    <input type="date" id="eventDate" name="date_start" required 
                           value="${event ? event.date_start || '' : ''}">
                </div>
                <div class="form-group">
                    <label for="eventTimeStart" class="required">Heure début</label>
                    <input type="time" id="eventTimeStart" name="time_start" required 
                           value="${event ? event.time_start || '' : ''}">
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="eventTimeEnd" class="required">Heure fin</label>
                    <input type="time" id="eventTimeEnd" name="time_end" required 
                           value="${event ? event.time_end || '' : ''}">
                </div>
                <div class="form-group">
                    <label for="eventCapacity">Capacité max</label>
                    <input type="number" id="eventCapacity" name="max_participants" min="1" max="200" 
                           placeholder="Ex: 30" value="${event ? event.max_participants || '' : ''}">
                </div>
            </div>
            

            
            <div class="form-row">
                <div class="form-group">
                    <label for="eventLocation" class="required">Lieu</label>
                    <input type="text" id="eventLocation" name="location" required 
                           placeholder="Ex: ODC Rabat - Salle de conférence"
                           value="${event ? event.location || '' : ''}">
                </div>
                <div class="form-group">
                    <label for="eventCity" class="required">Ville</label>
                    <select id="eventCity" name="city" required>
                        <option value="">Choisir une ville</option>
                        <option value="rabat" ${event && event.city === 'rabat' ? 'selected' : ''}>Rabat</option>
                        <option value="agadir" ${event && event.city === 'agadir' ? 'selected' : ''}>Agadir</option>
                        <option value="benmisk" ${event && event.city === 'benmisk' ? 'selected' : ''}>Ben M'sik</option>
                        <option value="sidimaarouf" ${event && event.city === 'sidimaarouf' ? 'selected' : ''}>Sidi Maarouf</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label for="eventSpeaker">Intervenant(s)</label>
                <input type="text" id="eventSpeaker" name="speaker" 
                       placeholder="Ex: Dr. Ahmed Benali, Expert en IA"
                       value="${event ? event.speaker || '' : ''}">
            </div>
            
            <div class="form-section">
                <h4><i class="fas fa-image"></i> Image de l'événement</h4>
                <div id="eventImageUploader" class="image-uploader-section"></div>
                <input type="hidden" id="eventImage" name="image" value="${event?.image || ''}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="eventPrice">Prix (MAD)</label>
                    <input type="number" id="eventPrice" name="price" min="0" step="10" 
                           placeholder="0 pour gratuit" value="${event ? event.price || '' : ''}">
                </div>
                <div class="form-group">
                    <label for="eventStatus">Statut</label>
                    <select id="eventStatus" name="status">
                        <option value="ouvert" ${event && event.status === 'ouvert' ? 'selected' : ''}>Ouvert aux inscriptions</option>
                        <option value="complet" ${event && event.status === 'complet' ? 'selected' : ''}>Complet</option>
                        <option value="annule" ${event && event.status === 'annule' ? 'selected' : ''}>Annulé</option>
                        <option value="reporte" ${event && event.status === 'reporte' ? 'selected' : ''}>Reporté</option>
                    </select>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancelEvent">Annuler</button>
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i>
                    ${event ? 'Mettre à jour' : 'Créer l\'événement'}
                </button>
            </div>
        </form>
    `;
    
    // Configuration des gestionnaires d'événements
    setupEventFormHandlers();
    
    // Configuration de l'upload d'images pour événements
    setTimeout(() => {
        createEventImageUploader('eventImageUploader', event?.image || '');
    }, 100);
    
    // Affichage du modal
    modal.classList.add('show');
    
    console.log('✅ Modal d\'événement affiché', event ? 'mode édition' : 'mode création');
}

function editFormation(id) {
    const formation = formations.find(f => f.id === id);
    if (formation) {
        showFormationModal(formation);
    }
}

async function deleteFormation(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) return;
    
    try {
        await window.SupabaseAPI.deleteFormation(id);
        formations = formations.filter(f => f.id !== id);
        applyFilters(); // Utiliser applyFilters au lieu de loadFormationsTable
        updateDashboardStats();
        showNotification('Formation supprimée avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

// ========================================
// FONCTIONNALITÉS DE FILTRAGE ET RECHERCHE
// ========================================

function setupFilterHandlers() {
    // Gestionnaire de recherche
    const searchInput = document.getElementById('searchFormations');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchChange);
        console.log('✅ Gestionnaire de recherche configuré');
    } else {
        console.warn('❌ Champ de recherche non trouvé');
    }

    // Gestionnaire de filtrage par catégorie
    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) {
        categorySelect.addEventListener('change', handleCategoryChange);
        console.log('✅ Gestionnaire de catégories configuré');
    } else {
        console.warn('❌ Sélecteur de catégorie non trouvé');
    }

    // Gestionnaire de filtrage par ville (statut)
    const cityFilter = document.getElementById('cityFilter');
    if (cityFilter) {
        cityFilter.addEventListener('change', handleCityChange);
        console.log('✅ Gestionnaire de villes configuré');
    } else {
        console.warn('❌ Sélecteur de ville non trouvé');
    }
}

function handleSearchChange(event) {
    currentFilters.search = event.target.value.toLowerCase();
    console.log('🔍 Recherche:', currentFilters.search);
    applyFilters();
}

function handleCategoryChange(event) {
    currentFilters.category = event.target.value;
    console.log('🏷️ Catégorie:', currentFilters.category);
    applyFilters();
}

function handleCityChange(event) {
    currentFilters.city = event.target.value;
    console.log('🏙️ Ville:', currentFilters.city);
    applyFilters();
}

function applyFilters() {
    console.log('🔧 Application des filtres:', currentFilters);
    
    filteredFormations = formations.filter(formation => {
        // Filtre de recherche
        const matchesSearch = !currentFilters.search || 
            formation.title.toLowerCase().includes(currentFilters.search) ||
            formation.description.toLowerCase().includes(currentFilters.search) ||
            getCityName(formation.city).toLowerCase().includes(currentFilters.search);

        // Filtre de catégorie
        const matchesCategory = !currentFilters.category || 
            formation.category === currentFilters.category;

        // Filtre de ville
        const matchesCity = !currentFilters.city || 
            formation.city === currentFilters.city;

        return matchesSearch && matchesCategory && matchesCity;
    });

    console.log(`📋 ${filteredFormations.length}/${formations.length} formations après filtrage`);
    updateResultsCounter();
    loadFormationsTable();
}

function resetFilters() {
    currentFilters = {
        search: '',
        category: '',
        city: ''
    };
    
    // Réinitialiser les champs de l'interface
    const searchInput = document.getElementById('searchFormations');
    if (searchInput) searchInput.value = '';
    
    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) categorySelect.value = '';
    
    const cityFilter = document.getElementById('cityFilter');
    if (cityFilter) cityFilter.value = '';
    
    applyFilters();
}

function updateResultsCounter() {
    const isFiltered = currentFilters.search || currentFilters.category || currentFilters.city;
    const total = formations.length;
    const displayed = isFiltered ? filteredFormations.length : total;
    
    // Chercher ou créer un élément pour afficher le compteur
    let counter = document.getElementById('resultsCounter');
    if (!counter) {
        // Créer le compteur s'il n'existe pas
        const pageControls = document.querySelector('.page-controls');
        if (pageControls) {
            counter = document.createElement('div');
            counter.id = 'resultsCounter';
            counter.className = 'results-counter';
            pageControls.appendChild(counter);
        }
    }
    
    if (counter) {
        if (isFiltered) {
            counter.innerHTML = `<i class="fas fa-filter"></i> ${displayed} sur ${total} formations`;
            counter.className = 'results-counter filtered';
        } else {
            counter.innerHTML = `${total} formations au total`;
            counter.className = 'results-counter';
        }
    }
}

async function loadEventsTable() {
    try {
        console.log('🔄 Chargement de la table des événements...');
        
        // Vérification API Supabase
        if (!window.SupabaseAPI) {
            throw new Error('API Supabase non disponible');
        }
        
        if (!window.SupabaseAPI.getEvents) {
            throw new Error('Fonction getEvents non disponible');
        }
        
        // Charger les événements depuis Supabase
        events = await window.SupabaseAPI.getEvents();
        console.log(`📅 ${events.length} événements chargés depuis Supabase`);
        
        // Debug des données
        if (events.length > 0) {
            console.log('🔍 Premier événement:', events[0]);
        }
        
        // Affichage dans le tableau
        renderEventsTable();
        
        // Mise à jour des statistiques
        updateDashboardStats();
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des événements:', error);
        showNotification('Erreur lors du chargement des événements: ' + error.message, 'error');
        
        // Affichage d'un tableau vide en cas d'erreur
        const tbody = document.getElementById('eventsTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                Erreur de chargement des données: ${error.message}
            </td></tr>`;
        }
    }
}

function renderEventsTable() {
    console.log('🎨 Rendu de la table des événements...');
    
    const tbody = document.getElementById('eventsTableBody');
    if (!tbody) {
        console.error('❌ Élément eventsTableBody introuvable');
        return;
    }
    
    console.log(`📊 Rendu de ${events.length} événements`);
    
    if (events.length === 0) {
        console.log('📝 Aucun événement à afficher');
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #666;">Aucun événement trouvé</td></tr>';
        return;
    }
    
    tbody.innerHTML = events.map(event => {
        const eventDate = new Date(event.date_start);
        const today = new Date();
        const isUpcoming = eventDate >= today;
        
        // Formatage de la date
        const formattedDate = eventDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        // Statut avec couleur
        let statusClass = '';
        let statusIcon = '';
        switch(event.status) {
            case 'active':
                statusClass = 'success';
                statusIcon = 'fa-calendar-check';
                break;
            case 'inactive':
                statusClass = 'error';
                statusIcon = 'fa-calendar-times';
                break;
            default:
                statusClass = 'secondary';
                statusIcon = 'fa-calendar';
        }
        
        return `
            <tr ${!isUpcoming ? 'style="opacity: 0.6;"' : ''}>
                <td>
                    <div class="item-info">
                        ${event.image ? `<img src="${event.image}" alt="${event.title}" class="item-image">` : '<div class="item-image-placeholder"><i class="fas fa-calendar"></i></div>'}
                        <div>
                            <div class="item-title">${event.title}</div>
                            <div class="item-subtitle">${event.category || 'Non catégorisé'}</div>
                        </div>
                    </div>
                </td>
                <td>${formattedDate}</td>
                <td>${event.time_start || 'Non défini'} - ${event.time_end || 'Non défini'}</td>
                <td>
                    <div class="location-info">
                        <div>${event.location || 'Non défini'}</div>
                        <small>${getCityLabel(event.city)}</small>
                    </div>
                </td>
                <td>
                    <div class="capacity-info">
                        <span class="capacity">${event.current_participants || 0}/${event.max_participants || '∞'}</span>
                    </div>
                </td>
                <td>
                    <span class="status status-${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        ${getStatusLabel(event.status)}
                    </span>
                </td>
                <td>
                    <div class="actions">
                        <button class="btn-icon" onclick="editEvent('${event.id}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteEvent('${event.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    console.log('✅ Table des événements rendue');
}

function getStatusLabel(status) {
    const labels = {
        'active': 'Actif',
        'inactive': 'Inactif'
    };
    return labels[status] || 'Inconnu';
}

function getCityLabel(city) {
    const cityLabels = {
        'rabat': 'Rabat',
        'agadir': 'Agadir',
        'benmisk': 'Ben M\'sik',
        'sidimaarouf': 'Sidi Maarouf'
    };
    return cityLabels[city] || city;
}

// ========================================
// FONCTIONS POUR LES ÉVÉNEMENTS
// ========================================

function setupEventFormHandlers() {
    // Gestionnaire de soumission du formulaire
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', handleEventSubmit);
    }
    
    // Gestionnaire d'annulation
    const cancelBtn = document.getElementById('cancelEvent');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Gestionnaire de fermeture du modal
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
}

async function handleEventSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const eventData = Object.fromEntries(formData.entries());
    
    try {
        // Validation basique
        if (!eventData.title || !eventData.description || !eventData.date_start || !eventData.time_start || !eventData.time_end || !eventData.location || !eventData.city) {
            showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Gestion de l'image
        const imageInput = document.getElementById('eventImageInput');
        if (imageInput && imageInput.files.length > 0) {
            console.log('📸 Upload de l\'image en cours...');
            showNotification('Upload de l\'image...', 'info');
            
            try {
                const imageUrl = await window.SupabaseAPI.uploadImage(imageInput.files[0], 'events');
                eventData.image = imageUrl;
                console.log('✅ Image uploadée:', imageUrl);
            } catch (imageError) {
                console.warn('⚠️ Erreur upload image:', imageError);
                // Continuer sans image si l'upload échoue
                eventData.image = null;
            }
        } else if (currentEditId) {
            // En mode édition, garder l'image existante si pas de nouvelle image
            const existingEvent = events.find(e => e.id === currentEditId);
            eventData.image = existingEvent ? existingEvent.image : null;
        }
        
        // Préparation des données pour Supabase
        const eventPayload = {
            title: eventData.title,
            description: eventData.description,
            date_start: eventData.date_start,
            time_start: eventData.time_start,
            time_end: eventData.time_end,
            location: eventData.location,
            city: eventData.city,
            max_participants: eventData.max_participants ? parseInt(eventData.max_participants) : 0,
            current_participants: 0, // Toujours 0 lors de la création
            registration_link: null, // À implémenter plus tard
            status: 'active', // Toujours actif pour les nouveaux événements
            image: eventData.image || null
        };
        
        console.log('💾 Sauvegarde de l\'événement:', eventPayload);
        
        if (currentEditId) {
            // Mode édition
            eventPayload.id = currentEditId;
            await window.SupabaseAPI.updateEvent(currentEditId, eventPayload);
            showNotification('Événement mis à jour avec succès !', 'success');
        } else {
            // Mode création
            await window.SupabaseAPI.saveEvent(eventPayload);
            showNotification('Événement créé avec succès !', 'success');
        }
        
        // Fermeture du modal et rechargement des données
        closeModal();
        await loadEventsTable();
        
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de l\'événement:', error);
        showNotification('Erreur lors de la sauvegarde: ' + error.message, 'error');
    }
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (event) {
        showEventModal(event);
    }
}

async function deleteEvent(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;
    
    try {
        await window.SupabaseAPI.deleteEvent(id);
        events = events.filter(e => e.id !== id);
        renderEventsTable();
        updateDashboardStats();
        showNotification('Événement supprimé avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

function loadSettingsForm() {
    console.log('Formulaire des paramètres - en cours de développement');
}

// ========================================
// EXPORT DES FONCTIONS POUR LE DEBUG
// ========================================

// Exposer les fonctions principales pour les tests et diagnostics
window.AdminFunctions = {
    showEventModal,
    loadEventsTable,
    renderEventsTable,
    handleAddButton,
    showPage,
    currentPage: () => currentPage,
    events: () => events,
    formations: () => formations
};
