(function () {
    "use strict";

    const state = { videos: [], selections: [], sources: [], filter: "all" };
    const latest = document.getElementById("latest-videos");
    const selected = document.getElementById("selected-videos");
    const sourceList = document.getElementById("video-sources");
    const selectionSection = document.getElementById("parish-selection");

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[character]);
    }

    function youtubeId(url) {
        const match = String(url || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);
        return match ? match[1] : "";
    }

    function matchesFilter(item) {
        return state.filter === "all" || item.category === state.filter;
    }

    function videoCard(item) {
        const id = item.videoId || item.id || youtubeId(item.url);
        const thumbnail = item.thumbnail || (id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : "");
        const category = escapeHtml(item.category || "Ressource");
        return `
            <article class="video-card" data-category="${category}">
                ${id ? `
                <button class="video-poster" type="button" data-video-id="${escapeHtml(id)}" aria-label="Lire la vidéo : ${escapeHtml(item.title)}">
                    <img src="${escapeHtml(thumbnail)}" alt="" width="480" height="270" loading="lazy">
                    <span class="play-button" aria-hidden="true"><i class="fas fa-play"></i></span>
                </button>` : ""}
                <div class="video-card-body">
                    <span class="resource-tag">${category}</span>
                    <h3>${escapeHtml(item.title)}</h3>
                    ${item.comment ? `<p>${escapeHtml(item.comment)}</p>` : ""}
                    ${item.sourceTitle || item.channel ? `<small>${escapeHtml(item.sourceTitle || item.channel)}</small>` : ""}
                    <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Voir sur YouTube <span aria-hidden="true">↗</span></a>
                </div>
            </article>`;
    }

    function render() {
        const videos = state.videos.filter(matchesFilter);
        const selections = state.selections.filter(matchesFilter);
        latest.innerHTML = videos.length
            ? videos.map(videoCard).join("")
            : `<div class="empty-state"><i class="fas fa-film" aria-hidden="true"></i><h3>Aucune vidéo dans cette catégorie</h3><p>Consultez les chaînes recommandées ci-dessous ou revenez prochainement.</p></div>`;

        selectionSection.hidden = selections.length === 0;
        selected.innerHTML = selections.map(videoCard).join("");
    }

    function renderSources() {
        sourceList.innerHTML = state.sources.length
            ? state.sources.map((source) => `
                <a class="source-card" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
                    <i class="fab fa-youtube" aria-hidden="true"></i>
                    <span><strong>${escapeHtml(source.title)}</strong><small>${escapeHtml(source.category || source.audience || "Ressources catholiques")}</small></span>
                    <span aria-hidden="true">↗</span>
                </a>`).join("")
            : "<p>Les chaînes recommandées seront bientôt disponibles.</p>";
    }

    document.addEventListener("click", (event) => {
        const poster = event.target.closest(".video-poster");
        if (poster) {
            const id = poster.dataset.videoId;
            const iframe = document.createElement("iframe");
            iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`;
            iframe.title = poster.getAttribute("aria-label").replace(/^Lire la vidéo : /, "");
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            iframe.loading = "lazy";
            poster.replaceWith(iframe);
        }

        const filter = event.target.closest(".filter-button");
        if (filter) {
            state.filter = filter.dataset.filter;
            document.querySelectorAll(".filter-button").forEach((button) => {
                const active = button === filter;
                button.classList.toggle("active", active);
                button.setAttribute("aria-pressed", String(active));
            });
            render();
        }
    });

    Promise.all([
        fetch("data/videos-cache.json").then((response) => response.ok ? response.json() : []),
        fetch("data/video-selections.json").then((response) => response.ok ? response.json() : []),
        fetch("data/video-sources.json").then((response) => response.ok ? response.json() : [])
    ]).then(([videos, selections, sources]) => {
        state.videos = Array.isArray(videos) ? videos : [];
        state.selections = Array.isArray(selections) ? selections.filter((item) => item.visible !== false) : [];
        state.sources = Array.isArray(sources) ? sources.filter((item) => item.visible !== false) : [];
        render();
        renderSources();
    }).catch(() => {
        latest.innerHTML = '<div class="empty-state"><h3>Les vidéos sont momentanément indisponibles</h3><p>Les liens vers les chaînes recommandées restent accessibles ci-dessous.</p></div>';
    });
})();
