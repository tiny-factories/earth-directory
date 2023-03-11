import React from "react";
import Router from "next/router";

export type SourceProps = {
  id: string;
  title: string;
  content: string;
  href: string;
  published: boolean;
};

const Source: React.FC<{ source: SourceProps }> = ({ source }) => {
  return (
    <div
      className="text-h4 sm:text-h3 md:sm:text-h1 font-satoshi border-t border-black snap-center py-3"
      onClick={() => Router.push("/sources/[id]", `/sources/${source.id}`)}
    >
      <div className="hover:translate-x-3 transform-gpu hover:duration-200">
        {source.title} <span className="">→</span>
      </div>
    </div>
  );
};

export default Source;
