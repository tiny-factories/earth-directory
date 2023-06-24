import React from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import Layout from "../../../components/Layout";
// import TagProps from "../../types";
import Term from "../../../components/Term";

import { TagProps } from "../../../components/Tag";
import prisma from "../../../lib/prisma";

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

const Tag: React.FC<TagProps> = (props) => {
  let title = props.title;
  if (!props.published) {
    title = `${title} (Draft)`;
  }

  console.log(props);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:image" content={`/api/og?title=${title}`} />
        {/* <meta property="og:image" content={`/api/og?title=${title}`} /> */}
      </Head>
      <Layout>
        <div className="mx-auto max-w-7xl ">
          <div className="text-h4 sm:text-h3 md:sm:text-h1 font-bold font-satoshi border-b-2">
            Tagged "{title}"
          </div>
          <div className="flex flex-wrap w-full ">
            <div className="pt-3 pb-9 w-full flex justify-between font-bold text-h3">
              {props.terms
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
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tag = await prisma.tag.findUnique({
    where: {
      id: String(params?.id),
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
  return {
    props: tag,
    revalidate: 10,
  };
};

export default Tag;
