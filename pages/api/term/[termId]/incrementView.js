// pages/api/terms/[termId]/incrementView.js

import prisma from "../../../lib/prisma"; // Adjust the import path to your setup

export default async function handler(req, res) {
  const termId = req.query.termId;

  if (req.method === "POST") {
    try {
      await prisma.term.update({
        where: {
          id: termId,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
      res.status(200).json({ message: "View count incremented" });
    } catch (error) {
      res.status(500).json({ error: "Error incrementing view count" });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
