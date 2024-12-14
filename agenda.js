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
                    <div class="event-info">
                        <i class="fas fa-map-marker-alt event-icon"></i>
                        <span>${event.location}</span>
                    </div>
                    <p class="event-description"><em>${event.description}</em></p>
                `;
                container.appendChild(eventElement);
            });
        })
        .catch(error => console.error('Error loading events:', error));
});
