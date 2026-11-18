const fs = require("node:fs");
const path = require("node:path");

const output = "dist";
const publicDirectories = ["admin", "content", "data", "documents", "images", "public", "static", "vendor"];
const rootAssets = new Set([
    "_headers", "robots.txt", "sitemap.xml", "favicon.svg",
    "AdobeStock_585358337-683x1024.jpeg",
    "affiches-mfp.json", "agenda-mfp.json", "agenda.json", "albums.json", "temoignages-mfp.json",
    "actualites.js", "agenda.js", "albums.js", "home.js", "horaires-page.js",
    "mobile-nav.js", "resources.js", "script.js"
]);

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);

for (const entry of fs.readdirSync(".", { withFileTypes: true })) {
    if (entry.isFile() && (/\.(html|css)$/.test(entry.name) || rootAssets.has(entry.name))) {
        fs.copyFileSync(entry.name, path.join(output, entry.name));
    }
}

for (const directory of publicDirectories) {
    fs.cpSync(directory, path.join(output, directory), {
        recursive: true,
        filter: (source) => !path.basename(source).startsWith(".")
    });
}

fs.mkdirSync(path.join(output, "scripts"));
fs.copyFileSync("scripts/mfp.js", path.join(output, "scripts", "mfp.js"));
