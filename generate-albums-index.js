const fs = require("fs");
const path = require("path");
const matter = require("gray-matter"); // Nécessite 'gray-matter'

try {
  const inputDir = path.join(__dirname, "content/albums");
  const outputFile = path.join(__dirname, "albums.json");

  const albums = [];

  fs.readdirSync(inputDir).forEach(file => {
    const filePath = path.join(inputDir, file);
    if (file.endsWith(".md")) {
      const content = fs.readFileSync(filePath, "utf8");
      const { data } = matter(content);

      albums.push({
        slug: path.basename(file, ".md"),
        title: data.title || "Sans titre",
        date: data.date || "",
        link: data.link || "#",
        cover: data.cover || "images/default.jpg"
      });
    }
  });

  fs.writeFileSync(outputFile, JSON.stringify(albums, null, 2));
  console.log("✅ Fichier albums.json généré !");
} catch (err) {
  console.error("❌ Erreur pendant la génération des albums :", err);
  process.exit(1);
}
