document.addEventListener("DOMContentLoaded", async function () {
    const content = document.querySelector(".content");
    if (!content) return;
    const existingSchedules = content.querySelectorAll(".schedule");

    try {
        const response = await fetch("data/horaires.json");
        if (!response.ok) throw new Error("Horaires indisponibles");
        const data = await response.json();
        existingSchedules.forEach((element) => element.remove());

        const opening = document.createElement("aside");
        opening.className = "hours-opening";
        opening.innerHTML = `<i class="fas fa-door-open" aria-hidden="true"></i><div><strong>Ouverture de l’église</strong><span>${data.ouverture}</span></div>`;
        content.appendChild(opening);

        const grid = document.createElement("div");
        grid.className = "hours-grid";
        grid.innerHTML = data.jours.map((day) => `
            <section class="schedule">
                <h2>${day.nom}</h2>
                <ul>${day.celebrations.map((item) => `<li>${item}</li>`).join("")}</ul>
            </section>
        `).join("");
        content.appendChild(grid);
    } catch (_) {
        /* Les horaires HTML existants restent visibles comme solution de secours. */
    }
});
