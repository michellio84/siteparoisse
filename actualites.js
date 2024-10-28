document.addEventListener('DOMContentLoaded', function () {
    fetch('/content/actualites/index.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('news-container');
            data.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'news-item';
                
                // Structure pour afficher la liste avec un lien cliquable sur le titre pour accéder au contenu complet
                articleElement.innerHTML = `
                    <h2><a href="article.html?slug=${article.slug}">${article.title}</a></h2>
                    <p class="date">Publié le ${new Date(article.date).toLocaleDateString()}</p>
                    <p>${article.description}</p>
                `;
                
                container.appendChild(articleElement);
            });
        })
        .catch(error => console.error('Erreur lors du chargement des articles :', error));
});
