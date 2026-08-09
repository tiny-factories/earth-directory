import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { Dialog } from "@headlessui/react";
import { Sparkles, BookOpen, Microscope } from "lucide-react";
import Layout from "../../../components/Layout";
import TermCard, { TermProps } from "../../../components/Term";
import prisma from "../../../lib/prisma";

interface Term {
  title: string;
  id: string;
}

interface GroupedTerms {
  group: string;
  children: Term[];
}

type DefinitionLevel = "kids" | "medium" | "scientific";

const PROVENANCE_LABELS: Record<string, string> = {
  AI_GENERATED: "AI-generated",
  GOVERNMENT: "Government source",
  SCIENTIFIC: "Scientific source",
  SCRAPED: "Scraped",
  OTHER: "Other",
};

interface PageData {
  title: string;
  published: boolean;
  content?: string | null;
  studies?: string | null;
  definitionKids?: string | null;
  definitionMedium?: string | null;
  definitionScientific?: string | null;
  source: {
    title: string;
    href: string;
  } | null;
  /** Source and provenance per definition level (from definition history) */
  definitionMeta?: {
    kids?: { source: { title: string; href: string | null } | null; provenance: string };
    medium?: { source: { title: string; href: string | null } | null; provenance: string };
    scientific?: { source: { title: string; href: string | null } | null; provenance: string };
  };
  /** Papers, articles, videos, etc. to learn more */
  resources?: { title: string; href: string; type: string; description: string | null }[];
}

interface TermPageProps {
  pageData: PageData | null;
  realtedTerms: GroupedTerms[];
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], // Indicates that no page needs to be created at build time
    fallback: 'blocking', // Indicates the type of fallback
  };
};
const DEFINITION_LABELS: Record<DefinitionLevel, string> = {
  kids: "For everyone",
  medium: "In depth",
  scientific: "Technical",
};

const DEFINITION_ICONS: Record<DefinitionLevel, typeof Sparkles> = {
  kids: Sparkles,
  medium: BookOpen,
  scientific: Microscope,
};

/** Tooltip / accessibility description for each definition level (used in slider) */
const DEFINITION_DESCRIPTIONS: Record<DefinitionLevel, string> = {
  kids: "For everyone — simple, accessible language",
  medium: "In depth — more detail and context",
  scientific: "Technical — scientific or expert level",
};

const RESOURCE_TYPE_LABELS: Record<string, string> = {
  PAPER: "Paper",
  ARTICLE: "Article",
  VIDEO: "Video",
  PODCAST: "Podcast",
  WEBSITE: "Website",
  OTHER: "Resource",
};

/** All three definition levels always shown; empty ones display "Coming soon." */
const ALL_DEFINITION_LEVELS: DefinitionLevel[] = ["kids", "medium", "scientific"];

function getDefaultLevel(pageData: PageData): DefinitionLevel {
  if (pageData.definitionKids?.trim()) return "kids";
  if (pageData.definitionMedium?.trim()) return "medium";
  if (pageData.definitionScientific?.trim()) return "scientific";
  return "kids";
}

function getDefinitionByLevel(
  pageData: PageData,
  level: DefinitionLevel
): string | null {
  switch (level) {
    case "kids":
      return pageData.definitionKids ?? null;
    case "medium":
      return pageData.definitionMedium ?? null;
    case "scientific":
      return pageData.definitionScientific ?? null;
  }
}

/** One source entry (may apply to multiple definition levels) */
interface SourceEntry {
  title: string;
  href: string | null;
  provenance: string;
  levels: DefinitionLevel[];
}

/** Collect all definition sources for this term (per-level + legacy), deduplicated */
function collectDefinitionSources(pageData: PageData): SourceEntry[] {
  const byKey = new Map<string, SourceEntry>();
  const key = (title: string, href: string | null) => `${title}\n${href ?? ""}`;

  ALL_DEFINITION_LEVELS.forEach((level) => {
    const meta = pageData.definitionMeta?.[level];
    const src = meta?.source ?? (level === "kids" ? pageData.source : null);
    if (!src?.title) return;
    const k = key(src.title, src.href ?? null);
    const existing = byKey.get(k);
    if (existing) {
      if (!existing.levels.includes(level)) existing.levels.push(level);
      return;
    }
    byKey.set(k, {
      title: src.title,
      href: src.href ?? null,
      provenance: meta?.provenance ?? "Other",
      levels: [level],
    });
  });

  // Legacy: term-level source if not already covered by definitionMeta
  if (pageData.source?.title) {
    const k = key(pageData.source.title, pageData.source.href ?? null);
    if (!byKey.has(k)) {
      byKey.set(k, {
        title: pageData.source.title,
        href: pageData.source.href ?? null,
        provenance: "Other",
        levels: [],
      });
    }
  }

  return Array.from(byKey.values());
}

const TermPage: React.FC<TermPageProps> = (props) => {
  const { pageData, realtedTerms } = props;

  const defaultLevel = useMemo(
    () => (pageData ? getDefaultLevel(pageData) : "kids"),
    [pageData]
  );
  const [activeLevel, setActiveLevel] = useState<DefinitionLevel>(defaultLevel);

  useEffect(() => {
    setActiveLevel(defaultLevel);
  }, [defaultLevel]);

  const definitionText = pageData && activeLevel
    ? getDefinitionByLevel(pageData, activeLevel)
    : null;
  const displayDefinition =
    (definitionText?.trim()?.length ? definitionText : null) ?? "Coming soon.";

  const definitionSources = useMemo(
    () => (pageData ? collectDefinitionSources(pageData) : []),
    [pageData]
  );
  const [sourcesModalOpen, setSourcesModalOpen] = useState(false);

  if (!pageData) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl py-9">
          <p className="text-h4">Term not found.</p>
        </div>
      </Layout>
    );
  }

  const title = pageData.published
    ? pageData.title
    : `${pageData.title} (Draft)`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:image" content={`/api/og?title=${title}`} />
      </Head>
      <Layout>
        <div className="mx-auto max-w-7xl ">
          <div className="text-h4 sm:text-h3 md:sm:text-h1 font-bold font-satoshi border-b-2">
            {title}
          </div>
          {/* Section Definition — tabs (desktop) or icon slider (small/medium) */}
          <div className="grid grid-cols-1 gap-4 py-9 md:grid-cols-4 md:gap-4">
            <div className="w-full pb-4 md:col-span-1 md:pb-9">
              <div className="flex items-center gap-2 text-h5 font-bold md:text-h3">
                {(() => {
                  const Icon = activeLevel && DEFINITION_ICONS[activeLevel] ? DEFINITION_ICONS[activeLevel] : BookOpen;
                  return <Icon className="size-5 shrink-0" aria-hidden />;
                })()}
                Definition
              </div>
              {/* Icon slider: visible on small/medium; one icon per level with tooltip */}
              <div
                className="mt-3 flex flex-wrap items-center gap-2 md:hidden"
                role="tablist"
                aria-label="Definition level"
              >
                {ALL_DEFINITION_LEVELS.map((level) => {
                  const Icon = DEFINITION_ICONS[level];
                  const isActive = activeLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      title={DEFINITION_DESCRIPTIONS[level]}
                      onClick={() => setActiveLevel(level)}
                      className={`flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {Icon && <Icon className="size-5 shrink-0" aria-hidden />}
                    </button>
                  );
                })}
                <span className="text-sm font-medium text-gray-700" aria-live="polite">
                  {activeLevel && DEFINITION_LABELS[activeLevel]}
                </span>
              </div>
              {/* Tabs: visible on md and up */}
              <div
                className="mt-2 hidden border-b border-gray-300 font-satoshi md:block"
                role="tablist"
                aria-label="Definition level"
              >
                {ALL_DEFINITION_LEVELS.map((level) => {
                  const Icon = DEFINITION_ICONS[level];
                  const isActive = activeLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveLevel(level)}
                      className={`flex items-center gap-1.5 px-3 py-2 text-sm -mb-px border-b-2 transition-colors ${
                        isActive
                          ? "border-black text-black font-semibold"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
                      {DEFINITION_LABELS[level]}
                    </button>
                  );
                })}
              </div>
              {definitionSources.length > 0 && (
                <div className="mt-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSourcesModalOpen(true)}
                    className="text-sm font-medium underline underline-offset-2 hover:no-underline md:text-base"
                  >
                    {definitionSources.length === 1 ? "Source" : "Sources"}
                  </button>
                </div>
              )}
            </div>
            <div className="min-w-0 text-h4 sm:text-h3 md:col-span-3 md:sm:text-h2">
              {displayDefinition}
            </div>
          </div>
          {/* Section Learn more — papers, articles, videos, etc. */}
          {(pageData.resources?.length ?? 0) > 0 && (
            <div>
              <div className="grid grid-cols-1 gap-4 py-9 md:grid-cols-4">
                <div className="w-full pb-4 md:col-span-1 md:pb-9">
                  <div className="text-h5 md:text-h3 font-bold">Learn more</div>
                  <p className="text-sm opacity-75 pt-1">
                    Papers, articles, videos and more to go deeper.
                  </p>
                </div>
                <div className="min-w-0 md:col-span-3">
                  <ul className="space-y-4 text-h4 sm:text-h3 md:sm:text-h2">
                    {pageData.resources!.map((r) => (
                      <li key={r.href + r.title}>
                        <Link
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-satoshi font-bold underline hover:no-underline"
                        >
                          {r.title}
                        </Link>
                        <span className="text-sm font-normal opacity-75 ml-2">
                          {RESOURCE_TYPE_LABELS[r.type] ?? r.type}
                        </span>
                        {r.description && (
                          <p className="text-sm font-normal opacity-90 mt-1 italic">
                            {r.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* Section Related Terms */}

          <div>
            <div className="grid grid-cols-1 gap-4 py-9 md:grid-cols-4">
              <div className="w-full pb-4 md:col-span-1 md:pb-9">
                <div className="text-h5 md:text-h3 font-bold">
                  Related Terms
                </div>
              </div>
              <div className="min-w-0 text-h4 sm:text-h3 md:col-span-3 md:sm:text-h2 ">
                <div className="flex flex-wrap w-full ">
                  <div className="pt-3 pb-9 w-full flex flex-wrap justify-between font-bold text-h3">
                    {props.realtedTerms.length === 0 ? (
                      <p className="text-gray-500 font-normal">
                        No other terms of this type yet.
                      </p>
                    ) : (
                      props.realtedTerms
                      .sort(function (a, b) {
                        if (a.group < b.group) return -1;
                        if (a.group > b.group) return 1;
                        return 0;
                      })
                      .map((term, i) => (
                        <div className="w-full" key={i}>
                          <div
                            id={term.group}
                            className="text-h4 sm:text-h3 md:sm:text-h2 font-bold text-gray-500 font-satoshi"
                          >
                            {term.group}{" "}
                          </div>
                          {term.children
                            .sort(function (a, b) {
                              if (a.title < b.title) return -1;
                              if (a.title > b.title) return 1;
                              return 0;
                            })
                            .map((child, j) => (
                              <div key={child.id} className="">
                                <TermCard
                                  term={
                                    {
                                      ...child,
                                      group: term.group,
                                      sponsor: false,
                                    } as TermProps
                                  }
                                />
                              </div>
                            ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sources modal */}
        <Dialog
          open={sourcesModalOpen}
          onClose={() => setSourcesModalOpen(false)}
          className="relative z-50 font-satoshi"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="relative w-full max-w-lg rounded-2xl bg-[#EEEDE6] p-6 shadow-xl">
              <Dialog.Title className="text-h3 font-bold">
                {definitionSources.length === 1 ? "Source" : "Sources"}
              </Dialog.Title>
              <p className="mt-1 text-sm text-gray-600">
                Sources that influenced this term’s definitions.
              </p>
              <ul className="mt-4 space-y-4">
                {definitionSources.map((entry, i) => (
                  <li key={i} className="border-b border-gray-300 pb-4 last:border-0 last:pb-0">
                    <div className="font-medium">
                      {entry.href ? (
                        <Link
                          href={entry.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:no-underline"
                          onClick={() => setSourcesModalOpen(false)}
                        >
                          {entry.title}
                        </Link>
                      ) : (
                        entry.title
                      )}
                    </div>
                    {entry.levels.length > 0 && (
                      <div className="mt-1 text-sm text-gray-600">
                        {entry.levels.map((l) => DEFINITION_LABELS[l]).join(", ")}
                      </div>
                    )}
                    <div className="mt-0.5 text-sm opacity-75">
                      {PROVENANCE_LABELS[entry.provenance] ?? entry.provenance}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSourcesModalOpen(false)}
                  className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pageData = await prisma.term.findFirst({
    where: {
      id: String(params?.id),
    },
    select: {
      id: true,
      title: true,
      published: true,
      content: true,
      studies: true,
      termType: true,
      definitionKids: true,
      definitionMedium: true,
      definitionScientific: true,
      sourceId: true,
      tagId: true,
      source: {
        select: {
          title: true,
          href: true,
        },
      },
      resources: {
        orderBy: { sortOrder: "asc" },
        select: {
          title: true,
          href: true,
          type: true,
          description: true,
        },
      },
    },
  });

  // Related terms = same term type (e.g. other Glossary terms, other Policies)
  let realtedTerms: GroupedTerms[] = [];
  if (pageData?.termType) {
    const sameTypeTerms = await prisma.term.findMany({
      where: {
        published: true,
        termType: pageData.termType,
        id: { not: pageData.id },
      },
      select: { id: true, title: true },
      take: 60,
      orderBy: { title: "asc" },
    });
    const byLetter = sameTypeTerms.reduce<Record<string, GroupedTerms>>((r, e) => {
      const group = e.title[0];
      if (!r[group]) r[group] = { group, children: [] };
      r[group].children.push({ id: e.id, title: e.title });
      return r;
    }, {});
    realtedTerms = Object.values(byLetter).sort((a, b) =>
      a.group < b.group ? -1 : a.group > b.group ? 1 : 0
    );
  }

  // Latest definition history per level (source + provenance)
  let definitionMeta: PageData["definitionMeta"] = undefined;
  if (pageData) {
    const levels = ["kids", "medium", "scientific"] as const;
    const latestDefs = await Promise.all(
      levels.map((level) =>
        prisma.termDefinition.findFirst({
          where: { termId: pageData.id, level },
          orderBy: { createdAt: "desc" },
          include: { source: { select: { title: true, href: true } } },
        })
      )
    );
    definitionMeta = {};
    latestDefs.forEach((def, i) => {
      if (def) {
        definitionMeta![levels[i]] = {
          source: def.source ? { title: def.source.title, href: def.source.href ?? null } : null,
          provenance: def.provenance,
        };
      }
    });
  }

  const serializedPageData = pageData
    ? {
        ...pageData,
        studies: undefined,
        studiesText:
          pageData.studies && Array.isArray(pageData.studies)
            ? (pageData.studies as { content: string }[]).map((s) => s.content).join("\n\n")
            : null,
      }
    : null;

  return {
    props: {
      pageData: serializedPageData
        ? {
            title: serializedPageData.title,
            published: serializedPageData.published,
            content: serializedPageData.content,
            studies: (serializedPageData as { studiesText?: string }).studiesText ?? null,
            definitionKids: serializedPageData.definitionKids,
            definitionMedium: serializedPageData.definitionMedium,
            definitionScientific: serializedPageData.definitionScientific,
            source: serializedPageData.source,
            definitionMeta: definitionMeta ?? undefined,
            resources: serializedPageData.resources?.map((r) => ({
              title: r.title,
              href: r.href,
              type: r.type,
              description: r.description,
            })),
          }
        : null,
      realtedTerms,
    },
    revalidate: 10,
  };
};

export default TermPage;
