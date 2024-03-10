import React, { useState } from "react";
import { GetStaticProps } from "next";
import Layout from "../components/Layout";
import { TermProps, TagProps } from "../types";
import Post from "../components/Post";

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

  return (
    <Layout>
      <section>Hero</section>
      <section className="flex flex-wrap">
        {/* Search Box */}
        <div className="w-100">
          <input
            type="text"
            placeholder="Search terms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input w-100" // Tailwind classes for styling
          />
        </div>
        {/* Tags */}

        <div className="flex flex-wrap">
          {props.tags.map((tag) => (
            <div
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`tag ${
                selectedTags.includes(tag.id)
                  ? "bg-blue-500 text-white" // Styles for selected (toggled on) tag
                  : "bg-blue-200 text-blue-900" // Styles for unselected (toggled off) tag
              } cursor-pointer rounded-lg p-2 m-1`}
            >
              <p>
                {tag.title} :: {tag.termsCount}
              </p>
            </div>
          ))}
        </div>
        <div>posts</div>
      </section>

      <div className="page">
        <main>
          {filteredFeed.length > 0 ? (
            filteredFeed.map((post) => (
              <div key={post.id} className="post">
                <Post post={post} />
              </div>
            ))
          ) : (
            <p>No posts available for the selected tags or search term.</p>
          )}
        </main>
      </div>
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

export default Blog;
