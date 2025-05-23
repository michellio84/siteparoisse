const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(process.cwd(), 'content', 'albums');
const outputDir = path.join(contentDir); // On garde les fichiers à côté des .md

const files = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));

files.forEach(filename => {
  const filePath = path.join(contentDir, filename);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContent);

  const json = {
    title: data.title,
    date: data.date,
    cover: data.cover,
    link: data.link
  };

  const slug = filename.replace(/\.md$/, '');
  const outputPath = path.join(outputDir, `${slug}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
});

console.log('✅ Tous les fichiers albums JSON ont été générés.');
