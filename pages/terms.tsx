import React, { useState } from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import { TermProps, TagProps } from "../types";
import Term from "../components/Term";

import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.term.findMany({
    where: { published: true },
    select: {
      id: true,
      sourceId: true,
      title: true, // Use 'name' here instead if that's the actual field name
      tagId: true, // Assuming there's a direct relation via tagId
      // If you need to include data from the related Tag model, use 'include' instead
    },
  });

  const tags = await prisma.tag.findMany({
    where: { published: true },
    include: {
      _count: {
        select: { terms: true }, // This will count the terms associated with each tag
      },
    },
  });

  // const sources = await prisma.source.findMany({
  //   where: { published: true },
  //   include: {
  //     _count: {
  //       select: { terms: true }, // This will count the terms associated with each tag
  //     },
  //   },
  // });

  // After fetching and mapping the tags to include the termsCount
  const tagsWithTermCount = tags.map((tag) => ({
    ...tag,
    termsCount: tag._count.terms,
  }));

  // Sort the tags by termsCount from highest to lowest
  const sortedTags = tagsWithTermCount.sort(
    (a, b) => b.termsCount - a.termsCount
  );

  return {
    props: { feed, tags: sortedTags },
    revalidate: 10,
  };
};

type Props = {
  feed: TermProps[];
  tags: (TagProps & { termsCount: number })[]; // Update the type to include the termsCount
};

const Blog: React.FC<Props> = (props) => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle function for tags
  const toggleTag = (tagId: string) => {
    setSelectedTags(
      (currentSelectedTags) =>
        currentSelectedTags.includes(tagId)
          ? currentSelectedTags.filter((id) => id !== tagId) // Remove tag if it's already selected
          : [...currentSelectedTags, tagId] // Add tag if it's not selected
    );
  };

  // Filter feed based on selected tags
  const filteredFeed = props.feed.filter(
    (post) =>
      (selectedTags.length === 0 ? true : selectedTags.includes(post.tagId)) &&
      (searchTerm === ""
        ? true
        : post.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Enhanced grouping logic with random term selection
  const groupedTerms = filteredFeed
    .sort((a, b) => a.title.localeCompare(b.title))
    .reduce((acc, term) => {
      const group = term.title[0].toUpperCase();
      if (!acc[group]) {
        acc[group] = {
          terms: [],
          randomTerm: null,
        };
      }
      acc[group].terms.push(term);
      // Randomly select a term for the group if not already selected
      if (
        !acc[group].randomTerm ||
        Math.random() < 1 / acc[group].terms.length
      ) {
        acc[group].randomTerm = term.title;
      }
      return acc;
    }, {});

  return (
    <Layout>
      <section>Hero</section>
      <section className="flex flex-wrap p-3">
        {/* Search Box */}
        <div className="w-full">
          <input
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input w-full rounded" // Tailwind classes for styling
          />
        </div>
        {/* Tags */}
        <div className="w-full border-t-2 border-black inline uppercase font-bold">
          Tag Filter
        </div>
        <div className="flex flex-wrap">
          <div className="w-100">
            {/* <div className="border rounded-full pl-2 pr-1">
              All <span className="border rounded-full px-2">100</span>
            </div> */}
          </div>
          {props.tags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`cursor-pointer border rounded-full pl-2 pr-1 m-1 hover:bg-brand-selected hover:bg-opacity-75 ${
                selectedTags.includes(tag.id)
                  ? "bg-brand-selected "
                  : " text-gray-800 "
              }`}
            >
              <p>
                {tag.title}{" "}
                <span className="border rounded-full px-2 slashed-zero">
                  {tag.termsCount}
                </span>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="p-3 grid row-span-1 gap-4">
        <div className="w-full border-t-2 border-black inline uppercase font-bold">
          Terms
        </div>
        {Object.entries(groupedTerms).map(([group, { terms, randomTerm }]) => (
          <div key={group} className="">
            <div
              id={group}
              className="text-h4 sm:text-h3 md:sm:text-h2 font-bold text-gray-500 font-satoshi"
            >
              {group}{" "}
              <span className="text-[#918180]">is for {randomTerm}</span>
            </div>
            {terms.map((term) => (
              <div key={term.id} className="">
                <Term data={term} />
              </div>
            ))}
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default Blog;
