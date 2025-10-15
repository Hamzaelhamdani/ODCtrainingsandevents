
let calendarEventsData = {};

function generateCalendarData() {
    calendarEventsData = {};
    
    console.log('🔄 Génération des données du calendrier...');
    console.log('Formations disponibles:', formations);
    console.log('Événements disponibles:', events);
    
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
    
    formations.forEach(formation => {
        const startDate = formation.date_start;
        const endDate = formation.date_end || formation.date_start;
        
        const formationDates = getDatesBetween(startDate, endDate);
        
        formationDates.forEach((dateKey, index) => {
            if (!calendarEventsData[dateKey]) {
                calendarEventsData[dateKey] = [];
            }
            
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
    
    initializeCalendarNavigation();
    
    updateDateCards();
    
    const today = new Date().toISOString().split('T')[0];
    updateEventsDisplay(today);
}

let currentCalendarStart = new Date();

function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustement pour commencer le lundi
    return new Date(d.setDate(diff));
}

function navigateCalendar(direction) {
    currentCalendarStart.setDate(currentCalendarStart.getDate() + (direction * 7));
    updateDateCardsFromStart(currentCalendarStart);
}

function updateDateCardsFromStart(startDate) {
    const datesCarousel = document.getElementById('datesCarousel');
    if (!datesCarousel) return;
    
    const weekStart = getWeekStart(startDate);
    currentCalendarStart = new Date(weekStart);
    
    let datesHTML = '';
    const now = new Date();
    
    console.log('📅 Navigation calendrier - Semaine du:', weekStart.toLocaleDateString('fr-FR'));
    
    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        
        const dateKey = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
        const dayNumber = date.getDate();
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
        const year = date.getFullYear();
        
        const eventsCount = calendarEventsData[dateKey] ? calendarEventsData[dateKey].length : 0;
        const eventsText = eventsCount === 0 ? 'Aucun événement' : 
                          eventsCount === 1 ? '1 événement' : 
                          `${eventsCount} événements`;
        
        const isToday = date.toDateString() === now.toDateString();
        const activeClass = (i === 0 && isToday) ? 'today active' : isToday ? 'today' : '';
        const dayText = isToday ? 'Aujourd\'hui' : dayName;
        
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
    
    attachDateCardEvents();
}

function updateDateCards() {
    const today = new Date();
    currentCalendarStart = getWeekStart(today); // Commencer au début de la semaine courante
    updateDateCardsFromStart(currentCalendarStart);
}

function attachDateCardEvents() {
    const dateCards = document.querySelectorAll('.date-card');
    dateCards.forEach(card => {
        card.addEventListener('click', function() {
            dateCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            const selectedDate = this.getAttribute('data-date');
            updateEventsDisplay(selectedDate);
        });
    });
}

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

function updateEventsDisplay(selectedDate) {
    const selectedDateTitle = document.getElementById('selectedDateTitle');
    const eventsList = document.getElementById('eventsList');
    const upcomingList = document.getElementById('upcomingList');
    
    if (!selectedDateTitle || !eventsList) return;
    
    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    selectedDateTitle.textContent = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    const dayEvents = calendarEventsData[selectedDate] || [];
    
    displayCalendarEvents(dayEvents, eventsList);
    
    if (upcomingList) {
        displayUpcomingEvents(selectedDate, upcomingList);
    }
}

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

function displayUpcomingEvents(currentDate, container) {
    if (!container) return;
    
    console.log('🔍 Recherche des prochains événements après:', currentDate);
    
    const currentDateTime = new Date(currentDate);
    const futureEvents = [];
    const seenEvents = new Map(); // Utiliser Map pour stocker les premiers événements
    
    Object.keys(calendarEventsData).forEach(dateKey => {
        const eventDate = new Date(dateKey);
        if (eventDate > currentDateTime) {
            calendarEventsData[dateKey].forEach(event => {
                const cleanTitle = event.title.replace(/\s*\(Jour\s+\d+\/\d+\)\s*/g, '').trim();
                const eventKey = `${cleanTitle}-${event.city}-${event.type}`;
                
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
    
    const uniqueEvents = Array.from(seenEvents.values());
    uniqueEvents.sort((a, b) => a.dateObj - b.dateObj);
    
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

function getCityDisplayName(city) {
    const cityNames = {
        'rabat': 'ODC Rabat',
        'agadir': 'ODC Agadir', 
        'benmisk': 'ODC Ben M\'sik',
        'sidimaarouf': 'ODC Sidi Maarouf'
    };
    return cityNames[city] || city;
}

function updateCalendarForCity(selectedCity) {
    console.log('📅 Mise à jour du calendrier pour la ville:', selectedCity);
    
    const originalFormations = [...formations];
    const originalEvents = [...events];
    
    if (selectedCity !== 'all') {
        formations = originalFormations.filter(f => f.city === selectedCity);
        events = originalEvents.filter(e => e.city === selectedCity);
    }
    
    generateCalendarData();
    
    formations = originalFormations;
    events = originalEvents;
}

if (typeof window !== 'undefined') {
    window.generateCalendarData = generateCalendarData;
    window.updateEventsDisplay = updateEventsDisplay;
    window.updateCalendarForCity = updateCalendarForCity;
}
