import React from "react";
import type { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.term.findMany({
    where: {
      published: true,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  let data = feed.reduce((r, e) => {
    let group = e.title[0];
    if (!r[group]) r[group] = { group, children: [e] };
    else r[group].children.push(e);
    return r;
  }, {});

  let result = Object.values(data);

  {
    /* console.log(result); */
  }

  return {
    props: { result },
    revalidate: 10,
  };
};

type Props = {
  result: PostProps[];
  group: [];
};

const Blog: React.FC<Props> = (props) => {
  console.log(props);

  return (
    <Layout>
      <div className="page">
        <main className="snap-y">
          {/* <div>Hero {props.result.length} </div> */}
          <div className="">
            {props.result
              .sort(function (a, b) {
                if (a.group < b.group) {
                  return -1;
                }
                if (a.group > b.group) {
                  return 1;
                }
                return 0;
              })
              .map((post, index) => (
                <div className="" key={index}>
                  <div className="text-lg font-bold text-gray-500 font-satoshi ">
                    {post.group}
                  </div>
                  {post.children
                    .sort(function (a, b) {
                      if (a.group < b.group) {
                        return -1;
                      }
                      if (a.group > b.group) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((term) => (
                      <div key={term.id} className="post">
                        <Post post={term} />
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Blog;
