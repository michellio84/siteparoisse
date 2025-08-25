document.addEventListener("DOMContentLoaded", async () => {
    const agendaContainer = document.getElementById("agenda-mfp");

    try {
        const response = await fetch("agenda-mfp.json");
        const events = await response.json();

        if (events.length === 0) {
            agendaContainer.innerHTML = "<p>Aucun événement à venir.</p>";
            return;
        }

        // Tri par date (plus proches d'abord)
        events.sort((a, b) => new Date(a.date) - new Date(b.date));

        events.forEach(event => {
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
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            date.innerHTML = `<strong>Date :</strong> ${formattedDate}`;

            const lieu = document.createElement("p");
            if (event.lieu) {
                lieu.innerHTML = `<strong>Lieu :</strong> ${event.lieu}`;
            }

            const description = document.createElement("p");
            description.innerHTML = event.description || "";

            // Affiche de l'événement (facultative)
            if (event.affiche) {
                const img = document.createElement("img");
                img.src = event.affiche;
                img.alt = "Affiche de l'événement";
                img.style.maxWidth = "100%";
                img.style.marginTop = "1em";
                wrapper.appendChild(img);
            }

            wrapper.appendChild(title);
            wrapper.appendChild(date);
            if (event.lieu) wrapper.appendChild(lieu);
            wrapper.appendChild(description);

            agendaContainer.appendChild(wrapper);
        });
    } catch (error) {
        console.error("Erreur lors du chargement de l'agenda MFP :", error);
        agendaContainer.innerHTML = "<p>Impossible de charger les événements.</p>";
    }
});