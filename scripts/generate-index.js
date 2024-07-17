const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(process.cwd(), 'content', 'actualites');
const outputFile = path.join(contentDir, 'index.json');

const articles = fs.readdirSync(contentDir)
  .filter(filename => filename.endsWith('.md'))
  .map(filename => {
    const filePath = path.join(contentDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(content);
    return {
      title: data.title,
      date: data.date,
      slug: filename.slice(0, -3), // Remove .md extension
      image: data.image,
      description: data.description
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(outputFile, JSON.stringify(articles, null, 2));
console.log('index.json generated successfully');