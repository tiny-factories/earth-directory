import React from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Tag from "../components/Tag";
import Post from "../components/Post";

import { TermProps, TagProps } from "../types";

import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  //popularTerms
  const popularTerms = await prisma.term.findMany({
    where: {
      published: true, // Assuming you only want published terms
    },
    orderBy: {
      views: "desc",
    },
    take: 10, // Adjust the number to how many terms you want to fetch
  });

  const recentlyUpdatedTerms = await prisma.term.findMany({
    where: {
      published: true, // Assuming you only want published terms
    },
    orderBy: {
      updatedAt: "desc",
    },
    take: 9, // Fetch the 9 most recently updated records
  });

  const tags = await prisma.tag.findMany({
    where: { published: true },
    include: {
      _count: {
        select: { terms: true }, // This will count the terms associated with each tag
      },
    },
  });

  // After fetching and mapping the tags to include the termsCount
  const tagsWithTermCount = tags.map((tag) => ({
    ...tag,
    termsCount: tag._count.terms,
  }));

  // Sort the tags by termsCount from highest to lowest
  const sortedTags = tagsWithTermCount.sort(
    (a, b) => b.termsCount - a.termsCount
  );

  // Serialize Date objects to strings
  const serializedTerms = recentlyUpdatedTerms.map((term) => ({
    ...term,
    createdAt: term.createdAt.toISOString(),
    updatedAt: term.updatedAt.toISOString(),
  }));

  const popularTermsWithDatesSerialized = popularTerms.map((term) => ({
    ...term,
    createdAt: term.createdAt.toJSON(), // Serialize the date
    updatedAt: term.updatedAt.toJSON(), // Serialize the date, if updatedAt exists
  }));

  return {
    props: {
      recentlyUpdatedTerms: serializedTerms,
      popularTerms: popularTermsWithDatesSerialized,
      tags: sortedTags,
    },
    revalidate: 10,
  };
};

type Props = {
  popularTerms: TermProps[];
  recentlyUpdatedTerms: TermProps[]; // Ensure this matches the structure you expect
  tags: (TagProps & { termsCount: number })[];
};

const HomePage: React.FC<Props> = (props) => {
  return (
    <Layout>
      <section className="flex flex-wap p-3">
        <div className="bg-gray-200 py-16 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end">
            <div className="mb-8 md:mb-0">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                A shared source of truth to build a better future.
              </h1>
            </div>
            <div className="w-full md:w-auto bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add image
              </h2>
            </div>
          </div>
        </div>
      </section>
      {/* Tags Section */}
      <section className="flex flex-wrap p-3">
        <h2 className="w-full border-t-2 inline uppercase font-bold">
          Catagories
        </h2>
        <div className="flex flex-wrap gap-4 ">
          {props.tags.map((tag, i) => (
            <div key={i}>
              <Tag tag={tag} />
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-wrap p-3">
        <h2 className="w-full border-t-2 inline uppercase font-bold">
          New Terms
        </h2>
        <div className="grid grid-rows-1 gap-4">
          {props.recentlyUpdatedTerms.map((term: TermProps, i) => (
            <div key={i}>
              <Post post={term} />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap p-3">
        <h2 className="w-full border-t-2 inline uppercase font-bold">
          Popular Terms
        </h2>
        <div className="grid grid-rows-1 gap-4">
          {props.popularTerms.map((term, i) => (
            <div key={i} className="hover:bg-red-500">
              <Post post={term} />
            </div>
          ))}
        </div>
      </section>
      {/* <section className="p-3">
        Section on the orgs soruces come frrom ?
      </section> */}
    </Layout>
  );
};

export default HomePage;
