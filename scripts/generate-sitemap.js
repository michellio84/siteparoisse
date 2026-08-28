const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const excludedPages = new Set(["404.html", "article.html"]);
const pages = fs
  .readdirSync(root)
  .filter((file) => file.endsWith(".html") && !excludedPages.has(file))
  .sort((a, b) => {
    if (a === "index.html") return -1;
    if (b === "index.html") return 1;
    return a.localeCompare(b, "fr");
  });

const urls = pages.map((file) => {
  const pathname = file === "index.html" ? "/" : `/${encodeURI(file)}`;
  return `  <url><loc>https://paroissesaintetienne.be${pathname}</loc></url>`;
});

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join("\n");

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);
