console.log('🚀 Script dynamique démarré');
let formations = [];
let events = [];
function getCityDisplayName(city) {
    const cityNames = {
        'rabat': 'ODC Rabat',
        'agadir': 'ODC Agadir',
        'benmisk': 'ODC Ben M\'sik',
        'sidimaarouf': 'ODC Sidi Maarouf'
    };
    return cityNames[city] || city;
}
function getDefaultImage(type, title) {
    const encodedTitle = encodeURIComponent(title);
    if (type === 'ecole-du-code') {
        return `https://via.placeholder.com/400x180/007ACC/FFFFFF?text=${encodedTitle}`;
    } else if (type === 'fablab') {
        return `https://via.placeholder.com/400x180/28a745/FFFFFF?text=${encodedTitle}`;
    } else if (type === 'event') {
        return `https://via.placeholder.com/400x180/fd7e14/FFFFFF?text=${encodedTitle}`;
    }
    return `https://via.placeholder.com/400x180/6c757d/FFFFFF?text=${encodedTitle}`;
}
async function loadDataFromSupabase() {
    try {
        console.log('🔄 Tentative de chargement depuis Supabase...');
        if (typeof window.supabase === 'undefined' || typeof supabase === 'undefined') {
            throw new Error('Supabase non disponible');
        }
        const { data: formationsData, error: formationsError } = await supabase
            .from('formations')
            .select('*')
            .eq('status', 'active')
            .order('date_start', { ascending: true });
        const { data: eventsData, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('status', 'active')
            .order('date_start', { ascending: true });
        if (formationsError) {
            console.warn('⚠️ Erreur formations Supabase:', formationsError.message);
        } else {
            formations = formationsData.map(f => ({ ...f, _origin: 'supabase' }));
            console.log(`✅ ${formations.length} formations chargées depuis Supabase`);
        }
        if (eventsError) {
            console.warn('⚠️ Erreur événements Supabase:', eventsError.message);
        } else {
            events = eventsData.map(e => ({ ...e, _origin: 'supabase' }));
            console.log(`✅ ${events.length} événements chargés depuis Supabase`);
        }
        return formations.length > 0 || events.length > 0;
    } catch (error) {
        console.error('❌ Erreur lors du chargement Supabase:', error.message);
        return false;
    }
}
function loadFallbackData() {
    console.log('📦 Chargement des données de fallback...');
    formations = [
        {
            "id": "fallback-1",
            "title": "Développement Web Full Stack",
            "category": "ecole-du-code",
            "description": "Formation complète en développement web frontend et backend avec HTML5, CSS3, JavaScript, React et Node.js.",
            "date_start": "2025-10-16",
            "date_end": "2025-10-18",
            "time_start": "09:00",
            "time_end": "17:00",
            "city": "rabat",
            "location": "ODC Rabat - École du Code",
            "current_participants": 18,
            "max_participants": 25,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "fallback-2",
            "title": "Python pour Data Science",
            "category": "ecole-du-code",
            "description": "Découvrez Python, pandas, numpy et matplotlib pour l'analyse de données. Formation pratique avec projets réels.",
            "date_start": "2025-10-22",
            "date_end": "2025-10-24",
            "time_start": "14:00",
            "time_end": "18:00",
            "city": "agadir",
            "location": "ODC Agadir - École du Code",
            "current_participants": 12,
            "max_participants": 20,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "fallback-3",
            "title": "Impression 3D et Prototypage",
            "category": "fablab",
            "description": "Maîtrisez les techniques d'impression 3D, de la conception 3D à la réalisation de prototypes fonctionnels.",
            "date_start": "2025-10-19",
            "date_end": "2025-10-20",
            "time_start": "09:00",
            "time_end": "17:00",
            "city": "rabat",
            "location": "ODC FabLab Rabat",
            "current_participants": 9,
            "max_participants": 12,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "fallback-4",
            "title": "Arduino et IoT",
            "category": "fablab",
            "description": "Initiez-vous à l'Internet des Objets avec Arduino. Créez vos premiers objets connectés.",
            "date_start": "2025-10-28",
            "date_end": "2025-10-29",
            "time_start": "14:00",
            "time_end": "18:00",
            "city": "agadir",
            "location": "ODC FabLab Agadir",
            "current_participants": 7,
            "max_participants": 10,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "fallback-5",
            "title": "Cybersécurité et Ethical Hacking",
            "category": "ecole-du-code",
            "description": "Apprenez les techniques de sécurité informatique et de hacking éthique pour protéger les systèmes.",
            "date_start": "2025-11-02",
            "date_end": "2025-11-06",
            "time_start": "09:00",
            "time_end": "17:00",
            "city": "sidimaarouf",
            "location": "ODC Sidi Maarouf - École du Code",
            "current_participants": 8,
            "max_participants": 15,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "fallback-6",
            "title": "Robotique et Programmation",
            "category": "fablab",
            "description": "Conception et programmation de robots éducatifs avec Arduino et capteurs.",
            "date_start": "2025-11-06",
            "date_end": "2025-11-07",
            "time_start": "10:00",
            "time_end": "16:00",
            "city": "benmisk",
            "location": "ODC Ben M'sik - FabLab",
            "current_participants": 5,
            "max_participants": 12,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        }
    ];
    events = [
        {
            "id": "event-fallback-1",
            "title": "Startup Pitch Night",
            "description": "Soirée de présentation des startups de l'écosystème ODC. Venez découvrir les projets innovants.",
            "date_start": "2025-10-17",
            "time_start": "18:00",
            "time_end": "21:00",
            "city": "rabat",
            "location": "ODC Rabat - Orange Fab",
            "current_participants": 45,
            "max_participants": 100,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "event-fallback-2",
            "title": "Tech Talk: IA et Futur du Travail",
            "description": "Conférence sur l'Intelligence Artificielle et son impact sur l'avenir des technologies.",
            "date_start": "2025-10-25",
            "time_start": "16:00",
            "time_end": "18:00",
            "city": "agadir",
            "location": "ODC Agadir - Orange Fab",
            "current_participants": 32,
            "max_participants": 80,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "event-fallback-3",
            "title": "Workshop Blockchain",
            "description": "Introduction pratique à la blockchain et aux smart contracts avec démonstrations.",
            "date_start": "2025-11-08",
            "time_start": "14:00",
            "time_end": "17:00",
            "city": "sidimaarouf",
            "location": "ODC Sidi Maarouf - Orange Fab",
            "current_participants": 15,
            "max_participants": 40,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        },
        {
            "id": "event-fallback-4",
            "title": "Networking Entrepreneurs",
            "description": "Soirée networking pour les entrepreneurs et startups de l'écosystème tech.",
            "date_start": "2025-11-12",
            "time_start": "18:00",
            "time_end": "21:00",
            "city": "benmisk",
            "location": "ODC Ben M'sik - Orange Fab",
            "current_participants": 25,
            "max_participants": 60,
            "image": null,
            "status": "active",
            "_origin": "fallback"
        }
    ];
    console.log('📦 Données de fallback chargées:', formations.length, 'formations,', events.length, 'événements');
}
function loadContent() {
    console.log('📦 Génération du contenu...');
    const formationsContainer = document.getElementById('formations-container');
    if (formationsContainer) {
        const ecoleFormations = formations.filter(f => f.category === 'ecole-du-code');
        console.log('🎓 Formations École du Code:', ecoleFormations.length);
        const formationsHTML = ecoleFormations.map(formation => {
            const startDate = new Date(formation.date_start);
            const endDate = new Date(formation.date_end);
            const dateText = startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            const dateRange = startDate.getTime() !== endDate.getTime() ? 
                ` - ${endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}` : '';
            const cityName = getCityDisplayName(formation.city);
            const imageUrl = formation.image || getDefaultImage('ecole-du-code', formation.title);
            return `
                <div class="formation-card fade-in" data-city="${formation.city}">
                    <div class="formation-image">
                        <img src="${imageUrl}" alt="${formation.title}" onerror="this.src='${getDefaultImage('ecole-du-code', formation.title)}'">
                    </div>
                    <div class="card-header">
                        <h4 class="formation-title">${formation.title}</h4>
                        <span class="formation-badge ecole-du-code">École du Code</span>
                    </div>
                    <div class="formation-info">
                        <p class="formation-date"><i class="fas fa-calendar"></i> ${dateText}${dateRange}</p>
                        <p class="formation-time"><i class="fas fa-clock"></i> ${formation.time_start} - ${formation.time_end}</p>
                        <p class="formation-location"><i class="fas fa-map-marker-alt"></i> ${cityName}</p>
                        <p class="formation-participants"><i class="fas fa-users"></i> ${formation.current_participants || 0}/${formation.max_participants || 'N/A'} participants</p>
                    </div>
                    <p class="formation-description">${formation.description}</p>
                    <button class="inscription-btn" onclick="window.open('${formation.registration_link || '#'}', '_blank')">S'inscrire</button>
                </div>
            `;
        }).join('');
        formationsContainer.innerHTML = formationsHTML;
        console.log('✅ Formations École du Code générées');
    }
    const fablabContainer = document.getElementById('fablab-container');
    if (fablabContainer) {
        const fablabFormations = formations.filter(f => f.category === 'fablab');
        console.log('🔧 Formations FabLab:', fablabFormations.length);
        const fablabHTML = fablabFormations.map(formation => {
            const startDate = new Date(formation.date_start);
            const endDate = new Date(formation.date_end);
            const dateText = startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            const dateRange = startDate.getTime() !== endDate.getTime() ? 
                ` - ${endDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}` : '';
            const cityName = getCityDisplayName(formation.city);
            const imageUrl = formation.image || getDefaultImage('fablab', formation.title);
            return `
                <div class="formation-card fade-in" data-city="${formation.city}">
                    <div class="formation-image">
                        <img src="${imageUrl}" alt="${formation.title}" onerror="this.src='${getDefaultImage('fablab', formation.title)}'">
                    </div>
                    <div class="card-header">
                        <h4 class="formation-title">${formation.title}</h4>
                        <span class="formation-badge fablab">FabLab</span>
                    </div>
                    <div class="formation-info">
                        <p class="formation-date"><i class="fas fa-calendar"></i> ${dateText}${dateRange}</p>
                        <p class="formation-time"><i class="fas fa-clock"></i> ${formation.time_start} - ${formation.time_end}</p>
                        <p class="formation-location"><i class="fas fa-map-marker-alt"></i> ${cityName}</p>
                        <p class="formation-participants"><i class="fas fa-users"></i> ${formation.current_participants || 0}/${formation.max_participants || 'N/A'} participants</p>
                    </div>
                    <p class="formation-description">${formation.description}</p>
                    <button class="inscription-btn" onclick="window.open('${formation.registration_link || '#'}', '_blank')">S'inscrire</button>
                </div>
            `;
        }).join('');
        fablabContainer.innerHTML = fablabHTML;
        console.log('✅ Formations FabLab générées');
    }
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
        console.log('🎪 Événements:', events.length);
        const eventsHTML = events.map(event => {
            const startDate = new Date(event.date_start);
            const dateText = startDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
            const cityName = getCityDisplayName(event.city);
            const imageUrl = event.image || getDefaultImage('event', event.title);
            return `
                <div class="event-card fade-in" data-city="${event.city}">
                    <div class="event-image">
                        <img src="${imageUrl}" alt="${event.title}" onerror="this.src='${getDefaultImage('event', event.title)}'">
                    </div>
                    <div class="card-header">
                        <div class="event-header-row">
                            <h4 class="event-title">${event.title}</h4>
                            <span class="event-badge orange-fab">Orange Fab</span>
                        </div>
                    </div>
                    <div class="event-info">
                        <p class="event-date"><i class="fas fa-calendar"></i> ${dateText}</p>
                        <p class="event-time"><i class="fas fa-clock"></i> ${event.time_start} - ${event.time_end}</p>
                        <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${cityName}</p>
                        <p class="event-participants"><i class="fas fa-users"></i> ${event.current_participants || 0}/${event.max_participants || 'N/A'} participants</p>
                    </div>
                    <p class="event-description">${event.description}</p>
                    <button class="inscription-btn" onclick="window.open('${event.registration_link || '#'}', '_blank')">Participer</button>
                </div>
            `;
        }).join('');
        eventsContainer.innerHTML = eventsHTML;
        console.log('✅ Événements générés');
    }
    animateFadeInElements();
    if (typeof generateCalendarData === 'function') {
        console.log('📅 Déclenchement de la génération du calendrier...');
        setTimeout(generateCalendarData, 300);
    }
}
function animateFadeInElements() {
    const fadeElements = document.querySelectorAll('.fade-in');
    console.log('✨ Animation de', fadeElements.length, 'éléments fade-in');
    fadeElements.forEach((element, index) => {
        setTimeout(() => {
            element.classList.add('visible');
        }, index * 100);
    });
}
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Application ODC démarrée - Tentative Supabase...');
    const supabaseSuccess = await loadDataFromSupabase();
    if (!supabaseSuccess || (formations.length === 0 && events.length === 0)) {
        console.warn('⚠️ Supabase indisponible ou vide - Chargement des données de fallback');
        loadFallbackData();
    }
    setTimeout(() => {
        loadContent();
        setupFilters(); // Ajouter la gestion des filtres
    }, 100);
    console.log('✅ Application initialisée');
});
function setupFilters() {
    console.log('🔍 Configuration des filtres...');
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const selectedCity = this.getAttribute('data-city');
            console.log('🏙️ Filtre sélectionné:', selectedCity);
            applyFilter(selectedCity);
        });
    });
}
function applyFilter(city) {
    const formationCards = document.querySelectorAll('.formation-card');
    formationCards.forEach(card => {
        const cardCity = card.getAttribute('data-city');
        if (city === 'all' || cardCity === city) {
            card.style.display = 'flex';
            card.classList.add('visible');
        } else {
            card.style.display = 'none';
            card.classList.remove('visible');
        }
    });
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        const cardCity = card.getAttribute('data-city');
        if (city === 'all' || cardCity === city) {
            card.style.display = 'flex';
            card.classList.add('visible');
        } else {
            card.style.display = 'none';
            card.classList.remove('visible');
        }
    });
    if (typeof updateCalendarForCity === 'function') {
        updateCalendarForCity(city);
    }
    const visibleFormations = document.querySelectorAll('.formation-card[style*="flex"]').length;
    const visibleEvents = document.querySelectorAll('.event-card[style*="flex"]').length;
    console.log(`✅ Filtre appliqué: ${visibleFormations} formations, ${visibleEvents} événements visibles`);
}
console.log('📝 Script dynamique configuré');
