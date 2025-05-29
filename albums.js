document.addEventListener("DOMContentLoaded", function () {
    fetch("albums.json")
        .then(response => response.json())
        .then(albums => {
            const container = document.getElementById("albums-container");

            albums.forEach(album => {
                const card = document.createElement("div");
                card.className = "album-card";
                card.style.border = "1px solid #ccc";
                card.style.borderRadius = "10px";
                card.style.overflow = "hidden";
                card.style.width = "300px";
                card.style.boxShadow = "2px 2px 10px rgba(0,0,0,0.1)";
                card.style.textAlign = "center";
                card.style.backgroundColor = "#fff";

                const img = document.createElement("img");
                img.src = album.cover;
                img.alt = album.title;
                img.style.width = "100%";
                img.style.height = "200px";
                img.style.objectFit = "cover";

                const title = document.createElement("h3");
                title.textContent = album.title;
                title.style.padding = "10px";

                const button = document.createElement("a");
                button.href = album.link;
                button.target = "_blank";
                button.textContent = "Voir l'album";
                button.style.display = "inline-block";
                button.style.margin = "10px";
                button.style.padding = "10px 20px";
                button.style.backgroundColor = "#8B7260";
                button.style.color = "#fff";
                button.style.borderRadius = "5px";
                button.style.textDecoration = "none";

                card.appendChild(img);
                card.appendChild(title);
                card.appendChild(button);

                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erreur lors du chargement des albums :", error);
            const container = document.getElementById("albums-container");
            container.innerHTML = "<p>Impossible de charger les albums pour le moment.</p>";
        });
});
