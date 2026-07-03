document.addEventListener("DOMContentLoaded", async function () {
    const container = document.getElementById("events-container");
    if (!container) return;

    const escapeHtml = (value) => String(value || "").replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[character]));

    const renderCard = (event) => `
        <article class="event-item">
            ${event.image ? `<img src="${escapeHtml(event.image)}" alt="" loading="lazy">` : ""}
            <div class="event-card-body">
                <time datetime="${escapeHtml(event.date)}">${new Date(event.date).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</time>
                <h3>${escapeHtml(event.title)}</h3>
                ${event.location ? `<p><i class="fas fa-location-dot" aria-hidden="true"></i> ${escapeHtml(event.location)}</p>` : ""}
                ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}
                ${event.featured ? '<span class="featured-label"><i class="fas fa-star" aria-hidden="true"></i> À la une</span>' : ""}
            </div>
        </article>
    `;

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
    } catch (error) {
        container.innerHTML = '<p class="empty-state">L’agenda est momentanément indisponible. Merci de réessayer plus tard.</p>';
    }
});
