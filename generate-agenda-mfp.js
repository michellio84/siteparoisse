const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const inputDir = path.join(__dirname, "content/mfp/agenda");
const outputFile = path.join(__dirname, "agenda-mfp.json");

try {
    const events = [];

    fs.readdirSync(inputDir).forEach(file => {
        const filePath = path.join(inputDir, file);
        if (file.endsWith(".md")) {
            const content = fs.readFileSync(filePath, "utf8");
            const { data, content: bodyContent } = matter(content);

            events.push({
                title: data.title || "Sans titre",
                date: data.date || "",
                lieu: data.lieu || "",
                affiche: data.affiche || "",
                description: bodyContent.trim()
            });
        }
    });

    fs.writeFileSync(outputFile, JSON.stringify(events, null, 2));
    console.log("✅ Fichier agenda-mfp.json généré avec succès !");
} catch (err) {
    console.error("❌ Erreur lors de la génération de agenda-mfp.json :", err);
}