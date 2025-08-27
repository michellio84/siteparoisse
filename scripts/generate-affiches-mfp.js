const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const inputDir = path.join(__dirname, "../content/mfp/affiches");
const outputFile = path.join(__dirname, "../affiches-mfp.json");

try {
  const affiches = [];

  fs.readdirSync(inputDir).forEach(file => {
    const filePath = path.join(inputDir, file);
    if (file.endsWith(".md")) {
      const content = fs.readFileSync(filePath, "utf8");
      const { data, content: body } = matter(content);

      affiches.push({
        title: data.title || "Sans titre",
        date: data.date || "",
        image: data.image || "",
        description: body.trim()
      });
    }
  });

  // Tri par date décroissante
  affiches.sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync(outputFile, JSON.stringify(affiches, null, 2));
  console.log("✅ Fichier affiches-mfp.json généré avec succès !");
} catch (err) {
  console.error("❌ Erreur lors de la génération des affiches MFP :", err);
}
