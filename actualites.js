async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    
    try {
        const response = await fetch('/content/actualites/index.json');
        const newsItems = await response.json();

        newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        newsItems.forEach(item => {
            const article = document.createElement('article');
            article.className = 'news-item';
            
            const title = document.createElement('h2');
            title.textContent = item.title;
            
            const date = document.createElement('p');
            date.className = 'date';
            date.textContent = new Date(item.date).toLocaleDateString('fr-FR');
            
            const image = document.createElement('img');
            image.src = item.image;
            image.alt = item.title;
            
            const content = document.createElement('div');
            content.className = 'content';
            content.innerHTML = item.body;
            
            article.appendChild(title);
            article.appendChild(date);
            article.appendChild(image);
            article.appendChild(content);
            
            newsContainer.appendChild(article);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        newsContainer.innerHTML = '<p>Impossible de charger les actualités pour le moment.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadNews);
