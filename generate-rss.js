const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const siteUrl = "https://earth.directory";

function escapeXML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function generateRssFeed() {
  const terms = await prisma.term.findMany({
    where: {
      published: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const rssFeed = `
  <rss version="2.0">
  <channel>
    <title>Earth Directory</title>
    <link>${siteUrl}</link>
    <description>Latest updated terms</description>
    <language>en-us</language>
    ${terms
      .map(
        (term) => `
      <item>
        <title>${escapeXML(term.title)}</title>
        <link>${siteUrl}/terms/${term.id}</link>
        <description>${escapeXML(term.content)}</description>
        <pubDate>${format(
          term.updatedAt,
          "EEE, dd MMM yyyy HH:mm:ss xx"
        )}</pubDate>
        <guid>${siteUrl}/terms/${term.id}</guid>
      </item>
    `
      )
      .join("")}
  </channel>
  </rss>
  `;

  fs.writeFileSync(path.resolve(__dirname, "./public", "rss.xml"), rssFeed);
}

generateRssFeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
