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

    function validInstagramUrl(value) {
        if (!value) return "";
        try {
            const url = new URL(value);
            const hostname = url.hostname.toLowerCase();
            if (url.protocol !== "https:" || (hostname !== "instagram.com" && hostname !== "www.instagram.com")) return "";
            return url.href;
        } catch (_) {
            return "";
        }
    }

    async function fetchJson(url) {
        const response = await fetch(url, { cache: "no-cache" });
        if (!response.ok) throw new Error(`Contenu indisponible : ${url}`);
        return response.json();
    }

    function mediaMarkup(item) {
        const instagram = validInstagramUrl(item.instagram_url);
        const visual = item.image
            ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy">`
            : `<div class="event-placeholder"><i class="${instagram ? "fab fa-instagram" : "fas fa-calendar-days"}" aria-hidden="true"></i></div>`;

        if (!instagram) return visual;
        return `
            <a class="event-media instagram-media" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer"
               aria-label="Voir le Reel Instagram : ${escapeHtml(item.title)}">
                ${visual}
                <span class="video-play-badge"><i class="fas fa-play" aria-hidden="true"></i><span>Voir la vidéo</span></span>
            </a>
        `;
    }

    async function loadEvents() {
        const container = document.getElementById("home-events");
        try {
            const now = new Date();
            const [agendaResult, newsResult] = await Promise.allSettled([
                fetchJson("content/agenda/agenda-index.json"),
                fetchJson("content/actualites/index.json")
            ]);

            const events = (agendaResult.status === "fulfilled" ? agendaResult.value : [])
                .filter((event) => event && event.title && event.date)
                .filter((event) => eventDate(event.date) >= now || isFeaturedActive(event, now))
                .map((event) => ({ ...event, content_type: "event" }));

            const news = (newsResult.status === "fulfilled" ? newsResult.value : [])
                .filter((article) => article && article.title && article.date && isFeaturedActive(article, now))
                .map((article) => ({
                    ...article,
                    content_type: "news",
                    detail_url: `article.html?slug=${encodeURIComponent(article.slug)}`
                }));

            const items = [...events, ...news]
                .sort((a, b) => {
                    const aFeatured = isFeaturedActive(a, now);
                    const bFeatured = isFeaturedActive(b, now);
                    if (aFeatured !== bFeatured) return aFeatured ? -1 : 1;
                    if (aFeatured && bFeatured) return new Date(b.date) - new Date(a.date);
                    return new Date(a.date) - new Date(b.date);
                })
                .slice(0, 3);

            if (!items.length) {
                container.innerHTML = '<p class="empty-state">Aucun contenu à la une pour le moment. Consultez bientôt notre agenda et nos actualités.</p>';
                return;
            }

            container.innerHTML = items.map((item) => {
                const instagram = validInstagramUrl(item.instagram_url);
                const isPastFeatured = isFeaturedActive(item, now) && eventDate(item.date) < now;
                return `
                    <article class="home-event-card">
                        ${mediaMarkup(item)}
                        <div class="home-event-body">
                            <span class="content-type-label">${item.content_type === "news" ? "Actualité" : "Événement"}</span>
                            ${isPastFeatured
                                ? '<span class="featured-label"><i class="fas fa-star" aria-hidden="true"></i> À la une</span>'
                                : `<time datetime="${escapeHtml(item.date)}">${new Date(item.date).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" })}</time>`}
                            <h3>${item.detail_url ? `<a href="${escapeHtml(item.detail_url)}">${escapeHtml(item.title)}</a>` : escapeHtml(item.title)}</h3>
                            ${item.location ? `<p><i class="fas fa-location-dot" aria-hidden="true"></i> ${escapeHtml(item.location)}</p>` : ""}
                            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                            ${instagram ? `<a class="instagram-link" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer"><i class="fab fa-instagram" aria-hidden="true"></i> Voir le Reel sur Instagram</a>` : ""}
                        </div>
                    </article>
                `;
            }).join("");
        } catch (error) {
            container.innerHTML = '<p class="empty-state">Les contenus à la une ne peuvent pas être chargés pour le moment. <a href="agenda.html">Ouvrir l’agenda</a>.</p>';
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
