document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    
    fetch('/content/actualites/index.json')
        .then(response => {
            console.log('Fetch response:', response);
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data);
            const container = document.getElementById('news-container');
            data.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'news-item';
                
                // Structure simplifiée pour afficher uniquement la liste avec titre, date, et description
                articleElement.innerHTML = `
                    <h2><a href="/actualite/${article.slug}.html">${article.title}</a></h2>
                    <p class="date">Publié le ${new Date(article.date).toLocaleDateString()}</p>
                    <p>${article.description}</p>
                `;
                container.appendChild(articleElement);
            });
        })
        .catch(error => console.error('Error loading articles:', error));
});
