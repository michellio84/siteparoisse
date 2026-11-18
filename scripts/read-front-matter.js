const matter = require("gray-matter");

module.exports = function readFrontMatter(content) {
    const openingLine = content.replace(/^\uFEFF/, "").split("\n", 1)[0];
    if (openingLine.startsWith("---") && !openingLine.startsWith("----")) {
        const language = openingLine.slice(3).trim().toLowerCase();
        if (language && language !== "yaml" && language !== "yml") {
            throw new Error("Les métadonnées Markdown doivent être au format YAML.");
        }
    }

    return matter(content);
};
