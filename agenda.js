document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("events-container");
    if (!container) return;

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

    const renderCard = (event) => {
        const instagram = validInstagramUrl(event.instagram_url);
        return `
            <article class="event-item" id="event-${escapeHtml(event.slug)}">
                ${event.image ? `
                    ${instagram ? `<a class="event-media instagram-media" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Voir le Reel Instagram : ${escapeHtml(event.title)}">` : ""}
                    <img src="${escapeHtml(event.image)}" alt="" loading="lazy">
                    ${instagram ? '<span class="video-play-badge"><i class="fas fa-play" aria-hidden="true"></i><span>Voir la vidéo</span></span></a>' : ""}
                ` : ""}
                <div class="event-card-body">
                    <time datetime="${escapeHtml(event.date)}">${new Date(event.date).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</time>
                    <h3>${escapeHtml(event.title)}</h3>
                    ${event.location ? `<p><i class="fas fa-location-dot" aria-hidden="true"></i> ${escapeHtml(event.location)}</p>` : ""}
                    ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}
                    ${instagram ? `<a class="instagram-link" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram" aria-hidden="true"></i> Voir le Reel sur Instagram</a>` : ""}
                    ${event.featured ? '<span class="featured-label"><i class="fas fa-star" aria-hidden="true"></i> À la une</span>' : ""}
                </div>
            </article>
        `;
    };

    try {
        const response = await fetch("/content/agenda/agenda-index.json", { cache: "no-cache" });
        if (!response.ok) throw new Error("Agenda indisponible");
        const events = (await response.json()).filter((event) => event && event.title && event.date);
        const endOfToday = new Date();
        endOfToday.setHours(0, 0, 0, 0);
        const future = events
            .filter((event) => new Date(event.date) >= endOfToday)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const past = events
            .filter((event) => new Date(event.date) < endOfToday)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        container.innerHTML = `
            <section class="agenda-section" aria-labelledby="upcoming-events">
                <h2 id="upcoming-events">À venir</h2>
                <div class="agenda-grid">${future.length ? future.map(renderCard).join("") : '<p class="empty-state">Aucun événement annoncé pour le moment.</p>'}</div>
            </section>
            ${past.length ? `
                <details class="agenda-archive">
                    <summary>Voir les événements passés (${past.length})</summary>
                    <div class="agenda-grid">${past.map(renderCard).join("")}</div>
                </details>
            ` : ""}
        `;

        if (window.location.hash) {
            let targetId = window.location.hash.slice(1);
            try {
                targetId = decodeURIComponent(targetId);
            } catch (_) {
                // Conserve le fragment tel quel s'il n'est pas encodé correctement.
            }

            const target = document.getElementById(targetId);
            if (target) {
                const archive = target.closest("details");
                if (archive) archive.open = true;
                window.requestAnimationFrame(() => {
                    target.scrollIntoView({ block: "start" });
                });
            }
        }
    } catch (error) {
        container.innerHTML = '<p class="empty-state">L’agenda est momentanément indisponible. Merci de réessayer plus tard.</p>';
    }
});
