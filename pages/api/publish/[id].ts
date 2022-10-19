import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../lib/prisma";

// PUT /api/publish/:id
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const termId = req.query.id;
  const session = await getSession({ req });

  if (session) {
    const term = await prisma.term.update({
      where: { id: String(termId) },
      data: { published: true },
    });
    res.json(term);
  } else {
    res.status(401).send({ message: "Unauthorized" });
  }
}
