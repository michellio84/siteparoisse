document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    fetch('agenda-index.json')
        .then(response => {
            console.log('Fetch response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            const container = document.getElementById('events-container');
            data.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.innerHTML = `
                    <div class="event-image">
                        <img src="${event.image}" alt="${event.title}" >
                    </div>    
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
                // Fetch the markdown content for each article
                fetch(`/content/actualites/${article.slug}.md`)
                    .then(response => {
                        console.log(`Fetch markdown response for ${article.slug}:`, response);
                        return response.text();
                    })
                    .then(markdown => {
                        console.log(`Markdown content for ${article.slug}:`, markdown);
                        const contentElement = document.createElement('div');
                        contentElement.innerHTML = marked(markdown); // Utilisation d'un parseur Markdown
                        articleElement.appendChild(contentElement);
                    })
                    .catch(error => console.error(`Error loading content for ${article.slug}:`, error));

            });
        });
         .catch(error => console.error('Error loading events:', error));
});
