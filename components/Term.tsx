import React from "react";
import Router from "next/router";

export type TermProps = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  sponsor: boolean;
  sourceId: string;
  group: any;
  children: any;
  notice: any;
};

const TermCard: React.FC<{ term: TermProps }> = ({ term }) => {
  return (
    <div
      className="group text-h4 sm:text-h3 md:sm:text-h2 font-satoshi border-t border-gray-500 snap-center py-3 cursor-pointer duration-100"
      onClick={() => Router.push("/terms/[title]", `/terms/${term.id}`)}
    >
      <div className="flex justify-between  hover:duration-200 hover:bg-[#FFF] hover:rounded-lg">
        <div className="group-hover:translate-x-3 duration-100">
          {term.sponsor ? (
            <>
              {term.title} <span className="text-[#fd8841]">🞾</span>
            </>
          ) : (
            <>{term.title} </>
          )}
        </div>

        <span className="group-hover:-translate-x-3 duration-100">→</span>
      </div>
    </div>
  );
};

export default TermCard;
