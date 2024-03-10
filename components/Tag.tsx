import React from "react";
import Router from "next/router";
import { TagProps } from "../types";
// import ReactMarkdown from "react-markdown";

const Tag: React.FC<{ tag: TagProps }> = ({ tag }) => {
  return (
    <div onClick={() => Router.push("/tag/[tagId]", `/tag/${tag.id}`)}>
      <h2>{tag.title}</h2>
      {/* <ReactMarkdown children={tag.content} /> */}
    </div>
  );
};

export default Tag;
