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
      className="text-h4 sm:text-h3 md:sm:text-h2 font-satoshi border-t-4 border-black snap-center py-3 cursor-pointer"
      onClick={() => Router.push("/terms/[title]", `/terms/${term.id}`)}
    >
      <div className="flex justify-between  hover:duration-200 hover:bg-[#FFF] hover:rounded-lg ">
        <div>
          {term.sponsor ? (
            <>
              {term.title} <span className="text-[#fd8841]">🞾</span>
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
