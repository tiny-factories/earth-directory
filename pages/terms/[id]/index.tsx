import React from "react";
import Link from "next/link";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Layout from "../../../components/Layout";
import TermCard, { TermProps } from "../../../components/Term";

import prisma from "../../../lib/prisma";

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

const TermPage: React.FC<TermProps> = (props) => {
  let title = props.pageData.title;
  if (!props.pageData.published) {
    title = `${title} (Draft)`;
  }
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          property="og:image"
          content={`/api/og?title=${props.pageData.source.title}`}
        />
        {/* <meta property="og:image" content={`/api/og?title=${title}`} /> */}
      </Head>
      <Layout>
        <div className="mx-auto max-w-7xl ">
          <div className="text-h4 sm:text-h3 md:sm:text-h1 font-bold font-satoshi border-b-2">
            {title}
          </div>
          {/* Section Definition */}
          <div className="grid grid-cols-4 gap-4 gap-4 py-9">
            <div className="col-span-4 md:col-span-1 pb-9">
              <div className="text-h5 md:text-h3 font-bold">Definition</div>
              <div className="">
                via{" "}
                <Link href={props.pageData.source.href} className="underline">
                  {props.pageData.source.title}
                </Link>
              </div>
            </div>
            <div className="col-span-4 md:col-span-3 text-h4 sm:text-h3 md:sm:text-h2">
              {props?.pageData.content || "Undefinded Term"}
            </div>
          </div>
          {/* Section Simple Example */}
          <div>
            <div className="grid grid-cols-4 gap-4 py-9">
              <div className="col-span-4 md:col-span-1 pb-9">
                <div className="text-h5 md:text-h3 font-bold">Example</div>
                <div className="opacity-50 no-underline">
                  <Link
                    href={`/source/${props.sourceId}`}
                    className="underline"
                  >
                    Report Issue
                  </Link>
                </div>
              </div>
              <div className="col-span-4 md:col-span-3 text-h4 sm:text-h3 md:sm:text-h2 italic">
                {props?.pageData.example || "Coming Soon"}
              </div>
            </div>
          </div>
          {/* Section Case Case Studies */}
          <div>
            <div className="grid grid-cols-4 gap-4 py-9">
              <div className="col-span-4 md:col-span-1 pb-9">
                <div className="text-h5 md:text-h3 font-bold">Case Studies</div>
                <div className="opacity-50 no-underline">
                  <Link
                    href={`/source/${props.sourceId}`}
                    className="underline"
                  >
                    Report Issue
                  </Link>
                </div>
              </div>
              <div className="col-span-4 md:col-span-3 text-h4 sm:text-h3 md:sm:text-h2 italic">
                {props?.pageData.studies || "Coming Soon"}
              </div>
            </div>
          </div>
          {/* Section on Related Terms */}

          <div>
            {" "}
            <div className="grid grid-cols-4 gap-4 py-9">
              <div className="col-span-4 md:col-span-1 pb-9">
                <div className="text-h5 md:text-h3 font-bold">
                  Related Terms
                </div>
              </div>
              <div className="col-span-4 md:col-span-3 text-h4 sm:text-h3 md:sm:text-h2 ">
                <div className="flex flex-wrap w-full ">
                  <div className="pt-3 pb-9 w-full flex flex-wrap justify-between font-bold text-h3">
                    {props.realtedTerms
                      .sort(function (a, b) {
                        if (a.group < b.group) {
                          return -1;
                        }
                        if (a.group > b.group) {
                          return 1;
                        }
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
                              if (a.group < b.group) {
                                return -1;
                              }
                              if (a.group > b.group) {
                                return 1;
                              }
                              return 0;
                            })
                            .map((term, i) => (
                              <div key={i} className="">
                                <TermCard term={term} />
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const pageData = await prisma.term.findFirst({
    where: {
      id: String(params?.id),
    },
    include: {
      source: {
        select: {
          title: true,
          href: true,
        },
      },
    },
  });

  const tag = await prisma.tag.findFirst({
    where: {
      id: String(pageData?.tagId),
    },
    include: {
      terms: {
        select: {
          title: true,
          id: true,
        },
      },
    },
  });

  let sameTag = tag?.terms.reduce((r, e) => {
    let group = e.title[0];
    if (!r[group]) r[group] = { group, children: [e] };
    else r[group].children.push(e);
    return r;
  }, {});

  let realtedTerms = Object.values(sameTag);

  return {
    props: { pageData, realtedTerms },
    revalidate: 10,
  };
};

export default TermPage;
