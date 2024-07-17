document.addEventListener('DOMContentLoaded', function () {
    fetch('/content/actualites/index.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('news-container');
            data.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'news-item';
                articleElement.innerHTML = `
                    <h2>${article.title}</h2>
                    <p class="date">Publié le ${new Date(article.date).toLocaleDateString()}</p>
                    <img src="${article.image}" alt="${article.title}">
                    <p>${article.description}</p>
                `;
                container.appendChild(articleElement);
            });
        })
        .catch(error => console.error('Error loading articles:', error));
});
