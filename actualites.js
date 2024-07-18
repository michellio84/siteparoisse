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
                articleElement.innerHTML = `
                    <div class="image-container">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                    <h2>${article.title}</h2>
                    <p class="date">Publié le ${new Date(article.date).toLocaleDateString()}</p>
                    <p>${article.description}</p>
                `;
                container.appendChild(articleElement);

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
        })
        .catch(error => console.error('Error loading articles:', error));
});
