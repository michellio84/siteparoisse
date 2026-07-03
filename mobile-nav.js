(function () {
    "use strict";

    function initialiseMobileNavigation() {
        const topBar = document.querySelector(".top-bar");
        const nav = topBar && topBar.querySelector("nav");

        if (!topBar || !nav || topBar.querySelector(".mobile-menu-toggle")) {
            return;
        }

        if (!nav.id) {
            nav.id = "navigation-principale";
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "mobile-menu-toggle";
        button.setAttribute("aria-controls", nav.id);
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-label", "Ouvrir le menu principal");
        button.innerHTML = '<span class="mobile-menu-icon" aria-hidden="true"></span>';

        topBar.insertBefore(button, nav);
        document.documentElement.classList.add("mobile-nav-ready");

        function closeMenu(options) {
            const shouldRestoreFocus = options && options.restoreFocus;
            nav.classList.remove("mobile-menu-open");
            button.setAttribute("aria-expanded", "false");
            button.setAttribute("aria-label", "Ouvrir le menu principal");
            if (shouldRestoreFocus) {
                button.focus();
            }
        }

        function openMenu() {
            nav.classList.add("mobile-menu-open");
            button.setAttribute("aria-expanded", "true");
            button.setAttribute("aria-label", "Fermer le menu principal");
        }

        button.addEventListener("click", function () {
            if (button.getAttribute("aria-expanded") === "true") {
                closeMenu();
            } else {
                openMenu();
            }
        });

        nav.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                closeMenu();
            }
        });

        document.addEventListener("click", function (event) {
            if (
                button.getAttribute("aria-expanded") === "true" &&
                !topBar.contains(event.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (
                event.key === "Escape" &&
                button.getAttribute("aria-expanded") === "true"
            ) {
                closeMenu({ restoreFocus: true });
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 768) {
                closeMenu();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialiseMobileNavigation);
    } else {
        initialiseMobileNavigation();
    }
})();
