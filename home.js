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
        return item.image
            ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy">`
            : `<div class="event-placeholder"><i class="${instagram ? "fab fa-instagram" : "fas fa-calendar-days"}" aria-hidden="true"></i></div>`;
    }

    function formatDate(value) {
        return new Date(value).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric" });
    }

    function renderAgendaCard(item, now) {
        const instagram = validInstagramUrl(item.instagram_url);
        const isPastFeatured = eventDate(item.date) < now;
        return `
            <article class="home-event-card">
                <span class="home-card-media">
                    <a class="home-poster-link" href="${escapeHtml(item.detail_url)}" aria-label="${escapeHtml(item.title)}">
                        ${mediaMarkup(item)}
                    </a>
                    ${instagram ? `<a class="video-play-badge" href="${escapeHtml(instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Voir la vidéo Instagram : ${escapeHtml(item.title)}"><i class="fab fa-instagram" aria-hidden="true"></i><span>Vidéo disponible</span></a>` : ""}
                </span>
                <a class="home-card-link" href="${escapeHtml(item.detail_url)}" aria-label="${escapeHtml(item.title)}">
                    <span class="home-event-body">
                        <span class="content-type-label">Événement</span>
                        ${isPastFeatured
                            ? '<span class="featured-label"><i class="fas fa-star" aria-hidden="true"></i> À la une</span>'
                            : `<time datetime="${escapeHtml(item.date)}">${formatDate(item.date)}</time>`}
                        <h3>${escapeHtml(item.title)}</h3>
                        <span class="home-card-cta">Voir dans l’agenda <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                    </span>
                </a>
            </article>
        `;
    }

    function renderNewsCard(item) {
        return `
            <article class="home-news-card">
                <a href="${escapeHtml(item.detail_url)}" aria-label="Lire l’actualité : ${escapeHtml(item.title)}">
                    <span class="content-type-label">Actualité</span>
                    <time datetime="${escapeHtml(item.date)}">${formatDate(item.date)}</time>
                    <h3>${escapeHtml(item.title)}</h3>
                    <span class="home-card-cta">Lire l’actualité <i class="fas fa-arrow-right" aria-hidden="true"></i></span>
                </a>
            </article>
        `;
    }

    async function loadEvents() {
        const agendaContainer = document.getElementById("home-agenda");
        const newsContainer = document.getElementById("home-news");
        try {
            const now = new Date();
            const [agendaResult, newsResult] = await Promise.allSettled([
                fetchJson("content/agenda/agenda-index.json"),
                fetchJson("content/actualites/index.json")
            ]);

            const events = (agendaResult.status === "fulfilled" ? agendaResult.value : [])
                .filter((event) => event && event.title && event.date)
                .filter((event) => event.image && isFeaturedActive(event, now))
                .map((event) => ({
                    ...event,
                    detail_url: `agenda.html#event-${encodeURIComponent(event.slug)}`
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);

            const news = (newsResult.status === "fulfilled" ? newsResult.value : [])
                .filter((article) => article && article.title && article.date && isFeaturedActive(article, now))
                .map((article) => ({
                    ...article,
                    detail_url: `article.html?slug=${encodeURIComponent(article.slug)}`
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);

            agendaContainer.innerHTML = events.length
                ? events.map((item) => renderAgendaCard(item, now)).join("")
                : '<p class="empty-state">Aucun événement n’est actuellement mis en avant. <a href="agenda.html">Consulter l’agenda</a>.</p>';

            newsContainer.classList.remove("news-count-1", "news-count-2", "news-count-3");
            if (news.length) newsContainer.classList.add(`news-count-${news.length}`);
            newsContainer.innerHTML = news.length
                ? news.map(renderNewsCard).join("")
                : '<p class="empty-state">Aucune actualité n’est actuellement mise en avant. <a href="actualite.html">Voir les actualités</a>.</p>';
        } catch (error) {
            agendaContainer.innerHTML = '<p class="empty-state">L’agenda ne peut pas être chargé pour le moment.</p>';
            newsContainer.innerHTML = '<p class="empty-state">Les actualités ne peuvent pas être chargées pour le moment.</p>';
        }
    }

    function validVideoUrl(value) {
        if (!value) return "";
        try {
            const url = new URL(value, window.location.href);
            if (url.origin !== window.location.origin || !/\.mp4$/i.test(url.pathname)) return "";
            return url.href;
        } catch (_) {
            return "";
        }
    }

    let webTvLoaded = false;

    async function loadWebTv() {
        if (webTvLoaded || !window.matchMedia("(min-width: 901px)").matches) return;

        try {
            const data = await fetchJson("content/web-tv.json");
            const videoUrl = validVideoUrl(data.video);
            const instagramUrl = validInstagramUrl(data.instagram_url);
            if (!videoUrl || !instagramUrl) return;

            const section = document.getElementById("web-tv-section");
            const link = document.getElementById("web-tv-link");
            const video = document.getElementById("web-tv-video");

            webTvLoaded = true;
            link.href = instagramUrl;
            video.src = videoUrl;
            section.hidden = false;

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        video.play().catch(() => {});
                    } else {
                        video.pause();
                    }
                });
            }, { threshold: 0.35 });

            observer.observe(section);
        } catch (_) {
            document.getElementById("web-tv-section").hidden = true;
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
        loadWebTv();
        loadAnnouncement();

        const desktopMedia = window.matchMedia("(min-width: 901px)");
        desktopMedia.addEventListener("change", (event) => {
            const video = document.getElementById("web-tv-video");
            if (event.matches) loadWebTv();
            else if (video) video.pause();
        });

        if (window.netlifyIdentity) {
            window.netlifyIdentity.on("init", (user) => {
                if (!user) window.netlifyIdentity.on("login", () => { window.location.href = "/admin/"; });
            });
        }
    });
})();
