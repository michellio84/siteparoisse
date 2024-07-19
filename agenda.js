document.addEventListener('DOMContentLoaded', function() {
    fetch('agenda-index.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('events-container');
            data.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.innerHTML = `
                    <img src="${event.image}" alt="${event.title}" class="event-image">
                    <h2>${event.title}</h2>
                    <div class="event-info">
                        <i class="fas fa-calendar-alt event-icon"></i>
                        <span>${new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div class="event-info">
                        <i class="fas fa-map-marker-alt event-icon"></i>
                        <span>${event.location}</span>
                    </div>
                    <p class="event-description">${event.description}</p>
                    <a href="${event.link}" class="event-link">En savoir plus</a>
                `;
                container.appendChild(eventElement);
            });
        });
});
