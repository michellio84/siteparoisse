(function () {
    "use strict";

    const dateOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" };

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        }[character]));
    }

    async function loadSchedule() {
        const response = await fetch("data/horaires.json");
        if (!response.ok) throw new Error("Horaires indisponibles");
        const data = await response.json();
        const now = new Date();
        const today = data.jours.find((item) => item.index === now.getDay());
        document.getElementById("current-date").textContent = now.toLocaleDateString("fr-BE", dateOptions);
        document.getElementById("opening-hours").textContent = data.ouverture;
        document.getElementById("today-schedule").innerHTML = today && today.celebrations.length
            ? `<h3>${escapeHtml(today.nom)}</h3><ul>${today.celebrations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : "<p>Aucune célébration renseignée aujourd’hui.</p>";
    }

    function eventDate(value) {
        const date = new Date(value);
        date.setHours(23, 59, 59, 999);
        return date;
    }

    function isFeaturedActive(event, now) {
        if (!event.featured) return false;
        if (!event.featured_until) return true;
        return eventDate(event.featured_until) >= now;
    }

    async function loadEvents() {
        const container = document.getElementById("home-events");
        try {
            const response = await fetch("content/agenda/agenda-index.json", { cache: "no-cache" });
            if (!response.ok) throw new Error("Agenda indisponible");
            const now = new Date();
            const events = (await response.json())
                .filter((event) => event && event.title && event.date)
                .filter((event) => eventDate(event.date) >= now || isFeaturedActive(event, now))
                .sort((a, b) => {
                    const aFeatured = isFeaturedActive(a, now);
                    const bFeatured = isFeaturedActive(b, now);
                    if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
                    return new Date(a.date) - new Date(b.date);
                })
                .slice(0, 3);

            if (!events.length) {
                container.innerHTML = '<p class="empty-state">Aucun événement annoncé pour le moment. Consultez bientôt notre agenda.</p>';
                return;
            }

            container.innerHTML = events.map((event) => `
                <article class="home-event-card">
                    ${event.image ? `<img src="${escapeHtml(event.image)}" alt="" loading="lazy">` : '<div class="event-placeholder"><i class="fas fa-calendar-days" aria-hidden="true"></i></div>'}
                    <div class="home-event-body">
                        ${event.featured && eventDate(event.date) < now
                            ? '<span class="featured-label"><i class="fas fa-star" aria-hidden="true"></i> À la une</span>'
                            : `<time datetime="${escapeHtml(event.date)}">${new Date(event.date).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</time>`}
                        <h3>${escapeHtml(event.title)}</h3>
                        ${event.location ? `<p><i class="fas fa-location-dot" aria-hidden="true"></i> ${escapeHtml(event.location)}</p>` : ""}
                        ${event.description ? `<p>${escapeHtml(event.description)}</p>` : ""}
                    </div>
                </article>
            `).join("");
        } catch (error) {
            container.innerHTML = '<p class="empty-state">L’agenda ne peut pas être chargé pour le moment. <a href="agenda.html">Ouvrir l’agenda complet</a>.</p>';
        }
    }

    async function loadAnnouncement() {
        const banner = document.getElementById("announcement-banner");
        try {
            const response = await fetch("content/annonces/message.md", { cache: "no-cache" });
            if (!response.ok) return;
            let message = await response.text();
            const yamlMatch = message.match(/message:\s*["']?([\s\S]*?)["']?\s*$/i);
            if (yamlMatch) message = yamlMatch[1].trim();
            message = message.replace(/^["']|["']$/g, "").trim();
            if (!message) return;
            document.getElementById("announcement-text").textContent = message;
            banner.hidden = false;
        } catch (_) {
            banner.hidden = true;
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        loadSchedule().catch(() => {
            document.getElementById("today-schedule").innerHTML = "<p>Horaires momentanément indisponibles.</p>";
        });
        loadEvents();
        loadAnnouncement();

        if (window.netlifyIdentity) {
            window.netlifyIdentity.on("init", (user) => {
                if (!user) window.netlifyIdentity.on("login", () => { window.location.href = "/admin/"; });
            });
        }
    });
})();
