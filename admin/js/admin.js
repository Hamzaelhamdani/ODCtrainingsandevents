
let formations = [];
let events = [];
let settings = {};
let currentPage = 'dashboard';
let currentEditId = null;


document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    loadAllData();
    setupEventListeners();
    showPage('dashboard');
});

async function initializeAdmin() {
    console.log('🚀 Initialisation du back-office ODC');
}


async function loadAllData() {
    try {
        loadFormations();
        loadEvents();
        loadSettings();
        
        updateDashboardStats();
        updateRecentActivities();
        updateUpcomingEvents();
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement des données', 'error');
    }
}

function loadFormations() {
    formations = [
        {
            "id": "1",
            "title": "Développement Web Full Stack",
            "category": "ecole-du-code",
            "description": "Apprenez les bases du développement web moderne avec HTML5, CSS3, JavaScript et React. Formation intensive sur 3 jours.",
            "dateStart": "2025-10-15",
            "dateEnd": "2025-10-17",
            "timeStart": "09:00",
            "timeEnd": "17:00",
            "city": "rabat",
            "location": "ODC Rabat - École du Code",
            "image": "https://via.placeholder.com/400x180/FF7900/FFFFFF?text=Web+Development",
            "maxParticipants": 25,
            "currentParticipants": 18,
            "registrationLink": "https://forms.google.com/d/e/1FAIpQLSe0xyz123/viewform",
            "price": 0,
            "status": "active",
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "2",
            "title": "Python pour Data Science",
            "category": "ecole-du-code",
            "description": "Découvrez Python, pandas, numpy et matplotlib pour l'analyse de données. Idéal pour débuter en data science.",
            "dateStart": "2025-10-20",
            "dateEnd": "2025-10-22",
            "timeStart": "14:00",
            "timeEnd": "18:00",
            "city": "agadir",
            "location": "ODC Agadir - École du Code",
            "image": "https://via.placeholder.com/400x180/FF7900/FFFFFF?text=Python+Data+Science",
            "maxParticipants": 20,
            "currentParticipants": 12,
            "registrationLink": "https://forms.google.com/d/e/1FAIpQLSe0abc456/viewform",
            "price": 0,
            "status": "active",
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "3",
            "title": "Mobile App Development",
            "category": "ecole-du-code",
            "description": "Créez votre première application mobile avec Flutter. Formation pratique avec projet final.",
            "dateStart": "2025-10-25",
            "dateEnd": "2025-10-27",
            "timeStart": "09:00",
            "timeEnd": "16:00",
            "city": "benmisk",
            "location": "ODC Club Ben M'sik - École du Code",
            "image": "https://via.placeholder.com/400x180/FF7900/FFFFFF?text=Mobile+App+Flutter",
            "maxParticipants": 15,
            "currentParticipants": 8,
            "price": 0,
            "status": "active",
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "4",
            "title": "Intelligence Artificielle",
            "category": "ecole-du-code",
            "description": "Introduction à l'IA et au Machine Learning avec des outils pratiques et des cas d'usage concrets.",
            "dateStart": "2025-10-28",
            "dateEnd": "2025-10-30",
            "timeStart": "10:00",
            "timeEnd": "17:00",
            "city": "sidimaarouf",
            "location": "ODC Club Sidi Maarouf - École du Code",
            "image": "https://via.placeholder.com/400x180/FF7900/FFFFFF?text=Intelligence+Artificielle",
            "maxParticipants": 18,
            "currentParticipants": 15,
            "price": 0,
            "status": "active",
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "5",
            "title": "Impression 3D & Prototypage",
            "category": "fablab",
            "description": "Maîtrisez l'impression 3D, de la conception à la réalisation. Créez vos premiers prototypes.",
            "dateStart": "2025-10-18",
            "dateEnd": "2025-10-19",
            "timeStart": "09:00",
            "timeEnd": "17:00",
            "city": "rabat",
            "location": "ODC FabLab Rabat",
            "image": "https://via.placeholder.com/400x180/28a745/FFFFFF?text=Impression+3D",
            "maxParticipants": 12,
            "currentParticipants": 9,
            "price": 0,
            "status": "active",
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "6",
            "title": "Arduino & IoT",
            "category": "fablab",
            "description": "Initiez-vous à l'Internet des Objets avec Arduino. Créez des projets connectés innovants.",
            "dateStart": "2025-10-23",
            "dateEnd": "2025-10-24",
            "timeStart": "14:00",
            "timeEnd": "18:00",
            "city": "agadir",
            "location": "ODC FabLab Agadir",
            "image": "https://via.placeholder.com/400x180/28a745/FFFFFF?text=Arduino+IoT",
            "maxParticipants": 10,
            "currentParticipants": 7,
            "price": 0,
            "status": "active",
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "7",
            "title": "Design & Découpe Laser",
            "category": "fablab",
            "description": "Apprenez le design vectoriel et la découpe laser pour créer des objets personnalisés.",
            "dateStart": "2025-10-26",
            "dateEnd": "2025-10-27",
            "timeStart": "10:00",
            "timeEnd": "16:00",
            "city": "benmisk",
            "location": "ODC FabLab Ben M'sik",
            "image": "https://via.placeholder.com/400x180/28a745/FFFFFF?text=Decoupe+Laser",
            "maxParticipants": 8,
            "currentParticipants": 5,
            "price": 0,
            "status": "active",
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        }
    ];
    console.log('Formations chargées:', formations.length);
    return formations;
}

function loadEvents() {
    events = [
        {
            "id": "1",
            "title": "Startup Pitch Night",
            "category": "orange-fab",
            "description": "Soirée de présentation de startups innovantes. Networking et opportunités d'investissement.",
            "date": "2025-10-21",
            "timeStart": "19:00",
            "timeEnd": "22:00",
            "city": "rabat",
            "location": "ODC Orange Fab Rabat",
            "image": "https://via.placeholder.com/400x180/FF7900/FFFFFF?text=Startup+Pitch",
            "maxParticipants": 80,
            "currentParticipants": 45,
            "organizer": "Orange Fab Team",
            "price": 0,
            "status": "active",
            "tags": ["startup", "networking", "pitch"],
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "2",
            "title": "Tech Talk: IA & Futur",
            "category": "orange-fab",
            "description": "Conférence sur l'Intelligence Artificielle et son impact sur l'avenir des technologies.",
            "date": "2025-10-29",
            "timeStart": "16:00",
            "timeEnd": "18:30",
            "city": "agadir",
            "location": "ODC Orange Fab Agadir",
            "image": "https://via.placeholder.com/400x180/FF7900/FFFFFF?text=Tech+Talk",
            "maxParticipants": 60,
            "currentParticipants": 38,
            "organizer": "Dr. Ahmed Benali",
            "price": 0,
            "status": "active",
            "tags": ["tech-talk", "AI", "conference"],
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        },
        {
            "id": "3",
            "title": "EcoTech Innovation Hub",
            "category": "orange-fab",
            "description": "Découvrez les dernières innovations en technologies vertes et développement durable.",
            "date": "2025-10-13",
            "timeStart": "14:30",
            "timeEnd": "17:00",
            "city": "rabat",
            "location": "ODC Orange Fab Rabat",
            "image": "https://via.placeholder.com/400x180/28a745/FFFFFF?text=EcoTech+Hub",
            "maxParticipants": 50,
            "currentParticipants": 32,
            "organizer": "Green Tech Initiative",
            "price": 0,
            "status": "active",
            "tags": ["ecotech", "sustainability", "innovation"],
            "createdAt": "2025-10-01T10:00:00Z",
            "updatedAt": "2025-10-01T10:00:00Z"
        }
    ];
    console.log('Événements chargés:', events.length);
    return events;
}

function loadSettings() {
    settings = {
        "siteSettings": {
            "title": "Orange Digital Center - Formations & Événements du Mois",
            "description": "Développez vos compétences digitales avec l'Orange Digital Center",
            "heroTitle": "Développez vos compétences digitales",
            "heroSubtitle": "Découvrez nos formations et événements dans tous nos centres Orange Digital Center",
            "heroCtaText": "Découvrir nos formations",
            "contactEmail": "contact@orangedigitalcenter.ma",
            "socialLinks": {
                "facebook": "#",
                "twitter": "#",
                "linkedin": "#",
                "instagram": "#"
            }
        },
        "odcCenters": [
            {
                "id": "rabat",
                "name": "ODC Rabat",
                "displayName": "ODC Rabat",
                "address": "Rabat, Morocco",
                "facilities": ["École du Code", "FabLab", "Orange Fab", "Coworking"]
            },
            {
                "id": "agadir",
                "name": "ODC Agadir", 
                "displayName": "ODC Agadir",
                "address": "Agadir, Morocco",
                "facilities": ["École du Code", "FabLab", "Orange Fab"]
            },
            {
                "id": "benmisk",
                "name": "ODC Club Ben M'sik",
                "displayName": "ODC Club Ben M'sik", 
                "address": "Casablanca, Morocco",
                "facilities": ["École du Code", "FabLab"]
            },
            {
                "id": "sidimaarouf",
                "name": "ODC Club Sidi Maarouf",
                "displayName": "ODC Club Sidi Maarouf",
                "address": "Casablanca, Morocco", 
                "facilities": ["École du Code", "Orange Fab"]
            }
        ]
    };
    console.log('Paramètres chargés:', settings);
    return settings;
}


function setupEventListeners() {
    document.querySelectorAll('.nav-link[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }

    const addNewBtn = document.getElementById('addNewBtn');
    if (addNewBtn) {
        addNewBtn.addEventListener('click', handleAddNew);
    }

    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    setupSearchAndFilters();
}

function showPage(pageName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[data-page="${pageName}"]`);
    if (activeLink) {
        activeLink.closest('.nav-item').classList.add('active');
    }

    document.querySelectorAll('.content-page').forEach(page => {
        page.classList.remove('active');
    });

    const targetPage = document.getElementById(`${pageName}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    const pageTitle = document.getElementById('pageTitle');
    const titles = {
        'dashboard': 'Tableau de bord',
        'formations': 'Gestion des Formations',
        'events': 'Gestion des Événements',
        'settings': 'Paramètres'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[pageName] || 'Administration';
    }

    currentPage = pageName;

    switch(pageName) {
        case 'formations':
            displayFormations();
            break;
        case 'events':
            displayEvents();
            break;
        case 'settings':
            displaySettings();
            break;
    }
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('show');
}


function updateDashboardStats() {
    const totalFormationsEl = document.getElementById('totalFormations');
    const totalEventsEl = document.getElementById('totalEvents');
    const totalParticipantsEl = document.getElementById('totalParticipants');

    if (totalFormationsEl) {
        totalFormationsEl.textContent = formations.length;
    }
    
    if (totalEventsEl) {
        totalEventsEl.textContent = events.length;
    }

    if (totalParticipantsEl) {
        const totalParticipants = formations.reduce((sum, f) => sum + (f.currentParticipants || 0), 0) +
                                 events.reduce((sum, e) => sum + (e.currentParticipants || 0), 0);
        totalParticipantsEl.textContent = totalParticipants;
    }
}

function updateRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;

    const allActivities = [
        ...formations.map(f => ({...f, type: 'formation', date: f.createdAt})),
        ...events.map(e => ({...e, type: 'event', date: e.createdAt}))
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
        ...formations.filter(f => new Date(f.dateStart) > today),
        ...events.filter(e => new Date(e.date) > today)
    ].sort((a, b) => {
        const dateA = new Date(a.dateStart || a.date);
        const dateB = new Date(b.dateStart || b.date);
        return dateA - dateB;
    }).slice(0, 5);

    const upcomingHTML = upcoming.map(item => {
        const itemDate = new Date(item.dateStart || item.date);
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

function displayFormations() {
    filterFormations();
}


function editFormation(id) {
    const formation = formations.find(f => f.id === id);
    if (!formation) return;

    currentEditId = id;
    showFormationModal(formation);
}

function deleteFormation(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
        formations = formations.filter(f => f.id !== id);
        saveFormations();
        displayFormations();
        updateDashboardStats();
        showNotification('Formation supprimée avec succès', 'success');
    }
}


function displayEvents() {
    filterEvents();
}

function editEvent(id) {
    const event = events.find(e => e.id === id);
    if (!event) return;

    currentEditId = id;
    showEventModal(event);
}

function deleteEvent(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        events = events.filter(e => e.id !== id);
        saveEvents();
        displayEvents();
        updateDashboardStats();
        showNotification('Événement supprimé avec succès', 'success');
    }
}


function showFormationModal(formation = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = formation ? 'Modifier la formation' : 'Ajouter une formation';

    const formHTML = `
        <form id="formationForm">
            <div class="form-group">
                <label for="title">Titre de la formation</label>
                <input type="text" id="title" name="title" value="${formation?.title || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="category">Catégorie</label>
                <select id="category" name="category" required>
                    <option value="">Sélectionner une catégorie</option>
                    <option value="ecole-du-code" ${formation?.category === 'ecole-du-code' ? 'selected' : ''}>École du Code</option>
                    <option value="fablab" ${formation?.category === 'fablab' ? 'selected' : ''}>FabLab</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="description">Description</label>
                <textarea id="description" name="description" rows="3" required>${formation?.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="dateStart">Date de début</label>
                <input type="date" id="dateStart" name="dateStart" value="${formation?.dateStart || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="dateEnd">Date de fin</label>
                <input type="date" id="dateEnd" name="dateEnd" value="${formation?.dateEnd || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="timeStart">Heure de début</label>
                <input type="time" id="timeStart" name="timeStart" value="${formation?.timeStart || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="timeEnd">Heure de fin</label>
                <input type="time" id="timeEnd" name="timeEnd" value="${formation?.timeEnd || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="city">Ville</label>
                <select id="city" name="city" required>
                    <option value="">Sélectionner une ville</option>
                    <option value="rabat" ${formation?.city === 'rabat' ? 'selected' : ''}>Rabat</option>
                    <option value="agadir" ${formation?.city === 'agadir' ? 'selected' : ''}>Agadir</option>
                    <option value="benmisk" ${formation?.city === 'benmisk' ? 'selected' : ''}>Ben M'sik</option>
                    <option value="sidimaarouf" ${formation?.city === 'sidimaarouf' ? 'selected' : ''}>Sidi Maarouf</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="location">Lieu exact</label>
                <input type="text" id="location" name="location" value="${formation?.location || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="maxParticipants">Nombre max de participants</label>
                <input type="number" id="maxParticipants" name="maxParticipants" value="${formation?.maxParticipants || ''}" min="1" required>
            </div>
            
            <div class="form-group">
                <label for="image">URL de l'image</label>
                <input type="url" id="image" name="image" value="${formation?.image || ''}">
            </div>
            
            <div class="form-group">
                <label for="registrationLink">Lien d'inscription</label>
                <input type="url" id="registrationLink" name="registrationLink" value="${formation?.registrationLink || ''}" placeholder="https://forms.google.com/...">
            </div>
            
            <div class="form-group">
                <label for="status">Statut</label>
                <select id="status" name="status" required>
                    <option value="active" ${formation?.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${formation?.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                </select>
            </div>
            
            <div class="d-flex gap-1">
                <button type="submit" class="btn btn-primary">
                    ${formation ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button type="button" class="btn btn-outline" onclick="closeModal()">Annuler</button>
            </div>
        </form>
    `;

    modalBody.innerHTML = formHTML;
    modal.classList.add('show');

    const form = document.getElementById('formationForm');
    form.addEventListener('submit', handleFormationSubmit);
}

function showEventModal(event = null) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = event ? 'Modifier l\'événement' : 'Ajouter un événement';

    const formHTML = `
        <form id="eventForm">
            <div class="form-group">
                <label for="eventTitle">Titre de l'événement</label>
                <input type="text" id="eventTitle" name="title" value="${event?.title || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="eventDescription">Description</label>
                <textarea id="eventDescription" name="description" rows="3" required>${event?.description || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="eventDate">Date</label>
                <input type="date" id="eventDate" name="date" value="${event?.date || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="eventTimeStart">Heure de début</label>
                <input type="time" id="eventTimeStart" name="timeStart" value="${event?.timeStart || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="eventTimeEnd">Heure de fin</label>
                <input type="time" id="eventTimeEnd" name="timeEnd" value="${event?.timeEnd || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="eventCity">Ville</label>
                <select id="eventCity" name="city" required>
                    <option value="">Sélectionner une ville</option>
                    <option value="rabat" ${event?.city === 'rabat' ? 'selected' : ''}>Rabat</option>
                    <option value="agadir" ${event?.city === 'agadir' ? 'selected' : ''}>Agadir</option>
                    <option value="benmisk" ${event?.city === 'benmisk' ? 'selected' : ''}>Ben M'sik</option>
                    <option value="sidimaarouf" ${event?.city === 'sidimaarouf' ? 'selected' : ''}>Sidi Maarouf</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="eventLocation">Lieu exact</label>
                <input type="text" id="eventLocation" name="location" value="${event?.location || ''}" required>
            </div>
            
            <div class="form-group">
                <label for="eventOrganizer">Organisateur</label>
                <input type="text" id="eventOrganizer" name="organizer" value="${event?.organizer || ''}">
            </div>
            
            <div class="form-group">
                <label for="eventMaxParticipants">Nombre max de participants</label>
                <input type="number" id="eventMaxParticipants" name="maxParticipants" value="${event?.maxParticipants || ''}" min="1" required>
            </div>
            
            <div class="form-group">
                <label for="eventImage">URL de l'image</label>
                <input type="url" id="eventImage" name="image" value="${event?.image || ''}">
            </div>
            
            <div class="form-group">
                <label for="eventStatus">Statut</label>
                <select id="eventStatus" name="status" required>
                    <option value="active" ${event?.status === 'active' ? 'selected' : ''}>Actif</option>
                    <option value="inactive" ${event?.status === 'inactive' ? 'selected' : ''}>Inactif</option>
                </select>
            </div>
            
            <div class="d-flex gap-1">
                <button type="submit" class="btn btn-primary">
                    ${event ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button type="button" class="btn btn-outline" onclick="closeModal()">Annuler</button>
            </div>
        </form>
    `;

    modalBody.innerHTML = formHTML;
    modal.classList.add('show');

    const form = document.getElementById('eventForm');
    form.addEventListener('submit', handleEventSubmit);
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('show');
    currentEditId = null;
}


function handleFormationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const formationData = Object.fromEntries(formData);
    
    formationData.id = currentEditId || generateId();
    formationData.currentParticipants = currentEditId ? 
        formations.find(f => f.id === currentEditId)?.currentParticipants || 0 : 0;
    formationData.maxParticipants = parseInt(formationData.maxParticipants);
    formationData.price = 0;
    formationData.createdAt = currentEditId ? 
        formations.find(f => f.id === currentEditId)?.createdAt : new Date().toISOString();
    formationData.updatedAt = new Date().toISOString();

    if (currentEditId) {
        const index = formations.findIndex(f => f.id === currentEditId);
        formations[index] = formationData;
        showNotification('Formation mise à jour avec succès', 'success');
    } else {
        formations.push(formationData);
        showNotification('Formation ajoutée avec succès', 'success');
    }

    saveFormations();
    closeModal();
    displayFormations();
    updateDashboardStats();
}

function handleEventSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const eventData = Object.fromEntries(formData);
    
    eventData.id = currentEditId || generateId();
    eventData.category = 'orange-fab';
    eventData.currentParticipants = currentEditId ? 
        events.find(e => e.id === currentEditId)?.currentParticipants || 0 : 0;
    eventData.maxParticipants = parseInt(eventData.maxParticipants);
    eventData.price = 0;
    eventData.tags = [];
    eventData.createdAt = currentEditId ? 
        events.find(e => e.id === currentEditId)?.createdAt : new Date().toISOString();
    eventData.updatedAt = new Date().toISOString();

    if (currentEditId) {
        const index = events.findIndex(e => e.id === currentEditId);
        events[index] = eventData;
        showNotification('Événement mis à jour avec succès', 'success');
    } else {
        events.push(eventData);
        showNotification('Événement ajouté avec succès', 'success');
    }

    saveEvents();
    closeModal();
    displayEvents();
    updateDashboardStats();
}


function generateId() {
    return Date.now().toString();
}

function getCityName(cityCode) {
    const cities = {
        'rabat': 'ODC Rabat',
        'agadir': 'ODC Agadir',
        'benmisk': 'ODC Club Ben M\'sik',
        'sidimaarouf': 'ODC Club Sidi Maarouf'
    };
    return cities[cityCode] || cityCode;
}

function handleAddNew() {
    switch(currentPage) {
        case 'formations':
            showFormationModal();
            break;
        case 'events':
            showEventModal();
            break;
        default:
            showNotification('Fonctionnalité non disponible sur cette page', 'info');
    }
}


function saveFormations() {
    localStorage.setItem('odc_formations', JSON.stringify(formations));
    console.log('Formations sauvegardées');
}

function saveEvents() {
    localStorage.setItem('odc_events', JSON.stringify(events));
    console.log('Événements sauvegardés');
}

function saveSettings() {
    localStorage.setItem('odc_settings', JSON.stringify(settings));
    console.log('Paramètres sauvegardés');
}


function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                       type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);

    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}


function setupSearchAndFilters() {
    const searchFormations = document.getElementById('searchFormations');
    if (searchFormations) {
        searchFormations.addEventListener('input', filterFormations);
    }

    const categoryFilter = document.getElementById('categoryFilter');
    const cityFilter = document.getElementById('cityFilter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterFormations);
    }
    
    if (cityFilter) {
        cityFilter.addEventListener('change', filterFormations);
    }

    const searchEvents = document.getElementById('searchEvents');
    if (searchEvents) {
        searchEvents.addEventListener('input', filterEvents);
    }

    const eventsCityFilter = document.getElementById('eventsCityFilter');
    if (eventsCityFilter) {
        eventsCityFilter.addEventListener('change', filterEvents);
    }
}

function filterFormations() {
    const searchTerm = document.getElementById('searchFormations')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const cityFilter = document.getElementById('cityFilter')?.value || '';
    
    let filteredFormations = formations.filter(formation => {
        const matchesSearch = formation.title.toLowerCase().includes(searchTerm) ||
                            formation.description.toLowerCase().includes(searchTerm) ||
                            formation.location.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || formation.category === categoryFilter;
        const matchesCity = !cityFilter || formation.city === cityFilter;
        
        return matchesSearch && matchesCategory && matchesCity;
    });
    
    displayFilteredFormations(filteredFormations);
}

function filterEvents() {
    const searchTerm = document.getElementById('searchEvents')?.value.toLowerCase() || '';
    const cityFilter = document.getElementById('eventsCityFilter')?.value || '';
    
    let filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm) ||
                            event.location.toLowerCase().includes(searchTerm) ||
                            (event.organizer && event.organizer.toLowerCase().includes(searchTerm));
        
        const matchesCity = !cityFilter || event.city === cityFilter;
        
        return matchesSearch && matchesCity;
    });
    
    displayFilteredEvents(filteredEvents);
}

function displayFilteredFormations(filteredFormations) {
    const tableBody = document.getElementById('formationsTableBody');
    if (!tableBody) return;

    if (filteredFormations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center" style="padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #6c757d; margin-bottom: 1rem; display: block;"></i>
                    <p style="color: #6c757d; font-size: 1.1rem;">Aucune formation trouvée</p>
                    <p style="color: #6c757d; font-size: 0.9rem;">Essayez de modifier vos critères de recherche</p>
                </td>
            </tr>
        `;
        return;
    }

    const formationsHTML = filteredFormations.map(formation => `
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
                ${new Date(formation.dateStart).toLocaleDateString('fr-FR')}
                ${formation.dateEnd !== formation.dateStart ? ' - ' + new Date(formation.dateEnd).toLocaleDateString('fr-FR') : ''}
            </td>
            <td>${getCityName(formation.city)}</td>
            <td>
                <div class="d-flex align-center gap-1">
                    <span>${formation.currentParticipants || 0}/${formation.maxParticipants}</span>
                    <div style="width: 60px; height: 4px; background: #e9ecef; border-radius: 2px;">
                        <div style="width: ${((formation.currentParticipants || 0) / formation.maxParticipants) * 100}%; height: 100%; background: var(--primary-color); border-radius: 2px;"></div>
                    </div>
                </div>
            </td>
            <td>
                ${formation.registrationLink ? 
                    `<button class="btn btn-sm btn-success" onclick="window.open('${formation.registrationLink}', '_blank')" title="Ouvrir le formulaire d'inscription">
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
    
    updateResultsCounter('formations', filteredFormations.length, formations.length);
}

function displayFilteredEvents(filteredEvents) {
    const tableBody = document.getElementById('eventsTableBody');
    if (!tableBody) return;

    if (filteredEvents.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center" style="padding: 2rem;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #6c757d; margin-bottom: 1rem; display: block;"></i>
                    <p style="color: #6c757d; font-size: 1.1rem;">Aucun événement trouvé</p>
                    <p style="color: #6c757d; font-size: 0.9rem;">Essayez de modifier vos critères de recherche</p>
                </td>
            </tr>
        `;
        return;
    }

    const eventsHTML = filteredEvents.map(event => `
        <tr>
            <td>
                <div class="d-flex align-center gap-1">
                    <img src="${event.image}" alt="${event.title}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;">
                    <div>
                        <strong>${event.title}</strong>
                        <br><small class="text-muted">${event.organizer || 'Non défini'}</small>
                    </div>
                </div>
            </td>
            <td>${new Date(event.date).toLocaleDateString('fr-FR')}</td>
            <td>${event.timeStart} - ${event.timeEnd}</td>
            <td>${getCityName(event.city)}</td>
            <td>
                <div class="d-flex align-center gap-1">
                    <span>${event.currentParticipants || 0}/${event.maxParticipants}</span>
                    <div style="width: 60px; height: 4px; background: #e9ecef; border-radius: 2px;">
                        <div style="width: ${((event.currentParticipants || 0) / event.maxParticipants) * 100}%; height: 100%; background: var(--success-color); border-radius: 2px;"></div>
                    </div>
                </div>
            </td>
            <td>
                <span class="status-badge status-${event.status}">${event.status === 'active' ? 'Actif' : 'Inactif'}</span>
            </td>
            <td>
                <div class="actions-cell">
                    <button class="btn btn-sm btn-primary" onclick="editEvent('${event.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteEvent('${event.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    tableBody.innerHTML = eventsHTML;
    
    updateResultsCounter('events', filteredEvents.length, events.length);
}

function updateResultsCounter(type, filteredCount, totalCount) {
    const pageControls = document.querySelector(`#${type}-page .page-controls`);
    if (!pageControls) return;
    
    let counter = pageControls.querySelector('.results-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'results-counter';
        pageControls.appendChild(counter);
    }
    
    if (filteredCount === totalCount) {
        counter.innerHTML = `<i class="fas fa-list"></i> ${totalCount} ${type === 'formations' ? 'formations' : 'événements'} au total`;
        counter.className = 'results-counter';
    } else {
        counter.innerHTML = `<i class="fas fa-filter"></i> ${filteredCount} sur ${totalCount} ${type === 'formations' ? 'formations' : 'événements'}`;
        counter.className = 'results-counter filtered';
    }
}


function displaySettings() {
    const form = document.getElementById('generalSettingsForm');
    if (form && settings.siteSettings) {
        const siteSettings = settings.siteSettings;
        
        document.getElementById('siteTitle').value = siteSettings.title || '';
        document.getElementById('siteDescription').value = siteSettings.description || '';
        document.getElementById('heroTitle').value = siteSettings.heroTitle || '';
        document.getElementById('heroSubtitle').value = siteSettings.heroSubtitle || '';
        document.getElementById('contactEmail').value = siteSettings.contactEmail || '';
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            showNotification('Paramètres sauvegardés avec succès', 'success');
        });
    }

    displayOdcCenters();
}

function displayOdcCenters() {
    const container = document.getElementById('odcCentersList');
    if (!container || !settings.odcCenters) return;

    const centersHTML = settings.odcCenters.map(center => `
        <div class="odc-center-item">
            <h4>${center.displayName}</h4>
            <p>${center.address}</p>
            <p><strong>Équipements:</strong> ${center.facilities.join(', ')}</p>
        </div>
    `).join('');

    container.innerHTML = centersHTML;
}
