import React from "react";
import Router from "next/router";

export type TagProps = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  group: string;
  children: string;
};

const Tag: React.FC<{ tag: TagProps }> = ({ tag }) => {
  return (
    <div
      className="inline-flex items-center "
      onClick={() => Router.push("/tags/[id]", `/tags/${tag.id}`)}
    >
      <span className="text-h5 sm:text-h4 md:text-h3 font-bold hover:cursor-pointer">
        {tag.title}
      </span>{" "}
      <div className="bg-[#F3B53F] rounded-full w-3 h-3 align-middle mx-3 inline-block"></div>
    </div>
  );
};

export default Tag;
