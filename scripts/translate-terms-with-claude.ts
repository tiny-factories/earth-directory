/**
 * Bulk-translate terms with Claude (Opus 5) into the published languages.
 * Fills in TermTranslation rows that don't exist yet; never overwrites
 * existing translations (so human-reviewed rows survive re-runs).
 *
 * Usage:
 *   npm run translate-terms                        # all published terms × all published languages
 *   npm run translate-terms -- --locales=es,fr     # only these locales
 *   npm run translate-terms -- --limit=10          # pilot run (per locale)
 *   npm run translate-terms -- --dry-run           # list what would be translated, no API calls
 */
import path from "path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import Anthropic from "@anthropic-ai/sdk";
import prisma from "../lib/prisma";
import {
  createTranslation,
  TRANSLATABLE_TERM_SELECT,
  TranslatableTerm,
} from "../lib/translate-term";

const CONCURRENCY = 4;

async function main() {
  const dryRun = process.argv.indexOf("--dry-run") !== -1;
  const limitArg = process.argv.filter((a) => a.indexOf("--limit=") === 0)[0];
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;
  const localesArg = process.argv.filter((a) => a.indexOf("--locales=") === 0)[0];
  const wantedLocales = localesArg
    ? localesArg
        .split("=")[1]
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean)
    : null;

  const languages = (
    await prisma.language.findMany({
      where: { published: true, i18n: { not: null } },
      select: { i18n: true, title: true },
      orderBy: { title: "asc" },
    })
  ).filter(
    (l): l is { i18n: string; title: string } =>
      !!l.i18n && l.i18n !== "en" && (!wantedLocales || wantedLocales.indexOf(l.i18n) !== -1)
  );
  if (languages.length === 0) {
    console.log(
      "No matching published languages. Seed Language rows first (npm run db:seed) or check --locales."
    );
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey && !dryRun) throw new Error("Missing ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey: apiKey ?? "dry-run" });

  for (const language of languages) {
    const missing: TranslatableTerm[] = await prisma.term.findMany({
      where: {
        published: true,
        translations: { none: { locale: language.i18n } },
      },
      select: TRANSLATABLE_TERM_SELECT,
      orderBy: { title: "asc" },
      ...(limit ? { take: limit } : {}),
    });

    console.log(
      `\n${language.title} (${language.i18n}): ${missing.length} term(s) to translate${
        dryRun ? " [dry run]" : ""
      }`
    );
    if (dryRun || missing.length === 0) {
      if (dryRun) missing.forEach((t) => console.log(`  would translate: ${t.title}`));
      continue;
    }

    let done = 0;
    let failed = 0;
    const queue = missing.slice();
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      for (;;) {
        const term = queue.shift();
        if (!term) return;
        try {
          const row = await createTranslation(anthropic, term, language);
          done++;
          console.log(
            `  [${done + failed}/${missing.length}] ${term.title}: ${
              row ? `→ ${row.title}` : "skipped (no usable response)"
            }`
          );
        } catch (err) {
          failed++;
          console.error(`  ${term.title}: failed —`, err instanceof Error ? err.message : err);
        }
      }
    });
    await Promise.all(workers);
    console.log(`${language.title}: ${done} translated, ${failed} failed.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
