import React from "react";
import Router from "next/router";
import { TermProps } from "../types";
// import ReactMarkdown from "react-markdown";

const Post: React.FC<{ post: TermProps }> = ({ post }) => {
  return (
    <div
      key={post.id}
      onClick={() => Router.push("/term/[termId]", `/term/${post.id}`)}
      className="text-h2 text-brand-dark-gray dark:text-brand-light-gray leading-[114%] -tracking-[0.03em] font-normal relative hover:"
    >
      <span>{post.title}</span>
      <span>→</span>
      {/* <ReactMarkdown children={post.content} /> */}
    </div>
  );
};

export default Post;
