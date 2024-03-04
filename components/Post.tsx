import React from "react";
import Router from "next/router";
import { TermProps } from "../types";
// import ReactMarkdown from "react-markdown";

const Post: React.FC<{ post: TermProps }> = ({ post }) => {
  return (
    <div onClick={() => Router.push("/term/[termId]", `/term/${post.id}`)}>
      <h2>{post.title}</h2>
      {/* <ReactMarkdown children={post.content} /> */}
    </div>
  );
};

export default Post;
