import type { GetStaticProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Calendar,
  Lightbulb,
  Brain,
  Scale,
  User,
  Building2,
  Rocket,
  Compass,
  CircleDot,
  Tags,
  type LucideIcon,
} from "lucide-react";
import Layout from "../../components/Layout";
import Term, { TermProps } from "../../components/Term";
import prisma from "../../lib/prisma";

const TERM_TYPE_LABELS: Record<string, string> = {
  GLOSSARY_TERM: "Glossary term",
  HISTORICAL_EVENT: "Historical event",
  SPOTLIGHT: "Spotlight",
  CONCEPT: "Concept",
  POLICY: "Policy",
  PERSON: "Person",
  ORGANIZATION: "Organization",
  MISSION: "Mission",
  PRINCIPLE: "Principle",
  OTHER: "Other",
};

const TERM_TYPE_ICONS: Record<string, LucideIcon> = {
  GLOSSARY_TERM: BookOpen,
  HISTORICAL_EVENT: Calendar,
  SPOTLIGHT: Lightbulb,
  CONCEPT: Brain,
  POLICY: Scale,
  PERSON: User,
  ORGANIZATION: Building2,
  MISSION: Rocket,
  PRINCIPLE: Compass,
  OTHER: CircleDot,
};

const TAG_KIND_LABELS: Record<string, string> = {
  TOPIC: "Topic",
  TYPE: "Type",
  GENERAL: "Tag",
};

type TermWithMeta = {
  id: string;
  title: string;
  published: boolean;
  termType: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
};

type SortOption = "alphabetical" | "date_added" | "date_updated";

type Props = {
  result: TermProps[];
  termsWithMeta: TermWithMeta[];
  filterOptions: {
    termTypes: { value: string; label: string }[];
    tagsByKind: { kind: string; label: string; tags: { id: string; title: string; slug: string | null }[] }[];
  };
};

const TermsHome: React.FC<Props> = (props) => {
  const router = useRouter();
  const [selectedTermTypes, setSelectedTermTypes] = useState<Set<string>>(new Set());
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const hasAppliedInitialTypeFromUrl = useRef(false);

  // Initialize filter from URL (e.g. from tag cloud on home page)
  useEffect(() => {
    if (!router.isReady) return;
    const type = router.query.type;
    if (typeof type === "string" && TERM_TYPE_LABELS[type]) {
      hasAppliedInitialTypeFromUrl.current = true;
      setSelectedTermTypes(new Set([type]));
    }
  }, [router.isReady, router.query.type]);

  // Keep URL in sync when a single type is selected (for shareable links)
  useEffect(() => {
    if (!router.isReady) return;
    const current = router.query.type as string | undefined;
    if (selectedTermTypes.size === 1) {
      const [single] = Array.from(selectedTermTypes);
      if (current !== single) {
        router.replace({ pathname: "/terms", query: { type: single } }, undefined, { shallow: true });
      }
    } else if (selectedTermTypes.size === 0 && current && hasAppliedInitialTypeFromUrl.current) {
      // Only clear URL when user cleared the filter (we've already applied initial type from URL)
      router.replace("/terms", undefined, { shallow: true });
    }
  }, [selectedTermTypes, router.isReady]);

  const toggleTermType = (typeValue: string) => {
    setSelectedTermTypes((prev) => {
      const next = new Set(prev);
      if (next.has(typeValue)) next.delete(typeValue);
      else next.add(typeValue);
      return next;
    });
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const hasActiveFilters = selectedTermTypes.size > 0 || selectedTagIds.size > 0;

  const filteredResult = useMemo(() => {
    let terms = props.termsWithMeta;
    if (selectedTermTypes.size > 0) terms = terms.filter((t) => t.termType && selectedTermTypes.has(t.termType));
    if (selectedTagIds.size > 0) terms = terms.filter((t) => t.tagIds.some((id) => selectedTagIds.has(id)));

    if (sortBy === "date_added") {
      const sorted = [...terms].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      return [{ group: "\u2014", children: sorted.map((t) => ({ id: t.id, title: t.title })), randomTerm: sorted[0]?.title ?? "N/A" }];
    }
    if (sortBy === "date_updated") {
      const sorted = [...terms].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      return [{ group: "\u2014", children: sorted.map((t) => ({ id: t.id, title: t.title })), randomTerm: sorted[0]?.title ?? "N/A" }];
    }

    if (!hasActiveFilters) {
      return props.result;
    }
    const byLetter = terms.reduce<Record<string, { group: string; children: { id: string; title: string }[]; randomTerm?: string }>>((r, e) => {
      const group = e.title[0];
      if (!r[group]) r[group] = { group, children: [] };
      r[group].children.push({ id: e.id, title: e.title });
      return r;
    }, {});
    const result = Object.values(byLetter);
    result.forEach((g) => {
      const idx = g.children.length === 0 ? 0 : (g.group.charCodeAt(0) + (g.group.length > 1 ? g.group.charCodeAt(1) : 0)) % g.children.length;
      g.randomTerm = g.children[idx]?.title ?? "N/A";
    });
    return result.sort((a, b) => (a.group < b.group ? -1 : a.group > b.group ? 1 : 0));
  }, [hasActiveFilters, props.result, props.termsWithMeta, selectedTermTypes, selectedTagIds, sortBy]);

  return (
    <Layout>
      {/* Filters */}
      <div className="border-b border-gray-200 pb-6 mb-6">
        <div className="text-h5 font-bold font-satoshi mb-3">Filter</div>
        <div className="flex flex-wrap gap-4">
          <div className="w-full">
            <span className="text-sm text-gray-500 flex items-center gap-1.5 mb-2">
              <Tags className="size-4 shrink-0" aria-hidden />
              Type
            </span>
            <div className="flex flex-wrap gap-3">
              {props.filterOptions.termTypes.map((t) => {
                const Icon = TERM_TYPE_ICONS[t.value];
                const selected = selectedTermTypes.has(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleTermType(t.value)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-satoshi transition-colors ${
                      selected ? "bg-black text-white" : "bg-[#FFF] hover:bg-gray-100"
                    }`}
                  >
                    {Icon && <Icon className="size-5 shrink-0" aria-hidden />}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          {props.filterOptions.tagsByKind.map((group) => (
            <div key={group.kind}>
              <span className="text-sm text-gray-500 block mb-1">{group.label}</span>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded text-sm font-satoshi border ${
                      selectedTagIds.has(tag.id) ? "bg-black text-white border-black" : "border-gray-400"
                    }`}
                  >
                    {tag.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="w-full sm:w-auto">
            <span className="text-sm text-gray-500 block mb-1">Sort by</span>
            <div className="flex flex-wrap gap-2">
              {(["alphabetical", "date_added", "date_updated"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSortBy(option)}
                  className={`px-3 py-1.5 rounded text-sm font-satoshi border ${
                    sortBy === option ? "bg-black text-white border-black" : "border-gray-400"
                  }`}
                >
                  {option === "alphabetical" ? "Alphabetical" : option === "date_added" ? "Date added" : "Date updated"}
                </button>
              ))}
            </div>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setSelectedTermTypes(new Set()); setSelectedTagIds(new Set()); }}
              className="self-end px-3 py-1.5 text-sm border border-gray-400 rounded font-satoshi"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {sortBy === "alphabetical" && filteredResult.some((t) => t.group !== "\u2014") && (
        <div className="hidden sm:flex flex-wrap w-full justify-between hover:bold">
          <div className="text-h4 sm:text-h3 md:sm:text-h2 font-bold w-full border-b-4 border-black">
            Jump to a <span className="text-[#918180]">section</span>
          </div>
          <div className="pt-3 pb-9 w-full flex flex-wrap justify-between font-bold text-h3">
            {filteredResult.map((term, i) => (
              <div className="" key={i}>
                <Link
                  href={`#${term.group}`}
                  className="p-3 text-gray-500 font-satoshi font-normal hover:bg-[#FFF] hover:rounded-lg"
                >
                  {term.group}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="page">
        <main className="snap-y">
          <div className="">
            {filteredResult.map((term, i) => (
              <div className="" key={term.group + i}>
                {term.group !== "\u2014" ? (
                  <>
                    <div
                      id={term.group}
                      className="text-h4 sm:text-h3 md:sm:text-h2 font-bold text-gray-500 font-satoshi"
                    >
                      {term.group}{" "}
                      <span className="text-[#918180]">
                        is for {term.randomTerm}
                      </span>
                    </div>
                    {term.children
                      .sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0))
                      .map((child) => (
                        <div key={child.id}>
                          <Term term={{ ...child, group: term.group, sponsor: false } as TermProps} />
                        </div>
                      ))}
                  </>
                ) : (
                  term.children
                    .sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0))
                    .map((child) => (
                      <div key={child.id}>
                        <Term term={{ ...child, group: undefined, sponsor: false } as TermProps} />
                      </div>
                    ))
                )}
              </div>
            ))}
          </div>
        </main>
      </div>{" "}
    </Layout>
  );
};

function hasDefinition(term: { definitionKids?: string | null; definitionMedium?: string | null; definitionScientific?: string | null }): boolean {
  return (
    (term.definitionKids?.trim() ?? "").length > 0 ||
    (term.definitionMedium?.trim() ?? "").length > 0 ||
    (term.definitionScientific?.trim() ?? "").length > 0
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.term.findMany({
    where: { published: true },
    include: {
      tags: { include: { tag: true } },
    },
  });

  const feedWithDefinition = feed.filter(hasDefinition);

  const termsWithMeta: TermWithMeta[] = feedWithDefinition.map((e) => ({
    id: e.id,
    title: e.title,
    published: e.published,
    termType: e.termType ?? "",
    tagIds: e.tags.map((t) => t.tagId),
    createdAt: (e as { createdAt?: Date }).createdAt?.toISOString?.() ?? "",
    updatedAt: (e as { updatedAt?: Date }).updatedAt?.toISOString?.() ?? "",
  }));

  let data = feedWithDefinition.reduce((r, e) => {
    const group = e.title[0];
    if (!r[group]) r[group] = { group, children: [e] };
    else r[group].children.push(e);
    return r;
  }, {} as Record<string, { group: string; children: typeof feed }>);

  for (const group of Object.keys(data)) {
    const terms = data[group].children;
    const idx = terms.length === 0 ? 0 : (group.charCodeAt(0) + (group.length > 1 ? group.charCodeAt(1) : 0)) % terms.length;
    (data[group] as { randomTerm?: string }).randomTerm = terms[idx]?.title ?? "N/A";
  }

  const result = Object.values(data).map((g) => ({
    group: g.group,
    children: g.children.map((t) => ({ id: t.id, title: t.title })),
    randomTerm: (g as { randomTerm?: string }).randomTerm,
  }));

  const allTags = await prisma.tag.findMany({
    where: { published: true },
    orderBy: { kind: "asc" },
  });
  const tagsByKind = [
    { kind: "TOPIC", label: TAG_KIND_LABELS.TOPIC, tags: allTags.filter((t) => t.kind === "TOPIC") },
    { kind: "GENERAL", label: TAG_KIND_LABELS.GENERAL, tags: allTags.filter((t) => t.kind === "GENERAL" || !t.kind) },
  ].filter((g) => g.tags.length > 0);

  const termTypes = Object.entries(TERM_TYPE_LABELS).map(([value, label]) => ({ value, label }));

  return {
    props: {
      result,
      termsWithMeta,
      filterOptions: { termTypes, tagsByKind },
    },
    revalidate: 10,
  };
};

export default TermsHome;
