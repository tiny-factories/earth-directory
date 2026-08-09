/**
 * Shared translation logic for terms.
 *
 * Used by:
 *  - pages/api/translate-term.ts — on-demand: first visitor to a term page with
 *    ?locale=xx triggers a Claude translation, which is stored in TermTranslation
 *    so every later visitor gets it instantly.
 *  - scripts/translate-terms-with-claude.ts — bulk pre-translation from the CLI.
 *
 * Only text is translated (title, tldr, three definition levels); relations,
 * tags, resources and images are shared across languages on the Term itself.
 * Existing rows are never overwritten, so human-reviewed translations survive.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { TermTranslation } from "@prisma/client";
import prisma from "./prisma";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5";

export type TranslatableTerm = {
  id: string;
  title: string;
  tldr: string | null;
  definitionKids: string | null;
  definitionMedium: string | null;
  definitionScientific: string | null;
};

export const TRANSLATABLE_TERM_SELECT = {
  id: true,
  title: true,
  tldr: true,
  definitionKids: true,
  definitionMedium: true,
  definitionScientific: true,
} as const;

type ParsedTranslation = {
  title?: string | null;
  tldr?: string | null;
  definitionKids?: string | null;
  definitionMedium?: string | null;
  definitionScientific?: string | null;
};

function buildSystem(languageTitle: string, i18n: string): string {
  return `You translate entries from Earth Directory, a climate-change glossary, from English into ${languageTitle} (${i18n}). Reply with ONLY a JSON object (no markdown fences) with these keys: "title", "tldr", "definitionKids", "definitionMedium", "definitionScientific".

- Translate each provided field into natural, fluent ${languageTitle}; return null for any field marked as not provided.
- Match the register of each level: kids = simple words an 8-year-old understands, medium = general adult reader, scientific = precise technical language using the accepted scientific terminology in ${languageTitle}.
- Keep proper nouns, organization names, and acronyms in the form commonly used in ${languageTitle} (e.g. keep "NASA" as-is).
- Translate meaning, not word-for-word; never add or remove factual content.`;
}

function buildUserMessage(term: TranslatableTerm): string {
  const parts = [`Title: ${term.title}`];
  parts.push(term.tldr ? `TL;DR: ${term.tldr}` : "TL;DR: (not provided)");
  parts.push(
    term.definitionKids
      ? `Kids definition: ${term.definitionKids}`
      : "Kids definition: (not provided)"
  );
  parts.push(
    term.definitionMedium
      ? `Medium definition: ${term.definitionMedium}`
      : "Medium definition: (not provided)"
  );
  parts.push(
    term.definitionScientific
      ? `Scientific definition: ${term.definitionScientific}`
      : "Scientific definition: (not provided)"
  );
  return parts.join("\n\n");
}

function parseJson(text: string): ParsedTranslation | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function clean(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Translate one term with Claude and store the result. Returns the stored row,
 * or null when the response was unusable. Uses upsert with a no-op update so a
 * concurrent writer (or an existing human translation) is never overwritten.
 */
export async function createTranslation(
  anthropic: Anthropic,
  term: TranslatableTerm,
  language: { i18n: string; title: string }
): Promise<TermTranslation | null> {
  const message: any = await (anthropic.beta.messages as any).create({
    model: MODEL,
    max_tokens: 3000,
    output_config: { effort: "low" },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: buildSystem(language.title, language.i18n),
    messages: [{ role: "user", content: buildUserMessage(term) }],
  } as any);

  if (message.stop_reason === "refusal") return null;
  const textBlock = (message.content ?? []).find((b: any) => b.type === "text");
  const result = textBlock ? parseJson(textBlock.text) : null;
  if (!result) return null;

  const title = clean(result.title);
  if (!title) return null;

  return prisma.termTranslation.upsert({
    where: { termId_locale: { termId: term.id, locale: language.i18n } },
    create: {
      termId: term.id,
      locale: language.i18n,
      title,
      tldr: clean(result.tldr),
      definitionKids: clean(result.definitionKids),
      definitionMedium: clean(result.definitionMedium),
      definitionScientific: clean(result.definitionScientific),
    },
    update: {},
  });
}

// Dedupe concurrent requests for the same term+locale within this instance,
// so a burst of first visitors triggers a single Claude call.
const inFlight = new Map<string, Promise<TermTranslation | null>>();

/**
 * Return the stored translation for a term+locale, generating it with Claude
 * on first request. Returns null when the term or locale is unknown.
 * Cost is bounded: published terms × published languages, one call each.
 */
export async function getOrCreateTranslation(
  termId: string,
  locale: string
): Promise<TermTranslation | null> {
  if (!termId || !locale || locale === "en") return null;

  const existing = await prisma.termTranslation.findUnique({
    where: { termId_locale: { termId, locale } },
  });
  if (existing) return existing;

  const language = await prisma.language.findFirst({
    where: { published: true, i18n: locale },
    select: { i18n: true, title: true },
  });
  if (!language?.i18n) return null;

  const term = await prisma.term.findFirst({
    where: { id: termId, published: true },
    select: TRANSLATABLE_TERM_SELECT,
  });
  if (!term) return null;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const key = `${termId}:${locale}`;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = createTranslation(new Anthropic({ apiKey }), term, {
    i18n: language.i18n,
    title: language.title,
  }).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
