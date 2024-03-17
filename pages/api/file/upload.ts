// pages/api/file/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get("filename");

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    // Assuming the request body is the file content
    // Note: Make sure you have the correct configuration for parsing the request body as a stream
    const blob = await put(filename, req, {
      access: "public",
    });

    return res.status(200).json(blob);
  } catch (error) {
    // console.error(error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
}

// Make sure to configure bodyParser for file uploads if needed
export const config = {
  api: {
    bodyParser: false,
  },
};
