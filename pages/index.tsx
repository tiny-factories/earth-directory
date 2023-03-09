import type { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";
import Layout from "../components/Layout";
import Term, { TermProps } from "../components/Term";
import Tag, { TagProps } from "../components/Tag";

import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const apiToday = await fetch("http://api.madefor.earth/api/today");
  const todaysatmosphericReadings = await apiToday.json();

  const feed = await prisma.term.findMany({
    where: {
      published: true,
    },
  });

  const allTerms = await prisma.term.findMany({
    where: {
      published: true,
    },
  });

  const allSources = await prisma.source.findMany({
    where: {
      published: true,
    },
  });

  const allLanguages = await prisma.language.findMany({
    where: {
      published: true,
    },
  });

  const allTags = await prisma.tag.findMany({
    where: {
      published: true,
    },
  });

  let numberOfTerms = allTerms.length;
  let numberOfLanguages = allLanguages.length;
  let numberOfContributors = allSources.length;
  let atmosphericReadings = Object.values(todaysatmosphericReadings);

  return {
    props: {
      numberOfTerms,
      numberOfLanguages,
      numberOfContributors,
      allTags,
      atmosphericReadings,
      // result,
      feed,
    },
    revalidate: 10,
  };
};

type Props = {
  numberOfTerms: string;
  numberOfLanguages: string;
  numberOfContributors: string;
  atmosphericReadings: TermProps[];
  allTags: TermProps[];
  feed: TermProps[];
  group: string;
};

const Home: React.FC<Props> = (props) => {
  return (
    <>
      <Layout>
        {/* Hero */}

        <div className="bg-[#FEF2E7] grid grid-cols-1 md:grid-cols-2 gap-4 rounded-lg md:p-24 min-h-max">
          <div className="">
            <div className="text-h3 md:text-h2 lg:text-h1 md:text-h1 font-bold font-satoshi">
              A shared source of truth to build a better future.
            </div>

            <div className="text-h5 sm:text-h4 md:text-h3">
              As awareness of the climate crysis increases, so does the noise
              and origin of informaiton. We are working to make a glossary of
              terms, agreements, companies, orginizations and more.
            </div>
          </div>
          <div className="bg-[#F3B53F] rounded-full"></div>
        </div>

        {/* Explore */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-2">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-9 h-9 align-middle pr-3 inline-block"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clipRule="evenodd"
              />
            </svg> */}

            {/* <div className="bg-[#F3B53F] rounded-full w-9 h-9 align-middle mr-3 inline-block"></div> */}
            <div className="align-middle text-h4 sm:text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              Explore
            </div>
          </div>
          <div className="flex flex-wrap py-9">
            <div className="w-full text-h5 sm:text-h4 md:text-h3">
              As awareness of the climate crysis increases, so does the noise
              and origin of informaiton. We are working to make a glossary of
              terms, agreements, companies, orginizations and more.
            </div>

            <div className="pt-9 flex flex-wrap w-full justify-between">
              {props.allTags.map((tag, i) => {
                return (
                  <div key={i} className="pl-0:first-child p-3 ">
                    <Tag tag={tag} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* grow */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-2">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-9 h-9 align-middle pr-3 inline-block"
            >
              <path
                fillRule="evenodd"
                d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
                clipRule="evenodd"
              />
            </svg> */}
            {/* <div className="bg-[#F3B53F] rounded-full w-9 h-9 align-middle mr-3 inline-block"></div>*/}
            <span className="align-middle text-h4 sm:text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              grow
            </span>
          </div>

          <div className="py-9 text-h5 sm:text-h4 md:text-h3">
            We take seggestions from our community and verify them before adding
            them to the glossary, Anyone can recommend a term via
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="">
              <div className="text-h4 py-2 font-bold hover:scale-105 hover:text-[#efefef] hover:bg-[#000000] hover:cursor-pointer">
                Add a Term
              </div>

              <div className="">
                We take seggestions from our community and verify them before
                adding them to the glossary.
              </div>

              <div className="">
                <Link href="https://form.typeform.com/to/lowIfjl5">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Add Term <span className="font-mono pl-1"> ↗</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="">
              <div className="text-h4 py-2 font-bold">Help Translate</div>
              <div className="">
                since the climate crysis is a global issue we are working on
                translting our glossary into multiple launguages with context
                specific examples for given regions.
              </div>
              <div className="">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base hover:scale-105 hover:text-[#efefef] hover:bg-[#000000] hover:cursor-pointer"
                >
                  Sign Up <span className="font-mono pl-1">↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* contribute */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-2">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-9 h-9 align-middle pr-3 inline-block"
            >
              <path
                fillRule="evenodd"
                d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
                clipRule="evenodd"
              />
              <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
            </svg> */}
            {/*<div className="bg-[#F3B53F] rounded-full w-9 h-9 align-middle mr-3 inline-block"></div>*/}
            <div className="align-middle text-h4 sm:text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              contribute
            </div>
          </div>

          <div className="py-9 text-h5 sm:text-h4 md:text-h3">
            We are still small but everything needs to start somewhere, as we
            grow we want to co-create the future of this project with the{" "}
            <Link
              href="https://madefor.earth"
              className="underline underline-offset-2"
            >
              MadeFor<span className="text-[#007D00]">Earth</span>
            </Link>{" "}
            community. Maybe some day there is an API, Twitter bot, or we are
            signted in a future un treaty, who knows! But for now her are some
            numbers.
          </div>

          <div className="py-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border-2 rounded p-9">
              {" "}
              <div className="text-h4 sm:text-h3 md:text-h1 font-bold block">
                {props.numberOfTerms}
              </div>
              <div className="block">glossary terms</div>
            </div>

            <div className="border-2 rounded p-9">
              {" "}
              <div className="text-h4 sm:text-h3 md:text-h1  font-bold block">
                {props.numberOfContributors}
              </div>
              <div className="block">contrinutors</div>
            </div>

            <div className="border-2 rounded p-9">
              {" "}
              <div className="text-h4 sm:text-h3 md:text-h1  font-bold block">
                {props.numberOfLanguages}
              </div>
              <div className="block">languages</div>
            </div>
          </div>
        </div>

        {/* sponsorship*/}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-2">
            {/*<svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-9 h-9 align-middle pr-3 inline-block"
            >
              <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
              <path
                fillRule="evenodd"
                d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
                clipRule="evenodd"
              />
              <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
            </svg>*/}
            {/* <div className="bg-[#F3B53F] rounded-full w-9 h-9 align-middle mr-3 inline-block"></div>*/}
            <div className="align-middle text-h4 sm:text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              sponsor
            </div>
          </div>
          <div className="py-9 text-h5 sm:text-h4 md:text-h3">
            Are you a climate company? Then apply to be added to our climate
            glossary as a sponsor.{" "}
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
            <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
              <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16">
                <div className="mx-auto max-w-xs px-8">
                  <p className="text-base font-semibold text-gray-600">
                    Pay once, own it forever
                  </p>
                  <p className="mt-6 flex items-baseline justify-center gap-x-2"></p>
                  <Link href="https://form.typeform.com/to/NVs38SdG">
                    Sponsor Us
                  </Link>
                  <p className="mt-6 text-xs leading-5 text-gray-600">
                    Company
                  </p>
                </div>
              </div>
            </div>
          </div>{" "}
        </div>

        {/* you made it*/}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-2">
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-9 h-9 align-middle pr-3 inline-block"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 00-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 01-.189-.866c0-.298.059-.605.189-.866zm2.023 6.828a.75.75 0 10-1.06-1.06 3.75 3.75 0 01-5.304 0 .75.75 0 00-1.06 1.06 5.25 5.25 0 007.424 0z"
                clipRule="evenodd"
              />
            </svg> */}
            {/*  <div className="bg-[#F3B53F] rounded-full w-9 h-9 align-middle mr-3 inline-block"></div>*/}
            <div className="align-middle text-h4 sm:text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              you made it
            </div>
          </div>

          <div className="py-9  text-h5 sm:text-h4 md:text-h3">
            welcome to the bottom of the page, give you self a 🖐️. This was made
            by{" "}
            <Link href="https://tinyfactories.space">
              <span className="underline underline-offset-2">
                {" "}
                Tiny Factories
              </span>
            </Link>{" "}
            as pary of our{" "}
            <Link href="https://madefor.earth">
              <span className="underline underline-offset-2">
                {" "}
                MadeFor<span className="text-[#007D00]">Earth</span>{" "}
              </span>
            </Link>
            initiative.
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
