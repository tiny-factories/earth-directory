const fs = require("fs");
const path = require("path");
// Use fetch or any preferred method to get your data
// For demonstration, we'll assume static paths
const pages = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.8 },
  // Add more pages or fetch dynamically
];

function escapeXML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const sitemap = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map(
      (page) => `
    <url>
      <loc>${escapeXML(`https://earth.directory${page.path}`)}</loc>
      <changefreq>${escapeXML(page.changefreq)}</changefreq>
      <priority>${page.priority}</priority>
    </url>
  `
    )
    .join("")}
</urlset>
`;

fs.writeFileSync(
  path.resolve(__dirname, "public", "sitemap.xml"),
  sitemap.trim()
);
