// ========================================
// FONCTIONS POUR CORRIGER LE CALENDRIER
// ========================================

// Variable pour stocker les données du calendrier depuis Supabase
let calendarEventsData = {};

// Fonction pour générer les données du calendrier depuis Supabase
function generateCalendarData() {
    calendarEventsData = {};
    
    console.log('🔄 Génération des données du calendrier...');
    console.log('Formations disponibles:', formations);
    console.log('Événements disponibles:', events);
    
    // Fonction pour obtenir toutes les dates entre deux dates
    function getDatesBetween(startDate, endDate) {
        const dates = [];
        const currentDate = new Date(startDate);
        const finalDate = endDate ? new Date(endDate) : new Date(startDate);
        
        while (currentDate <= finalDate) {
            dates.push(currentDate.toISOString().split('T')[0]);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }
    
    // Traiter les formations depuis Supabase (sur tous les jours de la formation)
    formations.forEach(formation => {
        const startDate = formation.date_start;
        const endDate = formation.date_end || formation.date_start;
        
        // Obtenir toutes les dates de la formation
        const formationDates = getDatesBetween(startDate, endDate);
        
        formationDates.forEach((dateKey, index) => {
            if (!calendarEventsData[dateKey]) {
                calendarEventsData[dateKey] = [];
            }
            
            // Ajouter un indicateur du jour (Jour 1/3, Jour 2/3, etc.)
            const dayIndicator = formationDates.length > 1 ? ` (Jour ${index + 1}/${formationDates.length})` : '';
            
            calendarEventsData[dateKey].push({
                title: formation.title + dayIndicator,
                type: 'formation',
                category: formation.category,
                city: formation.city,
                time: `${formation.time_start}-${formation.time_end}`,
                description: formation.description,
                location: formation.location || getCityDisplayName(formation.city),
                participants: `${formation.current_participants}/${formation.max_participants}`,
                status: formation.status,
                isMultiDay: formationDates.length > 1,
                dayNumber: index + 1,
                totalDays: formationDates.length
            });
        });
    });
    
    // Traiter les événements depuis Supabase
    events.forEach(event => {
        const dateKey = event.date_start;
        if (!calendarEventsData[dateKey]) {
            calendarEventsData[dateKey] = [];
        }
        
        calendarEventsData[dateKey].push({
            title: event.title,
            type: 'event',
            category: 'orange-fab',
            city: event.city,
            time: `${event.time_start}-${event.time_end}`,
            description: event.description,
            location: event.location || getCityDisplayName(event.city),
            participants: `${event.current_participants}/${event.max_participants}`,
            status: event.status
        });
    });
    
    console.log('📅 Données du calendrier générées:', calendarEventsData);
    
    // Initialiser la navigation du calendrier
    initializeCalendarNavigation();
    
    // Mettre à jour les cartes de dates avec les vraies données
    updateDateCards();
    
    // Mettre à jour l'affichage des événements pour aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    updateEventsDisplay(today);
}

// Variable pour gérer la navigation du calendrier
let currentCalendarStart = new Date();

// Fonction pour obtenir le début de la semaine (lundi)
function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustement pour commencer le lundi
    return new Date(d.setDate(diff));
}

// Fonction pour naviguer dans le calendrier
function navigateCalendar(direction) {
    // direction: -1 pour précédent, +1 pour suivant
    currentCalendarStart.setDate(currentCalendarStart.getDate() + (direction * 7));
    updateDateCardsFromStart(currentCalendarStart);
}

// Fonction pour mettre à jour les cartes à partir d'une date de départ
function updateDateCardsFromStart(startDate) {
    const datesCarousel = document.getElementById('datesCarousel');
    if (!datesCarousel) return;
    
    // S'assurer qu'on commence au début de la semaine
    const weekStart = getWeekStart(startDate);
    currentCalendarStart = new Date(weekStart);
    
    let datesHTML = '';
    const now = new Date();
    
    console.log('📅 Navigation calendrier - Semaine du:', weekStart.toLocaleDateString('fr-FR'));
    
    // Générer 7 jours à partir du début de la semaine
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        
        const dateKey = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
        const year = date.getFullYear();
        
        // Compter les événements pour cette date
        const eventsCount = calendarEventsData[dateKey] ? calendarEventsData[dateKey].length : 0;
        const eventsText = eventsCount === 0 ? 'Aucun événement' : 
                          eventsCount === 1 ? '1 événement' : 
                          `${eventsCount} événements`;
        
        // Vérifier si c'est aujourd'hui
        const isToday = date.toDateString() === now.toDateString();
        const activeClass = (i === 0 && isToday) ? 'today active' : isToday ? 'today' : '';
        const dayText = isToday ? 'Aujourd\'hui' : dayName;
        
        // Ajouter l'année si on change d'année
        const monthDisplay = date.getFullYear() !== now.getFullYear() ? 
            `${monthName} ${year}` : monthName;
        
        datesHTML += `
            <div class="date-card ${activeClass}" data-date="${dateKey}">
                <div class="date-number">${dayNumber}</div>
                <div class="date-day">${dayText}</div>
                <div class="date-month">${monthDisplay}</div>
                <div class="events-count">${eventsText}</div>
            </div>
        `;
    }
    
    datesCarousel.innerHTML = datesHTML;
    
    // Réattacher les événements de clic
    attachDateCardEvents();
}

// Fonction pour mettre à jour les cartes de dates avec les bonnes données
function updateDateCards() {
    const today = new Date();
    currentCalendarStart = getWeekStart(today); // Commencer au début de la semaine courante
    updateDateCardsFromStart(currentCalendarStart);
}

// Fonction pour attacher les événements aux cartes de dates
function attachDateCardEvents() {
    const dateCards = document.querySelectorAll('.date-card');
    dateCards.forEach(card => {
        card.addEventListener('click', function() {
            // Retirer la classe active de toutes les cartes
            dateCards.forEach(c => c.classList.remove('active'));
            // Ajouter la classe active à la carte cliquée
            this.classList.add('active');
            // Mettre à jour l'affichage des événements
            const selectedDate = this.getAttribute('data-date');
            updateEventsDisplay(selectedDate);
        });
    });
}

// Initialiser la navigation du calendrier
function initializeCalendarNavigation() {
    const prevBtn = document.getElementById('prevDates');
    const nextBtn = document.getElementById('nextDates');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => navigateCalendar(-1));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => navigateCalendar(1));
    }
    
    console.log('🎮 Navigation calendrier initialisée');
}

// Fonction pour mettre à jour l'affichage des événements du calendrier
function updateEventsDisplay(selectedDate) {
    const selectedDateTitle = document.getElementById('selectedDateTitle');
    const eventsList = document.getElementById('eventsList');
    const upcomingList = document.getElementById('upcomingList');
    
    if (!selectedDateTitle || !eventsList) return;
    
    // Mettre à jour le titre
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    selectedDateTitle.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    // Récupérer les événements de la date sélectionnée depuis Supabase
    const dayEvents = calendarEventsData[selectedDate] || [];
    
    // Afficher les événements du jour
    displayCalendarEvents(dayEvents, eventsList);
    
    // Afficher les prochains événements
    if (upcomingList) {
        displayUpcomingEvents(selectedDate, upcomingList);
    }
}

// Fonction pour afficher les événements dans le calendrier
function displayCalendarEvents(events, container) {
    if (!container) return;
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="no-events-calendar">
                <i class="fas fa-calendar-times"></i>
                <h4>Aucun événement prévu</h4>
                <p>Aucune formation ou événement n'est programmé pour cette date.</p>
            </div>
        `;
        return;
    }
    
    const eventsHTML = events.map(event => {
        const typeClass = event.type === 'formation' ? 'formation' : 'event';
        const typeBadge = event.type === 'formation' ? 
            (event.category === 'ecole-du-code' ? 'Formation' : 'FabLab') : 
            'Événement';
        const typeColor = event.type === 'formation' ? 
            (event.category === 'ecole-du-code' ? '#007bff' : '#28a745') : 
            '#6f42c1';
            
        // Classes CSS pour les événements multi-jours
        const multiDayClass = event.isMultiDay ? 'calendar-event-multi-day' : '';
        const dayIndicator = event.isMultiDay ? 
            `<div class="calendar-event-day-indicator">Jour ${event.dayNumber}/${event.totalDays}</div>` : '';
            
        return `
            <div class="calendar-event-item ${typeClass} ${multiDayClass}">
                <div class="event-time">
                    <i class="fas fa-clock"></i>
                    ${event.time}
                </div>
                <div class="event-details">
                    <div class="event-header">
                        <h5 class="event-title">${event.title}</h5>
                        <span class="event-type-badge" style="background: ${typeColor}">${typeBadge}</span>
                    </div>
                    ${dayIndicator}
                    <p class="event-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${event.location}
                    </p>
                    <p class="event-description">${event.description}</p>
                    ${event.participants ? `<p class="event-participants">
                        <i class="fas fa-users"></i>
                        ${event.participants} participants
                    </p>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = eventsHTML;
}

// Fonction pour afficher les prochains événements
function displayUpcomingEvents(currentDate, container) {
    if (!container) return;
    
    console.log('🔍 Recherche des prochains événements après:', currentDate);
    
    // Obtenir toutes les dates futures avec des événements
    const currentDateTime = new Date(currentDate);
    const futureEvents = [];
    const seenEvents = new Map(); // Utiliser Map pour stocker les premiers événements
    
    // Parcourir toutes les dates du calendrier
    Object.keys(calendarEventsData).forEach(dateKey => {
        const eventDate = new Date(dateKey);
        // Prendre seulement les événements futurs (après la date sélectionnée)
        if (eventDate > currentDateTime) {
            calendarEventsData[dateKey].forEach(event => {
                // Nettoyer le titre pour créer une clé unique (enlever les mentions de jour)
                const cleanTitle = event.title.replace(/\s*\(Jour\s+\d+\/\d+\)\s*/g, '').trim();
                const eventKey = `${cleanTitle}-${event.city}-${event.type}`;
                
                // Si on n'a pas encore vu cet événement, ou si c'est une date plus tôt
                if (!seenEvents.has(eventKey) || eventDate < seenEvents.get(eventKey).dateObj) {
                    seenEvents.set(eventKey, {
                        ...event,
                        title: cleanTitle, // Utiliser le titre nettoyé
                        date: dateKey,
                        dateObj: eventDate
                    });
                }
            });
        }
    });
    
    // Convertir Map en Array et trier par date
    const uniqueEvents = Array.from(seenEvents.values());
    uniqueEvents.sort((a, b) => a.dateObj - b.dateObj);
    
    // Prendre seulement les 5 prochains événements uniques
    const nextEvents = uniqueEvents.slice(0, 5);
    
    console.log('📅 Prochains événements trouvés:', nextEvents.length);
    
    if (nextEvents.length === 0) {
        container.innerHTML = `
            <div class="no-upcoming-events">
                <i class="fas fa-calendar-check"></i>
                <p>Aucun événement programmé prochainement</p>
            </div>
        `;
        return;
    }
    
    const upcomingHTML = nextEvents.map(event => {
        const eventDate = event.dateObj.toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
        
        const typeIcon = event.type === 'formation' ? 'fas fa-graduation-cap' : 'fas fa-calendar-alt';
        const typeColor = event.type === 'formation' ? 
            (event.category === 'ecole-du-code' ? '#007bff' : '#28a745') : 
            '#6f42c1';
        
        return `
            <div class="upcoming-event-item">
                <div class="upcoming-event-date">
                    <div class="date-badge" style="background: ${typeColor}">
                        ${eventDate}
                    </div>
                </div>
                <div class="upcoming-event-info">
                    <div class="upcoming-event-title">
                        <i class="${typeIcon}" style="color: ${typeColor}"></i>
                        ${event.title}
                    </div>
                    <div class="upcoming-event-details">
                        <span class="upcoming-time">${event.time}</span>
                        <span class="upcoming-location">${event.location || getCityDisplayName(event.city)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = upcomingHTML;
}

// Fonction pour obtenir le nom d'affichage de la ville
function getCityDisplayName(city) {
    const cityNames = {
        'rabat': 'ODC Rabat',
        'agadir': 'ODC Agadir', 
        'benmisk': 'ODC Ben M\'sik',
        'sidimaarouf': 'ODC Sidi Maarouf'
    };
    return cityNames[city] || city;
}

// Fonction pour filtrer le calendrier par ville
function updateCalendarForCity(selectedCity) {
    console.log('📅 Mise à jour du calendrier pour la ville:', selectedCity);
    
    // Régénérer les données du calendrier avec le filtre
    const originalFormations = [...formations];
    const originalEvents = [...events];
    
    if (selectedCity !== 'all') {
        // Filtrer temporairement les données pour le calendrier
        formations = originalFormations.filter(f => f.city === selectedCity);
        events = originalEvents.filter(e => e.city === selectedCity);
    }
    
    // Régénérer le calendrier
    generateCalendarData();
    
    // Restaurer les données originales
    formations = originalFormations;
    events = originalEvents;
}

// Appel de la fonction une fois que les données Supabase sont chargées
if (typeof window !== 'undefined') {
    window.generateCalendarData = generateCalendarData;
    window.updateEventsDisplay = updateEventsDisplay;
    window.updateCalendarForCity = updateCalendarForCity;
}