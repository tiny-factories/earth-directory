import React from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import Layout from "../components/Layout";
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
  tags: (TagProps & { termsCount: number })[]; // Update the type to include the termsCount
};

const HomePage: React.FC<Props> = (props) => {
  return (
    <Layout>
      <section>Hero</section>
      <section className="flex flex-wrap">
        {/* Tags */}
        <h1>Tags:</h1>
        <div className="flex flex-wrap">
          {props.tags.map((tag) => (
            <Link href="#" key={tag.id}>
              <div className="bg-blue-500 text-white cursor-pointer rounded-lg p-2 m-1">
                {tag.title} :: {tag.termsCount}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
