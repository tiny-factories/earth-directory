// Import necessary modules
import React from "react";
import { GetServerSideProps } from "next";
import prisma from "../../lib/prisma"; // Adjust the import path to your setup

// Define your React component as usual
const TermPage: React.FC<{ term: any }> = ({ term }) => {
  // Component logic and JSX
  return (
    <div>
      <h1>{term.title}</h1>
      {/* Render the rest of your term content */}
    </div>
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
