async function loadNews() {
    const newsContainer = document.getElementById('news-container');
    
    try {
        const response = await fetch('/content/actualites/index.json');
        const newsItems = await response.json();

        newsItems.sort((a, b) => new Date(b.date) - new Date(a.date));

        for (const item of newsItems) {
            const articleResponse = await fetch(`/content/actualites/${item.slug}.json`);
            const articleData = await articleResponse.json();

            const article = document.createElement('article');
            article.className = 'news-item';
            
            const title = document.createElement('h2');
            title.textContent = articleData.title;
            
            const date = document.createElement('p');
            date.className = 'date';
            date.textContent = new Date(articleData.date).toLocaleDateString('fr-FR');
            
            const image = document.createElement('img');
            image.src = articleData.image;
            image.alt = articleData.title;
            
            const content = document.createElement('div');
            content.className = 'content';
            content.innerHTML = articleData.body;
            
            article.appendChild(title);
            article.appendChild(date);
            article.appendChild(image);
            article.appendChild(content);
            
            newsContainer.appendChild(article);
        }
    } catch (error) {
        console.error('Erreur lors du chargement des actualités:', error);
        newsContainer.innerHTML = '<p>Impossible de charger les actualités pour le moment.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadNews);