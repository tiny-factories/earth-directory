/**
 * Generate a themed illustration for each term with Google's Nano Banana
 * (Gemini 2.5 Flash Image). Style: 19th-century scientific engraving, so the
 * whole directory reads as one coherent visual system.
 *
 * Requires GEMINI_API_KEY in .env.local (get one at https://aistudio.google.com).
 * Images are written to public/images/terms/<id>.png and Term.image is set to
 * the public path.
 *
 * Usage:
 *   npm run generate-images -- --limit=5    # pilot
 *   npm run generate-images                 # all published terms without an image
 *   npm run generate-images -- --force      # regenerate even if image exists
 */
import path from "path";
import fs from "fs";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const fetchFn: (url: string, init?: any) => Promise<any> = (globalThis as any).fetch;

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const OUT_DIR = path.resolve(process.cwd(), "public/images/terms");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STYLE = `A 19th-century scientific engraving illustrating "%TITLE%" (%HINT%), in the style of a vintage natural history encyclopedia plate. Fine crosshatched ink linework, sepia and muted earth tones on aged cream paper, subtle paper grain. A single centered subject with small annotated details around it, like an antique field guide. No text, no labels, no borders, no watermark.`;

async function generateImage(apiKey: string, prompt: string): Promise<Buffer | null> {
  const res = await fetchFn(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );
  if (res.status === 429 || res.status >= 500) {
    await sleep(15000);
    return generateImage(apiKey, prompt);
  }
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];
  for (let i = 0; i < parts.length; i++) {
    const inline = parts[i].inlineData ?? parts[i].inline_data;
    if (inline?.data) return Buffer.from(inline.data, "base64");
  }
  return null;
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GEMINI_API_KEY in .env.local — create one at https://aistudio.google.com/apikey"
    );
  }
  const force = process.argv.indexOf("--force") !== -1;
  const limitArg = process.argv.filter((a) => a.indexOf("--limit=") === 0)[0];
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const terms = await prisma.term.findMany({
    where: force ? { published: true } : { published: true, OR: [{ image: null }, { image: "" }] },
    select: { id: true, title: true, tldr: true, definitionMedium: true, termType: true },
    orderBy: { title: "asc" },
    ...(limit ? { take: limit } : {}),
  });
  console.log(`${terms.length} terms need images (model=${MODEL}).`);

  let done = 0;
  let errors = 0;
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    try {
      const hint =
        term.tldr?.slice(0, 200) ??
        term.definitionMedium?.slice(0, 200) ??
        `a ${String(term.termType ?? "concept").toLowerCase().replace(/_/g, " ")} related to climate change`;
      const prompt = STYLE.replace("%TITLE%", term.title).replace("%HINT%", hint);
      const image = await generateImage(apiKey, prompt);
      if (!image) {
        errors++;
        console.log(`[${i + 1}/${terms.length}] ${term.title}: no image in response`);
        continue;
      }
      const file = path.join(OUT_DIR, `${term.id}.png`);
      fs.writeFileSync(file, image);
      await prisma.term.update({
        where: { id: term.id },
        data: { image: `/images/terms/${term.id}.png` },
      });
      done++;
      console.log(`[${i + 1}/${terms.length}] ${term.title}: saved (${Math.round(image.length / 1024)} KB)`);
      await sleep(500);
    } catch (e) {
      errors++;
      console.log(
        `[${i + 1}/${terms.length}] ${term.title}: ERROR ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }
  console.log(`Done. ${done} images generated, ${errors} errors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
