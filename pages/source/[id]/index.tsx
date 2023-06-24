import React from "react";
import Link from "next/link";
import type { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import Layout from "../../../components/Layout";
import { TermProps } from "../../../components/Term";
import prisma from "../../../lib/prisma";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const term = await prisma.source.findFirst({
    where: {
      id: String(params?.id),
    },
  });
  return {
    props: term,
    revalidate: 10,
  };
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

const Term: React.FC<TermProps> = (props) => {
  let title = props.title;
  if (!props.published) {
    title = `${title} (Draft)`;
  }

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
            <Link href={props.href}>{title} ↗</Link>{" "}
          </div>
          <div className="grid grid-cols-4">
            {/* <div className="col-span-1">
              <div className="">Overview</div>
              <div className="">
                via{" "}
                <Link
                  href={props?.content || "Undefinded Term"}
                  className="underline"
                >
                  {props?.content || "Undefinded Term"}
                </Link>
              </div>
            </div> */}
            <div className="col-span-3 text-h4 sm:text-h3 md:sm:text-h2">
              {props?.content || "Undefinded Term"}
            </div>
          </div>

          {/* <div>From a Scientist</div> */}

          {/* <div>Related Terms</div> */}

          <div></div>
        </div>
      </Layout>
    </>
  );
};

export default Term;
