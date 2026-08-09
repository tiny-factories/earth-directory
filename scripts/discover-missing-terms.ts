/**
 * Discover terms missing from the directory. Claude (Opus 5) reviews the full
 * term list per thematic area and proposes important related terms we don't
 * have. Proposals are inserted as UNPUBLISHED drafts (published: false) for
 * human review — run `npm run enrich-terms` after publishing to fill in
 * definitions and relations.
 *
 * Usage:
 *   npm run discover-terms                # all thematic areas
 *   npm run discover-terms -- --dry-run   # print proposals, no DB writes
 */
import path from "path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";
import { parseTermType } from "../lib/classify-terms";

const prisma = new PrismaClient();
const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";

const AREAS = [
  "Climate science fundamentals (atmosphere, carbon cycle, feedbacks, tipping points)",
  "Energy systems (renewables, fossil fuels, grids, storage, efficiency)",
  "Oceans and cryosphere (sea level, ice, currents, acidification, marine ecosystems)",
  "Biodiversity, land use, and ecosystems (forests, soil, agriculture, restoration)",
  "Climate policy and international agreements (treaties, mechanisms, institutions)",
  "Climate justice, adaptation, and society (equity, migration, health, resilience)",
  "Climate technology and solutions (carbon removal, geoengineering, materials, transport)",
  "Earth observation and climate data (satellites, sensors, models, indicators)",
  "Climate economics and finance (carbon markets, risk, insurance, investment)",
  "Weather, extremes, and impacts (storms, drought, heat, fire, floods)",
];

type Proposal = { title: string; termType: string; rationale: string };

function parseJson(text: string): Proposal[] | null {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey });
  const dryRun = process.argv.indexOf("--dry-run") !== -1;

  const all = await prisma.term.findMany({ select: { title: true } });
  const existing: Record<string, boolean> = {};
  for (let i = 0; i < all.length; i++) existing[all[i].title.toLowerCase().trim()] = true;

  const system: any = [
    {
      type: "text",
      text: `You are curating Earth Directory, a climate-change glossary for students, educators, activists, and policymakers. Given the current list of entries and a thematic area, propose IMPORTANT terms that are missing — terms a reader would genuinely expect in a serious climate glossary. Reply with ONLY a JSON array (no markdown fences) of objects:
[{"title": "...", "termType": "GLOSSARY_TERM|HISTORICAL_EVENT|CONCEPT|POLICY|PERSON|ORGANIZATION|MISSION|PRINCIPLE|OTHER", "rationale": "one sentence on why it belongs"}]

Rules: propose at most 20 per area; never propose a term already in the list (check carefully, including near-duplicates and abbreviations); prefer widely used, durable terms over jargon; use the term's most common English name as the title.`,
    },
    {
      type: "text",
      text: `Current entries:\n${all.map((t) => t.title).join("\n")}`,
      cache_control: { type: "ephemeral" },
    },
  ];

  let created = 0;
  let skipped = 0;

  for (let a = 0; a < AREAS.length; a++) {
    const area = AREAS[a];
    const message: any = await (anthropic.beta.messages as any).create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system,
      messages: [{ role: "user", content: `Thematic area: ${area}\n\nPropose the missing terms.` }],
    } as any);
    if (message.stop_reason === "refusal") {
      console.log(`[${a + 1}/${AREAS.length}] ${area}: refused, skipping`);
      continue;
    }
    const textBlock = (message.content ?? []).find((b: any) => b.type === "text");
    const proposals = textBlock ? parseJson(textBlock.text) : null;
    if (!proposals) {
      console.log(`[${a + 1}/${AREAS.length}] ${area}: unparseable, skipping`);
      continue;
    }
    let areaCreated = 0;
    for (let i = 0; i < proposals.length; i++) {
      const p = proposals[i];
      const key = String(p.title).toLowerCase().trim();
      if (!key || existing[key]) {
        skipped++;
        continue;
      }
      existing[key] = true; // dedupe across areas too
      if (!dryRun) {
        await prisma.term.create({
          data: {
            title: String(p.title).trim(),
            termType: parseTermType(String(p.termType ?? "OTHER")),
            tldr: p.rationale ? String(p.rationale).slice(0, 500) : null,
            published: false,
          },
        });
      }
      created++;
      areaCreated++;
      if (dryRun) console.log(`  + ${p.title} (${p.termType}) — ${p.rationale}`);
    }
    console.log(`[${a + 1}/${AREAS.length}] ${area}: ${areaCreated} new proposals`);
  }

  console.log(
    `Done. ${created} draft terms ${dryRun ? "proposed (dry run)" : "created (unpublished)"}, ${skipped} duplicates skipped.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
