// pages/tag/[id].tsx
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma";
import React from "react";
import Layout from "../../components/Layout";
import Post from "../../components/Post";
import { TagProps, SerializedTermProps } from "../../types/index";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params;

  const tag = await prisma.tag.findUnique({
    where: { id: String(id) },
    include: {
      terms: true,
    },
  });

  let serializedTerms: SerializedTermProps[] = [];

  if (tag && tag.terms) {
    // Serialize Date objects in terms array
    serializedTerms = tag.terms.map((term) => ({
      ...term,
      createdAt: term.createdAt.toISOString(),
      updatedAt: term.updatedAt.toISOString(),
    }));
  }

  // Ensures serialization compatibility for the tag, excluding terms
  const serializedTag = JSON.parse(JSON.stringify(tag));

  return {
    props: {
      tag: serializedTag,
      serializedTerms, // Pass serialized terms separately
    },
  };
};

interface TagPageProps {
  tag: Omit<TagProps, "terms"> & { title: string }; // Assuming title is a required field for display
  serializedTerms: SerializedTermProps[];
}

const TagPage: React.FC<TagPageProps> = ({ tag, serializedTerms }) => {
  // Early return or handling if tag is null
  if (!tag) {
    return (
      <Layout>
        <p>Tag not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="p-3">
        <h1 className="text-h1 font-bold">{tag.title}</h1>
        <div className="text-p">Tag description</div>
      </section>
      {/* Terms Section */}
      <section className="p-3">
        <div className="text-h2">Terms:</div>
        {serializedTerms.map((term) => (
          <Post post={term} />
        ))}
      </section>
    </Layout>
  );
};

export default TagPage;
