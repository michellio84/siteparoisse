const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const inputDir = path.join(__dirname, "../content/mfp/temoignages");
const outputFile = path.join(__dirname, "../temoignages-mfp.json");

function loadTemoignages() {
  const files = fs.readdirSync(inputDir);
  const temoignages = files
    .filter(file => file.endsWith(".md"))
    .map(file => {
      const filePath = path.join(inputDir, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return {
        title: data.title || "",
        date: data.date || null,
        auteur: data.auteur || "",
        extrait: data.extrait || "",
        image: data.image || "",
        video: data.video || "",
        visible: data.visible !== false,
        body: content.trim()
      };
    })
    .filter(item => item.visible) // on garde seulement ceux "visible: true"
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // tri par date décroissante

  return temoignages;
}

function generateJSON() {
  const temoignages = loadTemoignages();
  fs.writeFileSync(outputFile, JSON.stringify(temoignages, null, 2));
  console.log(`✅ Fichier JSON généré : ${outputFile}`);
}

generateJSON();
