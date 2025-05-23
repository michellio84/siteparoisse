fetch('/content/albums/albums-index.json')
  .then(res => res.json())
  .then(albums => {
    const container = document.getElementById('album-grid');
    albums.forEach(album => {
      const card = document.createElement('div');
      card.className = 'album-card';
      card.innerHTML = `
        <img class="album-preview" src="${album.cover}" alt="Image de couverture">
        <div class="album-title">${album.title}</div>
        <div class="album-date">${new Date(album.date).toLocaleDateString('fr-FR')}</div>
        <a class="album-button" href="album.html?slug=${album.slug}">Voir l’album</a>
      `;
      container.appendChild(card);
    });
  })
  .catch(err => {
    document.getElementById('album-grid').innerHTML = '<p>Impossible de charger les albums.</p>';
    console.error(err);
  });
