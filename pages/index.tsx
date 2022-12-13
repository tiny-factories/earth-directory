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
        <div className="text-center font-bold">
          A shared source of truth to build a better future.{" "}
        </div>
        <div>
          <Link href="https://madefor.earth">
            <a className="font-bold hover:underline">We</a>
          </Link>{" "}
          started a glossary of terms, technologies, policies, and regulations
          around climate change to ...
        </div>
      </div>
      <div className="flex flex-wrap justify-between mb-9 sm:py-9  font-sans">
        <div className="">
          Term <div>{props.result.length}</div>
        </div>
        <div className="">
          in Launguages <div>{props.result.length}</div>
        </div>

        <div className="">
          from Contrinutors <div>{props.result.length}</div>
        </div>
      </div>

      <div className="w-full mb-9 sm:py-9 text-h4 sm:text-h3 md:text-h1 font-sans">
        <div>Brows terms</div>

        <div>
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
                    <a className="inline-block  text-gray-500 font-satoshi hover:font-bold">
                      {term.group}
                    </a>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="w-full mb-9 sm:py-9 text-h4 sm:text-h3 md:text-h1 font-sans">
        <div className="flex flex-wrap border">
          <div className="w-1/2">
            <div className="">New Terms </div>
            <div className="">m3</div>
            <div className="w-full rounded">Add a Term</div>
            <div className="w-1/2">image</div>
          </div>
        </div>

        <div className="border">
          <div>Transalteion</div>
          <div>m3</div>
          <div>m3</div>
        </div>
      </div>

      <div className="w-full mb-9 sm:py-9 text-h4 sm:text-h3 md:text-h1 font-sans">
        Newsletter{" "}
      </div>
    </Layout>
  );
};

export default Home;
