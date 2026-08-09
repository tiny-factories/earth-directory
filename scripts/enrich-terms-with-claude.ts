/**
 * Enrich terms with Claude (Opus 5):
 *  - classify termType where null
 *  - draft missing kids/medium/scientific definitions (AI_GENERATED provenance,
 *    recorded in TermDefinition history; never overwrites existing definitions)
 *  - suggest related terms, chosen from the actual term list, stored in TermRelation
 *
 * Usage:
 *   npm run enrich-terms                 # all published terms missing something
 *   npm run enrich-terms -- --limit=10   # pilot run
 *   npm run enrich-terms -- --dry-run    # no DB writes
 */
import path from "path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient, DefinitionLevel, DefinitionProvenance, TermType } from "@prisma/client";
import { parseTermType } from "../lib/classify-terms";

const prisma = new PrismaClient();
const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";
const CONCURRENCY = 4;

type TermRow = {
  id: string;
  title: string;
  content: string | null;
  tldr: string | null;
  termType: TermType | null;
  definitionKids: string | null;
  definitionMedium: string | null;
  definitionScientific: string | null;
  relatedFrom: { relatedTermId: string }[];
};

type EnrichResult = {
  termType?: string;
  definitionKids?: string | null;
  definitionMedium?: string | null;
  definitionScientific?: string | null;
  relatedTerms?: string[];
};

function buildSystem(allTitles: string[]): any {
  return [
    {
      type: "text",
      text: `You enrich entries in Earth Directory, a multilingual climate-change glossary. For each entry you receive, reply with ONLY a JSON object (no markdown fences) with these keys:

- "termType": one of GLOSSARY_TERM, HISTORICAL_EVENT, SPOTLIGHT, CONCEPT, POLICY, PERSON, ORGANIZATION, MISSION, PRINCIPLE, OTHER
- "definitionKids": a definition a curious 8-year-old can understand (2-3 short sentences, no jargon), or null if the request says this level already exists
- "definitionMedium": a definition for a general adult reader (2-4 sentences), or null if it already exists
- "definitionScientific": a technically precise definition for a scientifically literate reader (2-4 sentences; correct terminology, mechanisms, units where relevant), or null if it already exists
- "relatedTerms": 3-6 titles of the most closely related entries, copied EXACTLY from the directory list below. Never invent titles; never include the entry itself.

Definitions must be factually accurate and neutral in tone. If you are not confident about a fact, keep the definition general rather than guessing specifics.`,
    },
    {
      type: "text",
      text: `Directory entries (choose relatedTerms from these exact titles):\n${allTitles.join("\n")}`,
      cache_control: { type: "ephemeral" },
    },
  ];
}

function buildUserMessage(term: TermRow): string {
  const parts = [`Title: ${term.title}`];
  if (term.tldr) parts.push(`TL;DR: ${term.tldr}`);
  if (term.content) parts.push(`Content: ${term.content.slice(0, 800)}`);
  const have: string[] = [];
  if (term.definitionKids) {
    have.push("kids");
    parts.push(`Existing kids definition: ${term.definitionKids.slice(0, 400)}`);
  }
  if (term.definitionMedium) {
    have.push("medium");
    parts.push(`Existing medium definition: ${term.definitionMedium.slice(0, 400)}`);
  }
  if (term.definitionScientific) {
    have.push("scientific");
    parts.push(`Existing scientific definition: ${term.definitionScientific.slice(0, 400)}`);
  }
  parts.push(
    have.length
      ? `These definition levels already exist (return null for them): ${have.join(", ")}.`
      : "No definitions exist yet; generate all three levels."
  );
  return parts.join("\n\n");
}

function parseJson(text: string): EnrichResult | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function enrichOne(
  anthropic: Anthropic,
  term: TermRow,
  system: any,
  titleToId: Record<string, string>,
  levelTagIds: Record<string, string>,
  dryRun: boolean
): Promise<string> {
  const message: any = await (anthropic.beta.messages as any).create({
    model: MODEL,
    max_tokens: 2000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system,
    messages: [{ role: "user", content: buildUserMessage(term) }],
  } as any);

  if (message.stop_reason === "refusal") return `${term.title}: skipped (refusal)`;

  const textBlock = (message.content ?? []).find((b: any) => b.type === "text");
  const result = textBlock ? parseJson(textBlock.text) : null;
  if (!result) return `${term.title}: skipped (unparseable response)`;

  const notes: string[] = [];
  const data: Record<string, string> = {};

  if (!term.termType && result.termType) {
    data.termType = parseTermType(result.termType);
    notes.push(`type=${data.termType}`);
  }

  const levels: [DefinitionLevel, keyof EnrichResult, string | null][] = [
    [DefinitionLevel.kids, "definitionKids", term.definitionKids],
    [DefinitionLevel.medium, "definitionMedium", term.definitionMedium],
    [DefinitionLevel.scientific, "definitionScientific", term.definitionScientific],
  ];
  const newDefinitions: { level: DefinitionLevel; content: string; field: string }[] = [];
  for (let i = 0; i < levels.length; i++) {
    const level = levels[i][0];
    const key = levels[i][1];
    const existing = levels[i][2];
    const generated = result[key];
    if (!existing && typeof generated === "string" && generated.trim()) {
      newDefinitions.push({ level, content: generated.trim(), field: key as string });
      notes.push(level);
    }
  }

  const relatedIds: string[] = [];
  const suggested = result.relatedTerms ?? [];
  for (let i = 0; i < suggested.length; i++) {
    const id = titleToId[String(suggested[i]).toLowerCase().trim()];
    if (id && id !== term.id && relatedIds.indexOf(id) === -1) relatedIds.push(id);
  }
  notes.push(`${relatedIds.length} relations`);

  if (!dryRun) {
    for (let i = 0; i < newDefinitions.length; i++) {
      const d = newDefinitions[i];
      data[d.field] = d.content;
      await prisma.termDefinition.create({
        data: {
          termId: term.id,
          level: d.level,
          content: d.content,
          provenance: DefinitionProvenance.AI_GENERATED,
        },
      });
      const tagId = levelTagIds[d.level];
      if (tagId)
        await prisma.termTag.upsert({
          where: { termId_tagId: { termId: term.id, tagId } },
          create: { termId: term.id, tagId },
          update: {},
        });
    }
    if (Object.keys(data).length) {
      await prisma.term.update({ where: { id: term.id }, data });
    }
    for (let i = 0; i < relatedIds.length; i++) {
      await prisma.termRelation.upsert({
        where: { termId_relatedTermId: { termId: term.id, relatedTermId: relatedIds[i] } },
        create: { termId: term.id, relatedTermId: relatedIds[i], source: "AI_GENERATED" },
        update: {},
      });
    }
  }

  return `${term.title}: ${notes.join(", ")}`;
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
  const anthropic = new Anthropic({ apiKey });

  const dryRun = process.argv.indexOf("--dry-run") !== -1;
  const limitArg = process.argv.filter((a) => a.indexOf("--limit=") === 0)[0];
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;

  const all = await prisma.term.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      content: true,
      tldr: true,
      termType: true,
      definitionKids: true,
      definitionMedium: true,
      definitionScientific: true,
      relatedFrom: { select: { relatedTermId: true } },
    },
    orderBy: { title: "asc" },
  });

  const titleToId: Record<string, string> = {};
  for (let i = 0; i < all.length; i++) titleToId[all[i].title.toLowerCase().trim()] = all[i].id;

  const levelTags = await prisma.tag.findMany({ where: { kind: "LEVEL" } });
  const levelTagIds: Record<string, string> = {};
  for (let i = 0; i < levelTags.length; i++) {
    const slug = levelTags[i].slug ?? "";
    if (slug.indexOf("kids") !== -1) levelTagIds["kids"] = levelTags[i].id;
    if (slug.indexOf("medium") !== -1) levelTagIds["medium"] = levelTags[i].id;
    if (slug.indexOf("scientific") !== -1) levelTagIds["scientific"] = levelTags[i].id;
  }

  const needsWork = all.filter(
    (t) =>
      !t.termType ||
      !t.definitionKids ||
      !t.definitionMedium ||
      !t.definitionScientific ||
      t.relatedFrom.length === 0
  );
  const queue = limit ? needsWork.slice(0, limit) : needsWork;
  console.log(
    `${queue.length} of ${all.length} published terms need enrichment (dryRun=${dryRun}, model=${MODEL}).`
  );

  const system = buildSystem(all.map((t) => t.title));
  let done = 0;
  let errors = 0;

  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((term) =>
        enrichOne(anthropic, term, system, titleToId, levelTagIds, dryRun)
          .then((note) => {
            done++;
            return `[${done + errors}/${queue.length}] ${note}`;
          })
          .catch((e) => {
            errors++;
            return `[${done + errors}/${queue.length}] ${term.title}: ERROR ${
              e instanceof Error ? e.message : String(e)
            }`;
          })
      )
    );
    for (let j = 0; j < results.length; j++) console.log(results[j]);
  }

  console.log(`Done. ${done} enriched, ${errors} errors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
