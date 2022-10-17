import React from "react";
import Router from "next/router";

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  return (
    <div
      className="text-lg font-satoshi border-t border-black snap-center "
      onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}
    >
      <div className="hover:translate-x-3 transform-gpu hover:duration-200">
        {post.title} <span className="">→</span>
      </div>
    </div>
  );
};

export default Post;
