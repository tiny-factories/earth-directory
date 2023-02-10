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
    <div className="" onClick={() => Router.push("#", `#`)}>
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        {tag.title}
      </span>
    </div>
  );
};

export default Tag;
