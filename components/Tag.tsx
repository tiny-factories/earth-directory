import React from "react";
import Router from "next/router";
import { TagProps } from "../types";

const Tag: React.FC<{ tag: TagProps }> = ({ tag }) => {
  return (
    <div onClick={() => Router.push("/tag/[tagId]", `/tag/${tag.id}`)}>
      <div className="border rounded-full text-xs rounded-lg font-medium p-2 bg-gray-100/20 backdrop-blur-md/10 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
        {tag.title}
      </div>
    </div>
  );
};

export default Tag;
