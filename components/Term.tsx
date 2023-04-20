import React from "react";
import Router from "next/router";

export type TermProps = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  sponsor: boolean;
  sourceId: string;
};

const Term: React.FC<{ term: TermProps }> = ({ term }) => {
  return (
    <div
      className="text-h4 sm:text-h3 md:sm:text-h2 font-satoshi border-t-4 border-black snap-center py-3"
      onClick={() => Router.push("/terms/[title]", `/terms/${term.id}`)}
    >
      <div className="flex justify-between hover:translate-x-3 transform-gpu hover:duration-200">
        <div>
          {term.sponsor ? (
            <>
              {term.title} <span className="text-[#FE4E00]">🞾</span>
            </>
          ) : (
            <>{term.title} </>
          )}
        </div>

        <span className="">→</span>
      </div>
    </div>
  );
};

export default Term;
