import type { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";
import Layout from "../../components/Layout";
import Term, { TermProps } from "../../components/Term";
import prisma from "../../lib/prisma";

type Props = {
  result: TermProps[];
  group: string;
};

const Home: React.FC<Props> = (props) => {
  function getRandomTerm(terms) {
    if (!terms || terms.length === 0) return "N/A";
    const today = new Date().getDate();
    return terms[today % terms.length].title;
  }

  return (
    <Layout>
      <div className="hidden sm:flex flex-wrap w-full justify-between hover:bold">
        <div className="text-h4 sm:text-h3 md:sm:text-h2 font-bold w-full border-b-4 border-black">
          Jump to a <span className="text-[#918180]">section</span>
        </div>
        <div className="pt-3 pb-9 w-full flex flex-wrap justify-between font-bold text-h3">
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
            .map((term, i) => (
              <div className="" key={i}>
                <Link
                  href={`#${term.group}`}
                  className="p-3 text-gray-500 font-satoshi font-normal hover:bg-[#FFF] hover:rounded-lg"
                >
                  {term.group}
                </Link>
              </div>
            ))}
        </div>
      </div>
      <div className="page">
        <main className="snap-y">
          <div className="">
            {props.result
              .sort((a, b) => {
                if (a.group < b.group) {
                  return -1;
                }
                if (a.group > b.group) {
                  return 1;
                }
                return 0;
              })
              .map((term, i) => (
                <div className="" key={term.id || i}>
                  <div
                    id={term.group}
                    className="text-h4 sm:text-h3 md:sm:text-h2 font-bold text-gray-500 font-satoshi"
                  >
                    {term.group}{" "}
                    <span className="text-[#918180]">
                      is for {term.randomTerm}
                    </span>
                  </div>
                  {term.children
                    .sort((a, b) => {
                      if (a.group < b.group) {
                        return -1;
                      }
                      if (a.group > b.group) {
                        return 1;
                      }
                      return 0;
                    })
                    .map((term, i) => (
                      <div key={term.id || i} className="">
                        <Term term={term} />
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </main>
      </div>{" "}
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.term.findMany({
    where: {
      published: true,
    },
  });

  let data = feed.reduce((r, e) => {
    let group = e.title[0];
    if (!r[group]) {
      r[group] = { group, children: [e] };
    } else {
      r[group].children.push(e);
    }
    return r;
  }, {});

  // Now, assign a random term for each group
  for (let group in data) {
    const terms = data[group].children;
    const randomIndex = Math.floor(Math.random() * terms.length);
    data[group].randomTerm = terms[randomIndex].title;
  }

  let result = Object.values(data);

  return {
    props: { result },
    revalidate: 10,
  };
};

export default Home;
