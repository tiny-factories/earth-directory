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
      className="text-h3 rounded-lg bg-[#FFF] p-3 cursor-pointer"
      onClick={() => Router.push("/tags/[id]", `/tags/${tag.id}`)}
    >
      {tag.title}
    </div>
  );
};

export default Tag;
