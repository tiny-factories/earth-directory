import React from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Layout from "../../../components/Layout";
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
            {title}
          </div>
          <div className="grid grid-cols-4 py-9">
            Future List of words for tag {title}
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const tag = await prisma.tag.findFirst({
    where: {
      id: String(params?.id),
    },
  });
  return {
    props: tag,
    revalidate: 10,
  };
};

export default Tag;
