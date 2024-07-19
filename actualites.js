document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    fetch('/content/agenda/agenda-index.json')
        .then(response => {
            console.log('Fetch response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            const container = document.getElementById('events-container');
            data.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event-item';
                eventElement.innerHTML = `
                    <img src="${event.image}" alt="${event.title}">
                    <h2>${event.title}</h2>
                    <div class="event-info">
                        <i class="fas fa-calendar-alt event-icon"></i>
                        <span>${new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    ${event.location ? `
                    <div class="event-info">
                        <i class="fas fa-map-marker-alt event-icon"></i>
                        <span>${event.location}</span>
                    </div>
                    ` : ''}
                    <p class="event-description">${event.description}</p>
                    <a href="#" class="event-link">En savoir plus</a>
                `;
                container.appendChild(eventElement);

                // Fetch the markdown content for each event
                fetch(`/content/agenda/${event.slug}.md`)
                    .then(response => {
                        console.log(`Fetch markdown response for ${event.slug}:`, response);
                        return response.text();
                    })
                    .then(markdown => {
                        console.log(`Markdown content for ${event.slug}:`, markdown);
                        const contentElement = document.createElement('div');
                        contentElement.innerHTML = marked(markdown); // Utilisation d'un parseur Markdown
                        eventElement.appendChild(contentElement);
                    })
                    .catch(error => console.error(`Error loading content for ${event.slug}:`, error));
            });
        })
        .catch(error => console.error('Error loading events:', error));
});