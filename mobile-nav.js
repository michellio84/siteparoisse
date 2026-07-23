(function () {
    "use strict";

    const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    const navigation = [
        { label: "Accueil", href: "index.html" },
        { label: "Horaires", href: "horaire.html" },
        { label: "Agenda", href: "agenda.html" },
        { label: "Actualités", href: "actualite.html" },
        { label: "Sacrements", href: "sacrements.html" },
        {
            label: "Vie paroissiale",
            items: [
                { label: "Pôle Jeunes", href: "jeune.html" },
                { label: "Adultes dans la foi", href: "adultes.html" },
                { label: "Solidarité", href: "solidarité.html" },
                { label: "Unité pastorale", href: "unitépastorale.html" }
            ]
        },
        {
            label: "Découvrir",
            items: [
                { label: "Ressources pour la foi", href: "ressources-foi.html" },
                { label: "Galerie", href: "albums.html" },
                { label: "Histoire", href: "histoire.html" },
                { label: "Accompagnement", href: "acompagnement.html" },
                { label: "Services", href: "services.html" }
            ]
        },
        { label: "Contact", href: "contact.html" }
    ];

    const pageLabels = {
        "bapteme.html": "Baptême",
        "benedictions.html": "Bénédictions",
        "communion.html": "Première communion",
        "confirmation.html": "Confirmation",
        "funneraille.html": "Funérailles",
        "mariage.html": "Mariage",
        "onction.html": "Sacrement des malades",
        "reconciliation.html": "Réconciliation",
        "salleparoissiale.html": "Salle paroissiale",
        "article.html": "Actualité",
        "politique-de-confidentialite.html": "Politique de confidentialité"
    };

    const parentPages = {
        "bapteme.html": "sacrements.html",
        "benedictions.html": "sacrements.html",
        "communion.html": "sacrements.html",
        "confirmation.html": "sacrements.html",
        "funneraille.html": "sacrements.html",
        "mariage.html": "sacrements.html",
        "onction.html": "sacrements.html",
        "reconciliation.html": "sacrements.html",
        "salleparoissiale.html": "services.html",
        "article.html": "actualite.html"
    };

    function linkMarkup(item) {
        const active = item.href.toLowerCase() === currentFile || item.href.toLowerCase() === parentPages[currentFile];
        return `<a href="${item.href}"${active ? ' class="active" aria-current="page"' : ""}>${item.label}</a>`;
    }

    function navigationMarkup() {
        return navigation.map((item) => {
            if (!item.items) return linkMarkup(item);
            const active = item.items.some((child) => child.href.toLowerCase() === currentFile || child.href.toLowerCase() === parentPages[currentFile]);
            return `
                <details class="nav-group"${active ? " data-active=\"true\"" : ""}>
                    <summary>${item.label}<i class="fas fa-chevron-down" aria-hidden="true"></i></summary>
                    <div class="nav-submenu">
                        ${item.items.map(linkMarkup).join("")}
                    </div>
                </details>
            `;
        }).join("");
    }

    function buildHeader() {
        const oldBar = document.querySelector(".top-bar");
        if (!oldBar) return;

        const header = document.createElement("header");
        header.className = "site-header";
        header.innerHTML = `
            <div class="site-header-inner">
                <a class="site-brand" href="index.html" aria-label="Accueil de la paroisse Saint-Étienne">
                    <i class="fas fa-church" aria-hidden="true"></i>
                    <span><strong>Paroisse Saint-Étienne</strong><small>Braine-l’Alleud</small></span>
                </a>
                <button class="mobile-menu-toggle" type="button"
                        aria-controls="navigation-principale" aria-expanded="false"
                        aria-label="Ouvrir le menu principal">
                    <span class="mobile-menu-icon" aria-hidden="true"></span>
                </button>
                <nav id="navigation-principale" class="site-navigation" aria-label="Navigation principale">
                    ${navigationMarkup()}
                </nav>
            </div>
        `;
        oldBar.replaceWith(header);
        document.documentElement.classList.add("site-shell-ready");

        const button = header.querySelector(".mobile-menu-toggle");
        const nav = header.querySelector(".site-navigation");

        function closeMenu(restoreFocus) {
            nav.classList.remove("mobile-menu-open");
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", "Ouvrir le menu principal");
            header.querySelectorAll("details[open]").forEach((detail) => detail.removeAttribute("open"));
            if (restoreFocus) button.focus();
        }

        button.addEventListener("click", () => {
            const open = button.getAttribute("aria-expanded") === "true";
            if (open) {
                closeMenu(false);
            } else {
                nav.classList.add("mobile-menu-open");
                button.setAttribute("aria-expanded", "true");
                button.setAttribute("aria-label", "Fermer le menu principal");
            }
        });

        nav.addEventListener("click", (event) => {
            if (event.target.closest("a")) closeMenu(false);
        });

        document.addEventListener("click", (event) => {
            if (!header.contains(event.target)) closeMenu(false);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu(true);
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) closeMenu(false);
        });
    }

    function buildFooter() {
        const oldFooter = document.querySelector("footer");
        if (!oldFooter) return;
        oldFooter.className = "site-footer";
        oldFooter.innerHTML = `
            <div class="site-footer-grid">
                <div class="footer-brand">
                    <i class="fas fa-church" aria-hidden="true"></i>
                    <div><strong>Paroisse Saint-Étienne</strong><span>Braine-l’Alleud</span></div>
                </div>
                <div>
                    <h2>Nous trouver</h2>
                    <address>3 rue Sainte-Anne<br>1420 Braine-l’Alleud</address>
                </div>
                <div>
                    <h2>Nous contacter</h2>
                    <a href="tel:+3223842512">02 384 25 12</a>
                    <a href="mailto:secretariatstetienne@gmail.com">secretariatstetienne@gmail.com</a>
                </div>
                <div>
                    <h2>Liens utiles</h2>
                    <a href="horaire.html">Horaires</a>
                    <a href="agenda.html">Agenda</a>
                    <a href="politique-de-confidentialite.html">Confidentialité</a>
                </div>
            </div>
            <div class="site-footer-bottom">
                <span>© ${new Date().getFullYear()} Paroisse Saint-Étienne</span>
                <span><a href="https://www.cathobel.be/">Cathobel</a> · <a href="https://www.egliseinfo.be">Égliseinfo</a></span>
            </div>
        `;
    }

    function enhanceMainContent() {
        const content = document.querySelector("main, .content");
        if (!content) return;
        if (!content.hasAttribute("role") && content.tagName !== "MAIN") {
            content.setAttribute("role", "main");
        }
        content.id = content.id || "contenu-principal";

        const skip = document.createElement("a");
        skip.className = "skip-link";
        skip.href = `#${content.id}`;
        skip.textContent = "Aller au contenu";
        document.body.prepend(skip);

        if (currentFile !== "index.html" && pageLabels[currentFile]) {
            const breadcrumb = document.createElement("nav");
            breadcrumb.className = "breadcrumb";
            breadcrumb.setAttribute("aria-label", "Fil d’Ariane");
            breadcrumb.innerHTML = `<a href="index.html">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">${pageLabels[currentFile]}</span>`;
            content.prepend(breadcrumb);
        }
    }

    function initialise() {
        buildHeader();
        buildFooter();
        enhanceMainContent();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialise);
    } else {
        initialise();
    }
})();
