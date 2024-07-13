document.addEventListener("DOMContentLoaded", function() {
    const jours = [
        "dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"
    ];

    const horaires = {
        "lundi": "Messe à 9h précédée des Laudes à 8h30.",
        "mardi": "Messe à 9h précédée des Laudes à 8h30.",
        "mercredi": "Laudes à 8h30 suivies de la messe (9h00) et de l’adoration du St Sacrement jusqu’à 10h30. Réconciliation après la messe.",
        "jeudi": "Messe à 9h précédée des Laudes à 8h30.",
        "vendredi": "Laudes à 8h30 suivies de la messe (9h00) et de l’adoration du St Sacrement jusqu’à 10h30. Réconciliation après la messe.",
        "samedi": "Laudes à 8h30, Messe à 18h.",
        "dimanche": "Messe des familles à 10h30."
    };

    const today = new Date();
    const dayName = jours[today.getDay()];
    const horairesDuJour = document.getElementById("horaires-du-jour");

    if (horaires[dayName]) {
        horairesDuJour.textContent = horaires[dayName];
    } else {
        horairesDuJour.textContent = "Aucun horaire disponible pour aujourd'hui.";
    }
});
