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
      className=""
      onClick={() => Router.push("/tags/[id]", `/tags/${tag.id}`)}
    >
      <span className="text-h5 sm:text-h4 md:text-h3 inline-flex items-center  font-bold  hover:cursor-pointer">
        {tag.title}
      </span>
    </div>
  );
};

export default Tag;
