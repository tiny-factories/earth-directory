import React from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Tag from "../components/Tag";

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
      <section>Hero</section>
      <section className="flex flex-wrap">
        {/* Tags */}
        <h1>Tags:</h1>
        <div className="flex flex-wrap">
          {props.tags.map((tag, i) => (
            <div key={i}>
              <Tag tag={tag} />
            </div>
          ))}
        </div>
        <div>posts</div>
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
      <style jsx>{`
        .post {
          background: white;
          transition: box-shadow 0.1s ease-in;
        }

        .post:hover {
          box-shadow: 1px 1px 3px #aaa;
        }

        .post + .post {
          margin-top: 2rem;
        }
      `}</style>
    </Layout>
  );
};

export default HomePage;
