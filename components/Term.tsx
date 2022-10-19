import React from "react";
import Router from "next/router";

export type TermProps = {
  id: string;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
};

const Term: React.FC<{ term: TermProps }> = ({ term }) => {
  return (
    <div
      className="text-lg font-satoshi border-t border-black snap-center "
      onClick={() => Router.push("/p/[id]", `/p/${term.id}`)}
    >
      <div className="hover:translate-x-3 transform-gpu hover:duration-200">
        {term.title} <span className="">→</span>
      </div>
    </div>
  );
};

export default Term;
