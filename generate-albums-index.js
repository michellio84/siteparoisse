const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "content/albums");
const outputFile = path.join(__dirname, "albums.json");

const albums = [];

fs.readdirSync(inputDir).forEach(file => {
  const filePath = path.join(inputDir, file);
  if (file.endsWith(".json")) {
    const content = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(content);

    // Ajouter uniquement les champs utiles
    albums.push({
      slug: path.basename(file, ".json"),
      title: data.title || "Sans titre",
      date: data.date || "",
      link: data.link || "#",
      cover: data.cover || "images/default.jpg"
    });
  }
});

fs.writeFileSync(outputFile, JSON.stringify(albums, null, 2));
console.log("✅ Fichier albums.json généré !");
