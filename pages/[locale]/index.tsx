import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import React from "react";
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
  type LucideIcon,
} from "lucide-react";
import Layout from "../../components/Layout";
import { TermProps } from "../../components/Term";
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

const TERM_TYPE_CARD_STYLES: Record<
  string,
  { bg: string; text: string; icon: string }
> = {
  GLOSSARY_TERM: { bg: "bg-amber-50", text: "text-amber-800", icon: "text-amber-600" },
  HISTORICAL_EVENT: { bg: "bg-orange-50", text: "text-orange-800", icon: "text-orange-600" },
  SPOTLIGHT: { bg: "bg-rose-50", text: "text-rose-800", icon: "text-rose-600" },
  CONCEPT: { bg: "bg-fuchsia-50", text: "text-fuchsia-800", icon: "text-fuchsia-600" },
  POLICY: { bg: "bg-sky-50", text: "text-sky-800", icon: "text-sky-600" },
  PERSON: { bg: "bg-teal-50", text: "text-teal-800", icon: "text-teal-600" },
  ORGANIZATION: { bg: "bg-violet-50", text: "text-violet-800", icon: "text-violet-600" },
  MISSION: { bg: "bg-indigo-50", text: "text-indigo-800", icon: "text-indigo-600" },
  PRINCIPLE: { bg: "bg-emerald-50", text: "text-emerald-800", icon: "text-emerald-600" },
  OTHER: { bg: "bg-stone-100", text: "text-stone-800", icon: "text-stone-600" },
};

export const getStaticPaths: GetStaticPaths = async () => {
  const languages = await prisma.language.findMany({
    where: { published: true, i18n: { not: null } },
    select: { i18n: true },
  });
  const paths = languages
    .filter((l): l is { i18n: string } => l.i18n != null && l.i18n !== "")
    .map((l) => ({ params: { locale: l.i18n } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const locale = params?.locale as string;
  const language = await prisma.language.findFirst({
    where: { published: true, i18n: locale },
  });
  if (!language) {
    return { notFound: true };
  }

  const feed = await prisma.term.findMany({
    where: { published: true, languageId: language.id },
    take: 12,
    orderBy: { id: "desc" },
  });

  const languages = await prisma.language.findMany({
    where: { published: true, i18n: { not: null } },
    select: { id: true, title: true, i18n: true },
    orderBy: { title: "asc" },
  });

  return {
    props: {
      locale,
      languageTitle: language.title,
      feed,
      languages: languages.map((l) => ({
        id: l.id,
        title: l.title,
        i18n: l.i18n ?? "",
      })),
    },
    revalidate: 10,
  };
};

type LanguageItem = { id: string; title: string; i18n: string };

type Props = {
  locale: string;
  languageTitle: string;
  feed: TermProps[];
  languages: LanguageItem[];
};

const LocaleHome: React.FC<Props> = (props) => {
  return (
    <>
      <Layout>
        {/* Locale notice */}
        <div className="my-8 mx-auto max-w-screen-lg">
          <p className="text-paragraph font-satoshi">
            Viewing in{" "}
            <span className="font-bold">{props.languageTitle}</span>
            {" · "}
            <Link href="/" className="underline underline-offset-4">
              Default version
            </Link>
          </p>
        </div>
        {/* Hero */}
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 rounded-lg min-h-max flex items-center my-24 mx-auto max-w-screen-lg">
          <div className="text-h2 lg:text-h1 font-bold">
            A shared source of truth to build a better future.
          </div>
          <div className="">
            <Image
              src="/g-hero-earth.webp"
              width={500}
              height={500}
              alt="Picture of the Earth"
            />
          </div>
        </div>
        {/* Term types tag cloud */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
            <div className="align-middle text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              Browse by type
            </div>
          </div>
          <div className="flex flex-wrap gap-3 py-9">
            {Object.entries(TERM_TYPE_LABELS).map(([value, label]) => {
              const Icon = TERM_TYPE_ICONS[value];
              return (
                <Link
                  key={value}
                  href={`/terms?type=${encodeURIComponent(value)}&locale=${props.locale}`}
                  className="flex items-center gap-2 text-h3 rounded-full bg-[#FFF] px-4 py-2 font-satoshi hover:bg-gray-100 transition-colors"
                >
                  {Icon && <Icon className="size-5 shrink-0" aria-hidden />}
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        {/* Recent (in this language) */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
            <div className="align-middle text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              Recent
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-9">
            {props.feed.map((term) => {
              const typeKey = (term as { termType?: string }).termType ?? "OTHER";
              const styles = TERM_TYPE_CARD_STYLES[typeKey] ?? TERM_TYPE_CARD_STYLES.OTHER;
              const Icon = TERM_TYPE_ICONS[typeKey] ?? TERM_TYPE_ICONS.OTHER;
              return (
                <Link
                  key={term.id}
                  href={`/terms/${term.id}?locale=${props.locale}`}
                  className={`rounded-2xl ${styles.bg} p-5 min-h-[140px] flex flex-col font-satoshi hover:opacity-95 transition-opacity`}
                >
                  <span className={`text-h4 font-bold ${styles.text} line-clamp-2`}>
                    {term.title}
                  </span>
                  <div className="mt-auto flex justify-end pt-3">
                    <Icon className={`size-8 shrink-0 ${styles.icon}`} aria-hidden />
                  </div>
                </Link>
              );
            })}
          </div>
          {props.feed.length === 0 && (
            <p className="py-9 text-paragraph font-satoshi">
              No terms in this language yet.
            </p>
          )}
        </div>
        {/* Translations */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
            <div className="align-middle text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              Translations
            </div>
          </div>
          <div className="flex flex-wrap gap-3 py-9">
            {props.languages
              .filter((l) => l.i18n)
              .map((lang) => (
                <Link
                  key={lang.id}
                  href={lang.i18n === props.locale ? "#" : `/${lang.i18n}`}
                  className={`text-h3 rounded-full px-4 py-2 font-satoshi transition-colors ${
                    lang.i18n === props.locale
                      ? "bg-gray-200 text-gray-600 cursor-default"
                      : "bg-[#FFF] hover:bg-gray-100"
                  }`}
                >
                  {lang.title}
                </Link>
              ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default LocaleHome;
