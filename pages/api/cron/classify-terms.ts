/**
 * Cron endpoint: classifies terms that have null termType (unclassified).
 * Intended to run weekly. Secured by CRON_SECRET (Bearer token).
 *
 * POST /api/cron/classify-terms
 * Header: Authorization: Bearer <CRON_SECRET>
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { runClassifyTerms } from "../../../lib/classify-terms";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      success: false,
      error: "ANTHROPIC_API_KEY not configured",
    });
  }

  try {
    const result = await runClassifyTerms({
      onlyNullType: true,
      dryRun: false,
      prisma,
      delayMs: 400,
      log: (msg) => console.log(`[cron/classify-terms] ${msg}`),
    });

    return res.status(200).json({
      success: true,
      processed: result.processed,
      updated: result.updated,
      errors: result.errors,
    });
  } catch (err) {
    console.error("[cron/classify-terms]", err);
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Classification failed",
    });
  }
}
