import React from "react";
import type { GetStaticProps } from "next";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout";
import Router from "next/router";
import { TermProps } from "../../components/Term";
import prisma from "../../lib/prisma";
import { useSession } from "next-auth/react";

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

async function publishTerm(id: number): Promise<void> {
  await fetch(`/api/publish/${id}`, {
    method: "PUT",
  });
  await Router.push("/");
}

async function deleteTerm(id: number): Promise<void> {
  await fetch(`/api/term/${id}`, {
    method: "DELETE",
  });
  await Router.push("/");
}

const Term: React.FC<TermProps> = (props) => {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <div>Authenticating ...</div>;
  }
  const userHasValidSession = Boolean(session);
  const termBelongsToUser = session?.user?.email === props.author?.email;
  let title = props.title;
  if (!props.published) {
    title = `${title} (Draft)`;
  }

  return (
    <Layout>
      <div>
        <h2 className="text-lg font-bold font-satoshi ">{title}</h2>
        <p>{props?.content || "Undefinded Term"}</p>
        {!props.published && userHasValidSession && termBelongsToUser && (
          <button onClick={() => publishTerm(props.id)}>Publish</button>
        )}
        {userHasValidSession && termBelongsToUser && (
          <button onClick={() => deleteTerm(props.id)}>Delete</button>
        )}
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
  );
};

export default Term;
