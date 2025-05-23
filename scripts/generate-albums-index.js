const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '../content/albums');
const outputFile = path.join(contentDir, 'albums-index.json');

const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));

const albums = files.map(filename => {
  const filePath = path.join(contentDir, filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContent);
  return {
    slug: filename.replace(/\.md$/, ''),
    title: data.title,
    date: data.date,
    cover: data.cover,
    link: data.link
  };
});

fs.writeFileSync(outputFile, JSON.stringify(albums, null, 2));
console.log('✅ Fichier albums-index.json généré avec succès.');
