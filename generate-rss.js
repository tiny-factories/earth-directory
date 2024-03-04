const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");

// Dummy data; replace this with actual database query to fetch terms
const terms = [
  { id: "1", title: "Term 1", content: "Content 1", updatedAt: new Date() },
  { id: "2", title: "Term 2", content: "Content 2", updatedAt: new Date() },
  // Fetch more terms from your database
];

const siteUrl = "https://earth.directory";
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
	  <title>${term.title}</title>
	  <link>${siteUrl}/terms/${term.id}</link>
	  <description>${term.content}</description>
	  <pubDate>${format(term.updatedAt, "EEE, dd MMM yyyy HH:mm:ss xx")}</pubDate>
	  <guid>${siteUrl}/terms/${term.id}</guid>
	</item>
  `
    )
    .join("")}
</channel>
</rss>
`;

fs.writeFileSync(path.resolve(__dirname, "public", "rss.xml"), rssFeed);
