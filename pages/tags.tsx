import React from "react";
import { GetStaticProps } from "next";
import Link from "next/link";
import Layout from "../components/Layout";
import { TermProps, TagProps } from "../types";
import Tag from "../components/Tag";

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
      tags: sortedTags.filter((tag) => tag.termsCount > 0), // Filter out tags with 0 terms
    },
    revalidate: 10,
  };
};

type Props = {
  popularTerms: TermProps[];
  tags: (TagProps & { termsCount: number })[]; // Update the type to include the termsCount
};

const TagsPage: React.FC<Props> = (props) => {
  return (
    <Layout>
      <section>Hero</section>
      <section className="flex flex-wrap">
        {/* Tags */}
        <h1>Tags:</h1>
        <div className="grid grid-cols-3 gap-4 w-full">
          {props.tags.map((tag) => (
            <Tag key={tag.id} data={tag} />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default TagsPage;
