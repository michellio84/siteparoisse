// --- Utilitaires ---
function formatFR(d, withTime = false) {
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
  });
}

// Rendu Markdown simple + nettoyage des backslashes imprimés
function mdToHtml(md) {
  if (!md) return "";
  md = String(md).replace(/\r\n/g, "\n");

  // backslash + saut de ligne -> <br>
  md = md.replace(/\\\s*\n/g, "<br>");

  // supprimer les backslashes d’échappement visibles (\! \? \’ \*)
  md = md.replace(/\\([\\`*_{}\[\]()#+\-.!'"?:;])/g, "$1");

  // gras / italique
  md = md.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  md = md.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<em>$2</em>");

  // blockquotes
  md = md.replace(/^>\s?(.*)$/gm, "<blockquote>$1</blockquote>");

  // liens [texte](url)
  md = md.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // paragraphes (double saut de ligne) + <br> sur les lignes simples
  md = md
    .split(/\n{2,}/)
    .map(p => "<p>" + p.replace(/\n/g, "<br>") + "</p>")
    .join("");

  return md;
}

document.addEventListener("DOMContentLoaded", async () => {
  // === Chargement de l'agenda MFP (inchangé) ===
  const agendaContainer = document.getElementById("agenda-mfp");

  try {
    const response = await fetch("agenda-mfp.json");
    const events = await response.json();

    if (events.length === 0) {
      agendaContainer.innerHTML = "<p>Aucun événement à venir.</p>";
    } else {
      events
        .filter(e => e.title && e.date)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(event => {
          const wrapper = document.createElement("div");
          wrapper.style.border = "1px solid #ccc";
          wrapper.style.borderRadius = "8px";
          wrapper.style.padding = "1em";
          wrapper.style.marginBottom = "1.5em";
          wrapper.style.backgroundColor = "#fff";

          const title = document.createElement("h3");
          title.textContent = event.title;

          const date = document.createElement("p");
          const formattedDate = new Date(event.date).toLocaleString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          date.innerHTML = `<strong>Date :</strong> ${formattedDate}`;

          if (event.lieu) {
            const lieu = document.createElement("p");
            lieu.innerHTML = `<strong>Lieu :</strong> ${event.lieu}`;
            wrapper.appendChild(lieu);
          }

          const description = document.createElement("p");
          description.innerHTML = event.description || "";

          wrapper.appendChild(title);
          wrapper.appendChild(date);
          wrapper.appendChild(description);

          if (event.affiche) {
            const img = document.createElement("img");
            img.src = event.affiche;
            img.alt = "Affiche de l'événement";
            img.loading = "lazy";
            img.className = "media-spaced lazy-img";
            img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
            img.style.maxWidth = "100%";
            img.style.marginTop = "1em";
            wrapper.appendChild(img);
          }

          agendaContainer.appendChild(wrapper);
        });
    }
  } catch (err) {
    console.error("Erreur lors du chargement de l'agenda MFP :", err);
    agendaContainer.innerHTML = "<p>Impossible de charger les événements.</p>";
  }

  // === Chargement des affiches MFP (inchangé, ajout lazy) ===
  const affichesContainer = document.getElementById("affiches-mfp");

  try {
    const res = await fetch("affiches-mfp.json");
    const affiches = await res.json();

    if (affiches.length === 0) {
      affichesContainer.innerHTML = "<p>Aucune affiche disponible pour le moment.</p>";
    } else {
      affiches.forEach(affiche => {
        const card = document.createElement("div");
        card.style.border = "1px solid #ccc";
        card.style.borderRadius = "8px";
        card.style.padding = "1em";
        card.style.marginBottom = "1.5em";
        card.style.backgroundColor = "#fff";

        const img = document.createElement("img");
        img.src = affiche.image;
        img.alt = affiche.title || "";
        img.loading = "lazy";
        img.className = "media-spaced lazy-img";
        img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
        img.style.width = "100%";
        img.style.borderRadius = "5px";

        const title = document.createElement("h3");
        title.textContent = affiche.title || "";

        const date = affiche.date
          ? new Date(affiche.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })
          : "";

        const dateEl = document.createElement("p");
        dateEl.innerHTML = date ? `<strong>Date :</strong> ${date}` : "";

        const desc = document.createElement("p");
        desc.innerHTML = affiche.body || "";

        card.appendChild(img);
        card.appendChild(title);
        card.appendChild(dateEl);
        card.appendChild(desc);

        affichesContainer.appendChild(card);
      });
    }
  } catch (error) {
    console.error("Erreur lors du chargement des affiches :", error);
    affichesContainer.innerHTML = "<p>Impossible de charger les affiches.</p>";
  }

  // === Chargement des témoignages MFP (markdown + lire plus + lazy) ===
  const temoignagesContainer = document.getElementById("temoignages-mfp");

  try {
    const res = await fetch("temoignages-mfp.json");
    const temoignages = await res.json();

    if (!Array.isArray(temoignages) || temoignages.length === 0) {
      temoignagesContainer.innerHTML = "<p>Aucun témoignage disponible pour le moment.</p>";
    } else {
      temoignages.forEach(t => {
        const article = document.createElement("article");
        article.style.borderBottom = "1px solid #ccc";
        article.style.padding = "1em 0";

        const title = document.createElement("h3");
        title.textContent = t.title || "";
        article.appendChild(title);

        const meta = document.createElement("p");
        meta.className = "meta";
        const formattedDate = t.date ? formatFR(t.date) : "";
        meta.innerHTML = `📅 ${formattedDate}${t.auteur ? " — ✍️ " + t.auteur : ""}`;
        meta.style.fontSize = "0.9em";
        meta.style.color = "#555";
        article.appendChild(meta);

        if (t.image) {
          const img = document.createElement("img");
          img.src = t.image;
          img.alt = t.title || "";
          img.loading = "lazy";
          img.className = "media-spaced lazy-img";
          img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
          img.style.maxWidth = "100%";
          img.style.margin = "1em 0";
          article.appendChild(img);
        }

        if (t.extrait) {
          const extrait = document.createElement("p");
          extrait.innerHTML = `<em>${t.extrait}</em>`;
          article.appendChild(extrait);
        }

        // Corps en Markdown -> HTML
        const body = document.createElement("div");
        body.className = "tmj-body";
        body.innerHTML = mdToHtml(t.body || "");
        article.appendChild(body);

        // Bouton Lire plus / Lire moins si texte long
        const longEnough =
          (body.textContent || "").trim().length > 350 ||
          body.querySelectorAll("p").length >= 3;

        let toggleBtn = null;
        if (longEnough) {
          body.classList.add("is-collapsed");
          toggleBtn = document.createElement("button");
          toggleBtn.className = "toggle-more";
          toggleBtn.type = "button";
          toggleBtn.textContent = "Lire plus";
          toggleBtn.addEventListener("click", () => {
            const collapsed = body.classList.toggle("is-collapsed");
            toggleBtn.textContent = collapsed ? "Lire plus" : "Lire moins";
          });
        }

        if (t.video) {
          const videoLink = document.createElement("p");
          videoLink.innerHTML = `<a href="${t.video}" target="_blank" rel="noopener">🎥 Voir la vidéo</a>`;
          article.appendChild(videoLink);
          if (toggleBtn) article.insertBefore(toggleBtn, videoLink);
        } else if (toggleBtn) {
          article.appendChild(toggleBtn);
        }

        temoignagesContainer.appendChild(article);
      });
    }
  } catch (error) {
    console.error("Erreur lors du chargement des témoignages :", error);
    temoignagesContainer.innerHTML = "<p>Impossible de charger les témoignages.</p>";
  }
});
