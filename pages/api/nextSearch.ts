import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

type Data = {
  results: string[];
};

// GET /api/filterPosts?searchString=:searchString
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { searchString } = req.query;
  // console.log("Searching for " + searchString);
  const allUsers = await prisma.term.findMany({
   where: {
     title: {
       search: searchString,
     },
   },
  });
  // console.log(allUsers);

  res.json(allUsers);
}
