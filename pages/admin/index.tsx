// Dev/preview-only status dashboard: term counts, definition coverage,
// relations, resources, and the unpublished draft review queue.
// Returns 404 on production deployments (VERCEL_ENV === "production").
import React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "../../components/Layout";
import prisma from "../../lib/prisma";

type Count = { label: string; count: number };

type Props = {
  totals: {
    terms: number;
    published: number;
    drafts: number;
    relations: number;
    termsWithRelations: number;
    resources: number;
    termsWithResources: number;
    tags: number;
    languages: number;
  };
  byType: Count[];
  definitionCoverage: Count[];
  provenance: Count[];
  resourceTypes: Count[];
  draftQueue: { id: string; title: string; termType: string | null; tldr: string | null }[];
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="border rounded p-4">
    <div className="text-3xl font-bold">{value}</div>
    <div className="text-sm opacity-75">{label}</div>
  </div>
);

const CountTable: React.FC<{ title: string; rows: Count[] }> = ({ title, rows }) => (
  <div className="border rounded p-4">
    <div className="font-bold pb-2">{title}</div>
    <table className="w-full text-sm">
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-t">
            <td className="py-1">{r.label}</td>
            <td className="py-1 text-right font-mono">{r.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Admin: React.FC<Props> = (props) => (
  <Layout>
    <div className="py-8 space-y-8">
      <div>
        <h1 className="text-h3 font-bold">Directory status</h1>
        <p className="text-sm opacity-75">
          Dev/preview only — this page 404s in production.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Terms" value={props.totals.terms} />
        <Stat label="Published" value={props.totals.published} />
        <Stat label="Draft queue" value={props.totals.drafts} />
        <Stat label="Relations" value={props.totals.relations} />
        <Stat label="Terms with relations" value={props.totals.termsWithRelations} />
        <Stat label="Resources" value={props.totals.resources} />
        <Stat label="Terms with resources" value={props.totals.termsWithResources} />
        <Stat label="Tags / Languages" value={props.totals.tags + props.totals.languages} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CountTable title="By term type" rows={props.byType} />
        <CountTable title="Definition coverage" rows={props.definitionCoverage} />
        <CountTable title="Definition provenance" rows={props.provenance} />
        <CountTable title="Resource types" rows={props.resourceTypes} />
      </div>

      {props.draftQueue.length > 0 && (
        <div className="border rounded p-4">
          <div className="font-bold pb-2">
            Draft review queue ({props.draftQueue.length} unpublished)
          </div>
          <ul className="space-y-2 text-sm">
            {props.draftQueue.map((d) => (
              <li key={d.id} className="border-t pt-2">
                <span className="font-bold">{d.title}</span>
                {d.termType && (
                  <span className="ml-2 font-mono text-xs opacity-75">{d.termType}</span>
                )}
                {d.tldr && <p className="opacity-75">{d.tldr}</p>}
              </li>
            ))}
          </ul>
          <p className="text-xs opacity-75 pt-3">
            Publish drafts via <code>npm run studio</code> (set published = true), then run{" "}
            <code>npm run enrich-terms</code> to generate their definitions and relations.
          </p>
        </div>
      )}

      <p className="text-sm">
        <Link href="/terms" className="underline">
          → Browse terms
        </Link>
      </p>
    </div>
  </Layout>
);

export const getServerSideProps: GetServerSideProps = async () => {
  if (process.env.VERCEL_ENV === "production") {
    return { notFound: true };
  }

  const [terms, published, relations, resources, tags, languages] = await Promise.all([
    prisma.term.count(),
    prisma.term.count({ where: { published: true } }),
    prisma.termRelation.count(),
    prisma.termResource.count(),
    prisma.tag.count(),
    prisma.language.count(),
  ]);

  const [typeGroups, defGroups, provGroups, resGroups] = await Promise.all([
    prisma.term.groupBy({ by: ["termType"], _count: { _all: true } }),
    prisma.termDefinition.groupBy({ by: ["level"], _count: { _all: true } }),
    prisma.termDefinition.groupBy({ by: ["provenance"], _count: { _all: true } }),
    prisma.termResource.groupBy({ by: ["type"], _count: { _all: true } }),
  ]);

  const [kids, medium, scientific, termsWithRelations, termsWithResources, draftQueue] =
    await Promise.all([
      prisma.term.count({ where: { published: true, definitionKids: { not: null } } }),
      prisma.term.count({ where: { published: true, definitionMedium: { not: null } } }),
      prisma.term.count({ where: { published: true, definitionScientific: { not: null } } }),
      prisma.term.count({ where: { relatedFrom: { some: {} } } }),
      prisma.term.count({ where: { resources: { some: {} } } }),
      prisma.term.findMany({
        where: { published: false },
        select: { id: true, title: true, termType: true, tldr: true },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

  const toRows = (groups: any[], key: string): Count[] =>
    groups
      .map((g) => ({ label: String(g[key] ?? "unclassified"), count: g._count._all }))
      .sort((a, b) => b.count - a.count);

  return {
    props: {
      totals: {
        terms,
        published,
        drafts: terms - published,
        relations,
        termsWithRelations,
        resources,
        termsWithResources,
        tags,
        languages,
      },
      byType: toRows(typeGroups, "termType"),
      definitionCoverage: [
        { label: "kids (terms)", count: kids },
        { label: "medium (terms)", count: medium },
        { label: "scientific (terms)", count: scientific },
        ...toRows(defGroups, "level").map((r) => ({
          label: `${r.label} (history rows)`,
          count: r.count,
        })),
      ],
      provenance: toRows(provGroups, "provenance"),
      resourceTypes: toRows(resGroups, "type"),
      draftQueue: JSON.parse(JSON.stringify(draftQueue)),
    },
  };
};

export default Admin;
