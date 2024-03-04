// Import necessary modules
import React from "react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import Layout from "../../components/Layout";
import prisma from "../../lib/prisma";
import { TermProps } from "../../types";

// Define your React component as usual
const TermPage: React.FC<{ term: TermProps }> = ({ term }) => {
  // Component logic and JSX
  return (
    <Layout>
      <h1 className="text-h4 sm:text-h3 md:sm:text-h1 font-bold font-satoshi border-b-2">
        {term.title}{" "}
      </h1>
      {/* Section Definition */}
      <div className="grid grid-cols-4 gap-4 gap-4 py-9">
        <div className="col-span-4 md:col-span-1 pb-9">
          <div className="text-h5 md:text-h3 font-bold">Definition</div>
          <div className="">
            via{" "}
            {/* <Link href={props.pageData.source.href} className="underline">
              {props.pageData.source.title}
            </Link> */}
          </div>
        </div>
        <div className="col-span-4 md:col-span-3 text-h4 sm:text-h3 md:sm:text-h2">
          {term.content || "Undefinded Term"}
        </div>
      </div>
      {/* Section Simple Example */}
      <div>
        <div className="grid grid-cols-4 gap-4 py-9">
          <div className="col-span-4 md:col-span-1 pb-9">
            <div className="text-h5 md:text-h3 font-bold">TLDR</div>
            <div className="opacity-50 no-underline">
              <Link
                href="https://github.com/tiny-factories/earth-directory/issues/new"
                className="underline"
              >
                Report Issue
              </Link>
            </div>
          </div>
          <div className="col-span-4 md:col-span-3 text-h4 sm:text-h3 md:sm:text-h2 italic">
            {"Coming Soon"}
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
                href="https://github.com/tiny-factories/earth-directory/issues/new"
                className="underline"
              >
                Report Issue
              </Link>
            </div>
          </div>
          <div className="col-span-4 md:col-span-3 text-h4 sm:text-h3 md:sm:text-h2 italic">
            {term?.studies || "Coming Soon"}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Export the component as default
export default TermPage;

// Define and export getServerSideProps separately
export const getServerSideProps: GetServerSideProps = async (context) => {
  const termId = context.params?.termId;

  if (!termId) {
    return { notFound: true };
  }

  await prisma.term.update({
    where: {
      id: String(termId),
    },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  const term = await prisma.term.findUnique({
    where: {
      id: String(termId),
    },
  });

  if (!term) {
    return { notFound: true };
  }

  return {
    props: {
      term: JSON.parse(JSON.stringify(term)),
    },
  };
};
