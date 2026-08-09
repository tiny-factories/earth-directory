import path from "path";
import { config as loadEnv } from "dotenv";
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

import { PrismaClient, ResourceType } from "@prisma/client";

const prisma = new PrismaClient();
const fetchFn: (url: string, init?: any) => Promise<any> = (globalThis as any)
  .fetch;

const OPENALEX_MAILTO = "hello@madefor.earth";
const PAPERS_PER_TERM = 3;
const MIN_CITATIONS = 5;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Fetch with retry on 429/5xx, honoring Retry-After when present
async function fetchWithRetry(url: string, retries = 5): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetchFn(url);
    if (res.status !== 429 && res.status < 500) return res;
    if (attempt === retries) return res;
    const retryAfter = parseInt(res.headers?.get?.("retry-after") ?? "", 10);
    const waitMs = !isNaN(retryAfter)
      ? retryAfter * 1000
      : Math.min(30000, 1000 * Math.pow(2, attempt));
    await sleep(waitMs);
  }
}

// Satellite / mission terms get official-site + Wikipedia links (history, status logs)
const MISSION_PATTERN =
  /satellit|landsat|icesat|mission|observator|observing|sensor|radar|lidar|GOES|JPSS|DSCOVR|CYGNSS|CALIPSO|SeaWiFS|TEMPO|TRMM|TROPICS|TSIS|UARS|ERBS|ADEOS|ARCTAS|SEAC4RS|ORACLES|Geosat|EO-1|OCO/i;

async function hasResource(termId: string, href: string) {
  const existing = await prisma.termResource.findFirst({
    where: { termId, href },
    select: { id: true },
  });
  return existing !== null;
}

async function addResource(
  termId: string,
  data: {
    title: string;
    href: string;
    type: ResourceType;
    description?: string;
    sortOrder?: number;
  }
) {
  if (await hasResource(termId, data.href)) return false;
  await prisma.termResource.create({ data: { termId, ...data } });
  return true;
}

async function fetchPapers(term: { id: string; title: string }) {
  // Strip parenthetical expansions for a tighter search: "OCO (Orbiting Carbon Observatory)" -> "OCO"
  const shortTitle = term.title.replace(/\s*\(.*\)\s*/g, " ").trim();
  const query = encodeURIComponent(`${shortTitle} climate`);
  const url = `https://api.openalex.org/works?search=${query}&filter=type:article&per-page=10&mailto=${OPENALEX_MAILTO}`;
  const res = await fetchWithRetry(url);
  if (!res.ok) {
    console.warn(`  OpenAlex ${res.status} for "${term.title}"`);
    return 0;
  }
  const json = await res.json();
  if (process.env.DEBUG_FETCH)
    console.log(
      `  [debug] "${term.title}" status=${res.status} results=${
        (json.results ?? []).length
      } meta=${JSON.stringify(json.meta ?? json).slice(0, 200)}`
    );
  const cited = (json.results ?? []).filter(
    (w: any) => (w.cited_by_count ?? 0) >= MIN_CITATIONS
  );
  const linked = cited.filter(
    (w: any) => w.doi || w.primary_location?.landing_page_url
  );
  const works = linked.slice(0, PAPERS_PER_TERM);
  if (process.env.DEBUG_FETCH)
    console.log(
      `  [debug] cited=${cited.length} linked=${linked.length} kept=${works.length} sample=${JSON.stringify(
        (json.results ?? [])[0] ?? null
      )?.slice(0, 300)}`
    );

  let added = 0;
  // Plain index loop: for..of over .entries() breaks under the es5 compile target
  for (let i = 0; i < works.length; i++) {
    const w = works[i];
    const href = w.doi ?? w.primary_location?.landing_page_url;
    const authors = (w.authorships ?? [])
      .slice(0, 3)
      .map((a: any) => a.author?.display_name)
      .filter(Boolean)
      .join(", ");
    const venue = w.primary_location?.source?.display_name;
    const parts = [authors, w.publication_year, venue].filter(Boolean);
    const created = await addResource(term.id, {
      title: w.title ?? w.display_name ?? "Untitled paper",
      href,
      type: ResourceType.PAPER,
      description: parts.join(" · "),
      sortOrder: 10 + i,
    });
    if (created) added++;
  }
  return added;
}

async function fetchMissionLinks(term: { id: string; title: string }) {
  const shortTitle = term.title.replace(/\s*\(.*\)\s*/g, " ").trim();
  const search = encodeURIComponent(shortTitle);
  const wikiRes = await fetchWithRetry(
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${search}&srlimit=1&format=json`
  );
  if (!wikiRes.ok) return 0;
  const wikiJson = await wikiRes.json();
  const page = wikiJson?.query?.search?.[0];
  if (!page) return 0;

  let added = 0;
  const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(
    page.title.replace(/ /g, "_")
  )}`;
  if (
    await addResource(term.id, {
      title: `Wikipedia: ${page.title}`,
      href: wikiUrl,
      type: ResourceType.WEBSITE,
      description: "Mission history and background",
      sortOrder: 1,
    })
  )
    added++;

  // Official website via Wikidata (P856) — mission status pages, data logs
  const propsRes = await fetchWithRetry(
    `https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&pageids=${page.pageid}&format=json`
  );
  if (propsRes.ok) {
    const propsJson = await propsRes.json();
    const wikibaseId =
      propsJson?.query?.pages?.[page.pageid]?.pageprops?.wikibase_item;
    if (wikibaseId) {
      const wdRes = await fetchWithRetry(
        `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${wikibaseId}&property=P856&format=json`
      );
      if (wdRes.ok) {
        const wdJson = await wdRes.json();
        const official =
          wdJson?.claims?.P856?.[0]?.mainsnak?.datavalue?.value;
        if (official) {
          if (
            await addResource(term.id, {
              title: "Official mission site",
              href: official,
              type: ResourceType.WEBSITE,
              description: "Mission status, data access, and logs",
              sortOrder: 0,
            })
          )
            added++;
        }
      }
    }
  }
  return added;
}

async function main() {
  const onlyMissions = process.argv.includes("--missions-only");
  const limitArg = process.argv.find((a) => a.startsWith("--limit="));
  const limit = limitArg ? parseInt(limitArg.split("=")[1], 10) : undefined;

  const terms = await prisma.term.findMany({
    where: { published: true },
    select: { id: true, title: true },
    orderBy: { title: "asc" },
    ...(limit ? { take: limit } : {}),
  });

  let paperCount = 0;
  let linkCount = 0;
  let processed = 0;

  for (const term of terms) {
    const isMission = MISSION_PATTERN.test(term.title);
    if (onlyMissions && !isMission) continue;
    processed++;

    try {
      if (isMission) {
        linkCount += await fetchMissionLinks(term);
        await sleep(150);
      }
      if (!onlyMissions) {
        paperCount += await fetchPapers(term);
        await sleep(350); // stay well inside OpenAlex polite-pool limits
      }
      if (processed % 25 === 0)
        console.log(
          `…${processed} terms processed (${paperCount} papers, ${linkCount} mission links)`
        );
    } catch (e) {
      console.warn(`  failed on "${term.title}":`, (e as Error).message);
    }
  }

  console.log(
    `Done. ${processed} terms processed: ${paperCount} papers and ${linkCount} mission links added.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
