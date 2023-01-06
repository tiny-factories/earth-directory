import React from "react";
import Router from "next/router";

export type EarthAPIProps = {
  id: string;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
};

const Term: React.FC<{ term: EarthAPIProps }> = ({ term }) => {
  return (
    <div
      className="text-h4 sm:text-h3 md:sm:text-h1 font-satoshi border-t border-black snap-center py-3"
      onClick={() => Router.push("/term/[id]", `/term/${term.id}`)}
    >
      <div className="hover:translate-x-3 transform-gpu hover:duration-200">
        {term.title} <span className="">→</span>
      </div>
    </div>
  );
};

export default Term;
