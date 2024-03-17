import React from "react";
import Router from "next/router";
import { TagProps } from "../types";
// import ReactMarkdown from "react-markdown";

const Tag: React.FC<{ data: TagProps }> = ({ data }) => {
  return (
    <div
      className="flex items-center space-x-4 cursor-pointer w-full border border-black"
      onClick={() => Router.push("/tag/[tagId]", `/tag/${data.id}`)}
    >
      {/* Thumbnail Image */}
      <div className="flex-shrink-0 border-r border-black">
        <img
          src={data.thumbnailUrl}
          alt={data.title}
          className="h-12 w-12 object-cover rounded-full"
        />
      </div>

      {/* Text Content */}
      <div className="flex-grow">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {data.title}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {/* {data.content?} Description */}
          description
        </div>
      </div>
    </div>
  );
};

export default Tag;
