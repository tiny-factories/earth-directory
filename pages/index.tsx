import type { GetStaticProps } from "next";
import { useState } from "react";
import Link from "next/link";
import React from "react";
import Layout from "../components/Layout";
import Term, { TermProps } from "../components/Term";
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
  result: TermProps[];
  group: string;
};

const Home: React.FC<Props> = (props) => {
  // log term grouping
  // console.log(props);

  return (
    <Layout>
      <div className="w-full mb-9 sm:py-9 text-h4 sm:text-h3 md:text-h1 font-sans">
        We at{" "}
        <Link href="https://madefor.earth">
          <a className="font-bold hover:underline hover:underline-offset-2">
            Made For <span className="text-green">Earth</span>
          </a>
        </Link>{" "}
        think that a shared source of truth is required to build a better
        future. So we started a glossary of terms, technologies, policies, and
        regulations around climate change.
      </div>

      {/* <div className="w-full py-9 text-h2">
        {props.result.length} terms across, {props.result.length} languages,{" "}
        {props.result.length} Topics
      </div> */}

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
       .map((term, index) => (
         <div className="" key={index}>
           <Link href={`#${term.group}`}>
             <a className="inline-block  text-gray-500 font-satoshi hover:font-bold">{term.group}</a>
           </Link>
           <div className=" ">
           </div>
           
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
              .map((term, index) => (
                <div className="" key={index}>
                  <div id={term.group} className="text-h2 font-bold text-gray-500 font-satoshi">
                    {term.group}
                  </div>
                  {term.children
                    .sort(function (a, b) {
                      if (a.group < b.group) {
                        return -1;
                      }
                      if (a.group > b.group) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((term, index) => (
                      <div key={term.id} className="">
                        <Term term={term} />
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
