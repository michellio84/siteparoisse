document.addEventListener("DOMContentLoaded", async () => {
  // Chargement de l'agenda MFP
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

          const lieu = document.createElement("p");
          if (event.lieu) {
            lieu.innerHTML = `<strong>Lieu :</strong> ${event.lieu}`;
          }

          const description = document.createElement("p");
          description.innerHTML = event.description || "";

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
    }
  } catch (err) {
    console.error("Erreur lors du chargement de l'agenda MFP :", err);
    agendaContainer.innerHTML = "<p>Impossible de charger les événements.</p>";
  }

  // Chargement des affiches MFP
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
        img.alt = affiche.title;
        img.style.width = "100%";
        img.style.borderRadius = "5px";

        const title = document.createElement("h3");
        title.textContent = affiche.title;

        const date = new Date(affiche.date).toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });

        const dateEl = document.createElement("p");
        dateEl.innerHTML = `<strong>Date :</strong> ${date}`;

        const desc = document.createElement("p");
        desc.textContent = affiche.description;

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
});
