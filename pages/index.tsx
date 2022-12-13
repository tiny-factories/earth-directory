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
  return (
    <Layout>
      <div className="w-full mb-9 sm:py-9 text-h4 sm:text-h3 md:text-h1 font-sans">
        <div className="text-center font-bold">
          A shared source of truth to build a better future.{" "}
        </div>
        {/* <div className="text-h4">
          <Link href="https://madefor.earth">
            <a className="font-bold hover:underline">We</a>
          </Link>{" "}
          started a glossary of terms, technologies, policies, and regulations
          around climate change to help us with out research an
        </div> */}
      </div>
      {/* <div className="flex flex-wrap justify-between mb-9 sm:py-9  font-sans">
        <div className="">
          <div>180</div>
          <div>Terms</div>
        </div>
        <div className="">
          <div>3</div>
          <div>Languages</div>
        </div>

        <div className="">
          <div>8</div>
          <div>Contrinutors</div>
        </div>
      </div> */}

      {/* <div className="w-full mb-9 sm:py-9 text-h4 sm:text-h3 md:text-h1 font-sans">

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
                  <Link href={`/terms#${term.group}`}>
                    <a className="inline-block  text-gray-500 font-satoshi hover:font-bold">
                      {term.group}
                    </a>
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div> */}

      <div className="w-full mb-9 sm:py-9 font-sans">
        <div className="flex flex-wrap py-9">
          <div className="w-full sm:w-1/2 ">
            <div className="text-h4 sm:text-h3 md:text-h2 font-bold">
              Add a Term
            </div>
            <div className="text-base sm:text-h4 md:text-h3">
              Don’t see a term, technologies, or policy? Send it to us and we
              can add it to our growing database.
            </div>
          </div>
          <div className="w-full sm:w-1/2">image</div>
        </div>

        <div className="flex flex-wrap py-9">
          <div className="w-full sm:w-1/2">m3</div>
          <div className="w-full sm:w-1/2">
            <div className="text-h4 sm:text-h3 md:text-h2 font-bold">
              Help Translate
            </div>
            <div className="text-base sm:text-h4 md:text-h3">
              To better communicate with one another we need are working to
              translate our glossary to more launguaes and would love you help!
            </div>
          </div>
        </div>
      </div>

      {/* <div className="w-full mb-9 sm:py-9 font-sans">
        <div className="mx-auto max-w-7xl py-24 px-4 sm:px-6 lg:flex lg:items-center lg:py-32 lg:px-8">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-h4 sm:text-h3 md:text-h1 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Newsletter
            </h2>
          </div>
          <div className="mt-8 lg:mt-0 lg:ml-8">
            <form
              className="sm:flex"
              action="https://buttondown.email/api/emails/embed-subscribe/madeforearth"
              method="post"
              target="popupwindow"
              onSubmit="window.open('https://newsletter.madefor.earth', 'popupwindow')"
            >
              <label htmlFor="email-address" for="bd-email" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-md border border-gray-300 px-5 py-3 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:max-w-xs"
                placeholder="Enter your email"
              />
              <input type="hidden" name="tag" value="Glossary → Feature" />

              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-5 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Notify me
                </button>
              </div>
            </form>
          </div>
        </div>
      </div> */}
    </Layout>
  );
};

export default Home;
