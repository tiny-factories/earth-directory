import React from "react";
import Router from "next/router";

export type TagProps = {
  id: string;
  title: string;
  content: string;
  published: boolean;
};

const Tag: React.FC<{ tag: TagProps }> = ({ tag }) => {
  return (
    <div
      className=""
      onClick={() => Router.push("/tags/[id]", `/tags/${tag.id}`)}
    >
      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 border hover:scale-105 hover:text-[#efefef] hover:bg-[#000000] hover:cursor-pointer">
        {tag.title}
      </span>
    </div>
  );
};

export default Tag;
