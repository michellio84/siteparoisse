document.addEventListener('DOMContentLoaded', function () {
    const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[character]));

    const validInstagramUrl = (value) => {
        if (!value) return "";
        try {
            const url = new URL(value);
            const hostname = url.hostname.toLowerCase();
            return url.protocol === "https:" && (hostname === "instagram.com" || hostname === "www.instagram.com") ? url.href : "";
        } catch (_) {
            return "";
        }
    };

    fetch('/content/actualites/index.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('news-container');
            data.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'news-item';
                const instagram = validInstagramUrl(article.instagram_url);

                articleElement.innerHTML = `
                    ${article.image ? `
                        ${instagram ? `<a class="news-media instagram-media" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Voir le Reel Instagram : ${escapeHtml(article.title)}">` : ""}
                        <img class="news-image" src="${escapeHtml(article.image)}" alt="" loading="lazy">
                        ${instagram ? '<span class="video-play-badge"><i class="fas fa-play" aria-hidden="true"></i><span>Voir la vidéo</span></span></a>' : ""}
                    ` : ""}
                    <h2><i class="fas fa-file-alt"></i> <a href="article.html?slug=${encodeURIComponent(article.slug)}">${escapeHtml(article.title)}</a></h2>
                    <p class="date">Publié le ${new Date(article.date).toLocaleDateString()}</p>
                    <p>${escapeHtml(article.description)}</p>
                    ${instagram ? `<a class="instagram-link" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram" aria-hidden="true"></i> Voir le Reel sur Instagram</a>` : ""}
                `;
                container.appendChild(articleElement);
            });
        })
        .catch(error => console.error('Error loading articles:', error));
});
