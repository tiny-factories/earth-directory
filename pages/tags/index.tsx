import type { GetStaticProps } from "next";
import { useState } from "react";
import Link from "next/link";
import React from "react";
import Layout from "../../components/Layout";
import Tag, { TagProps } from "../../components/Tag";
import prisma from "../../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.tag.findMany({
    where: {
      published: true,
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
  result: TagProps[];
  group: string;
};

const Home: React.FC<Props> = (props) => {
  return (
    <Layout>
      <div className="flex w-full justify-between hover:bold">
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
          .map((tag, i) => (
            <div className="" key={i}>
              <Link href={`#${tag.group}`}>
                <div className="inline-block  text-gray-500 font-satoshi hover:font-bold">
                  {tag.group}
                </div>
              </Link>
            </div>
          ))}
      </div>

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
              .map((tag, i) => (
                <div className="" key={i}>
                  <div
                    id={tag.group}
                    className="text-h2 font-bold text-gray-500 font-satoshi"
                  >
                    {tag.group}
                  </div>
                  {tag.children
                    .sort(function (a, b) {
                      if (a.group < b.group) {
                        return -1;
                      }
                      if (a.group > b.group) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((tag, i) => (
                      <div key={i} className="">
                        <Tag tag={tag} />
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

export default Home;
