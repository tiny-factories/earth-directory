import React from "react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import Layout from "../../components/Layout";
import Router from "next/router";
import { TermProps } from "../../components/Term";
import prisma from "../../lib/prisma";

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const term = await prisma.term.findUnique({
    where: {
      id: String(params?.id),
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
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

  // Send to LogSnag
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", "Bearer 38bda3ca0d6426843a5198606b89019b");

  var raw = JSON.stringify({
    project: "made-for-earth",
    channel: "glossary",
    event: "Term Viewed",
    description: title,
    icon: "📚",
    notify: false,
  });

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  fetch("https://api.logsnag.com/v1/log", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta property="og:image" content={`/api/og?title=${title}`} />
      </Head>
      <Layout>
        <div className="mx-auto max-w-7xl ">
          <div className="text-h4 sm:text-h3 md:sm:text-h1 font-bold font-satoshi ">
            {title}
          </div>
          <div className="text-h4 sm:text-h3 md:sm:text-h2">
            {props?.content || "Undefinded Term"}
          </div>

          {/* <div>From a Scientist</div> */}

          {/* <div>Related Terms</div> */}

          <div></div>
        </div>
        <style jsx>{`
          .page {
            background: white;
            padding: 2rem;
          }
          .actions {
            margin-top: 2rem;
          }
          button {
            background: #ececec;
            border: 0;
            border-radius: 0.125rem;
            padding: 1rem 2rem;
          }
          button + button {
            margin-left: 1rem;
          }
        `}</style>
      </Layout>
    </>
  );
};

export default Term;
