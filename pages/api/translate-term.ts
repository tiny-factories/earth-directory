/**
 * GET /api/translate-term?termId=...&locale=es
 *
 * Returns the stored translation for a published term, generating it with
 * Claude on the first request (then cached in TermTranslation forever).
 * Only locales that exist as published Language rows are accepted, which
 * bounds total generation cost to published terms × published languages.
 */
import type { NextApiRequest, NextApiResponse } from "next";
import { getOrCreateTranslation } from "../../lib/translate-term";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const termId = typeof req.query.termId === "string" ? req.query.termId : "";
  const locale = typeof req.query.locale === "string" ? req.query.locale : "";
  if (!termId || !locale) {
    return res.status(400).json({ error: "termId and locale are required" });
  }

  try {
    const translation = await getOrCreateTranslation(termId, locale);
    if (!translation) {
      return res.status(404).json({ error: "No translation available" });
    }
    // Translations are immutable once created, so let the CDN cache them.
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=604800"
    );
    return res.status(200).json({
      translation: {
        locale: translation.locale,
        title: translation.title,
        tldr: translation.tldr,
        definitionKids: translation.definitionKids,
        definitionMedium: translation.definitionMedium,
        definitionScientific: translation.definitionScientific,
        provenance: translation.provenance,
      },
    });
  } catch (err) {
    console.error("translate-term failed", err);
    return res.status(500).json({ error: "Translation failed" });
  }
}
