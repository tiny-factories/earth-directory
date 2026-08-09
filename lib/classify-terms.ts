/**
 * Shared logic for classifying terms with Claude.
 * Used by the CLI script and the weekly cron API.
 */

import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient, TermType } from "@prisma/client";

const VALID_TERM_TYPES: TermType[] = [
  "GLOSSARY_TERM",
  "HISTORICAL_EVENT",
  "SPOTLIGHT",
  "CONCEPT",
  "POLICY",
  "PERSON",
  "ORGANIZATION",
  "MISSION",
  "PRINCIPLE",
  "OTHER",
];

const TERM_TYPE_DESCRIPTIONS: Record<TermType, string> = {
  GLOSSARY_TERM:
    "A defined word or phrase from a glossary (e.g. climate, carbon dioxide, ecosystem).",
  HISTORICAL_EVENT:
    "A specific event in history (e.g. Paris Agreement signing, a summit, a disaster).",
  SPOTLIGHT:
    "A featured or in-depth piece (e.g. a deep dive on a topic, a case study).",
  CONCEPT:
    "An abstract idea or theme (e.g. sustainability, resilience, justice).",
  POLICY:
    "A law, regulation, treaty, or policy (e.g. Clean Air Act, NDC).",
  PERSON:
    "A named individual (e.g. scientist, activist, politician).",
  ORGANIZATION:
    "A group, agency, company, or institution (e.g. EPA, NASA, IPCC, NGO).",
  MISSION:
    "A mission, program, or initiative (e.g. NASA satellite mission, space mission, scientific program).",
  PRINCIPLE:
    "A principle, framework, or set of guiding ideas (e.g. bioregional principles, design principles).",
  OTHER:
    "None of the above; use when unclear.",
};

export function buildTermContext(term: {
  title: string;
  content: string | null;
  tldr: string | null;
  definitionKids: string | null;
  definitionMedium: string | null;
  definitionScientific: string | null;
}): string {
  const parts: string[] = [`Title: ${term.title}`];
  if (term.tldr) parts.push(`TL;DR: ${term.tldr}`);
  if (term.content) parts.push(`Content: ${term.content.slice(0, 800)}`);
  if (term.definitionKids) parts.push(`Definition (kids): ${term.definitionKids.slice(0, 400)}`);
  if (term.definitionMedium) parts.push(`Definition (medium): ${term.definitionMedium.slice(0, 400)}`);
  if (term.definitionScientific) parts.push(`Definition (scientific): ${term.definitionScientific.slice(0, 400)}`);
  return parts.join("\n\n");
}

export function parseTermType(raw: string): TermType {
  const trimmed = raw.trim().toUpperCase().replace(/\s+/g, "_");
  if (VALID_TERM_TYPES.includes(trimmed as TermType)) return trimmed as TermType;
  const normalized = trimmed.replace(/[^A-Z_]/g, "");
  for (const t of VALID_TERM_TYPES) {
    if (t === normalized || t.replace(/_/g, "") === normalized.replace(/_/g, "")) return t;
  }
  return "OTHER";
}

export async function classifyWithClaude(
  anthropic: Anthropic,
  termContext: string,
  model?: string
): Promise<TermType> {
  const system = `You classify glossary/directory entries into exactly one type. Reply with ONLY the enum value, nothing else.

Types:
${VALID_TERM_TYPES.map((t) => `- ${t}: ${TERM_TYPE_DESCRIPTIONS[t]}`).join("\n")}`;

  const modelId = model ?? process.env.CLAUDE_MODEL ?? "claude-opus-5";
  const message = await anthropic.messages.create({
    model: modelId,
    max_tokens: 32,
    system,
    messages: [
      {
        role: "user",
        content: `Classify this entry.\n\n${termContext}`,
      },
    ],
  });

  const text =
    message.content?.find((b) => b.type === "text")?.type === "text"
      ? (message.content?.find((b) => b.type === "text") as { type: "text"; text: string }).text
      : "";
  return parseTermType(text || "OTHER");
}

export type RunClassifyOptions = {
  /** Only process terms where termType is null (for weekly cron) */
  onlyNullType?: boolean;
  /** Only process terms that are still GLOSSARY_TERM (legacy default before nullable) */
  onlyGlossaryTerm?: boolean;
  /** Process all terms (re-classify) */
  reclassifyAll?: boolean;
  /** If true, do not write to DB */
  dryRun?: boolean;
  /** Prisma client (default: new PrismaClient()) */
  prisma?: PrismaClient;
  /** Delay in ms between API calls (default 400) */
  delayMs?: number;
  /** Optional logger (default: console) */
  log?: (msg: string) => void;
};

export type RunClassifyResult = {
  processed: number;
  updated: number;
  errors: number;
};

/**
 * Run classification for terms. Use onlyNullType: true for cron (only unclassified).
 */
export async function runClassifyTerms(options: RunClassifyOptions = {}): Promise<RunClassifyResult> {
  const {
    onlyNullType = false,
    onlyGlossaryTerm = false,
    reclassifyAll = false,
    dryRun = false,
    prisma: prismaClient,
    delayMs = 400,
    log = console.log,
  } = options;

  const prisma = prismaClient ?? new PrismaClient();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }
  const anthropic = new Anthropic({ apiKey });

  const where = reclassifyAll
    ? {}
    : onlyNullType
      ? { termType: null }
      : onlyGlossaryTerm
        ? { termType: "GLOSSARY_TERM" as TermType }
        : { termType: null }; // default: only unclassified (null)
  const terms = await prisma.term.findMany({
    where,
    select: {
      id: true,
      title: true,
      content: true,
      tldr: true,
      definitionKids: true,
      definitionMedium: true,
      definitionScientific: true,
      termType: true,
    },
    orderBy: { title: "asc" },
  });

  log(`Found ${terms.length} terms to classify (dryRun=${dryRun}, onlyNullType=${onlyNullType}, onlyGlossaryTerm=${onlyGlossaryTerm}, reclassifyAll=${reclassifyAll}).`);

  let updated = 0;
  let errors = 0;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const context = buildTermContext(term);
    try {
      const suggested = await classifyWithClaude(anthropic, context);
      log(`[${i + 1}/${terms.length}] ${term.title} → ${suggested}`);

      const current = term.termType ?? null;
      if (!dryRun && suggested !== current) {
        await prisma.term.update({
          where: { id: term.id },
          data: { termType: suggested },
        });
        updated++;
      }

      await new Promise((r) => setTimeout(r, delayMs));
    } catch (e) {
      errors++;
      log(`Error for term "${term.title}" (${term.id}): ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  log("Done.");
  return { processed: terms.length, updated, errors };
}
