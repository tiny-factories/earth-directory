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

  // let data = feed.reduce((r, e) => {
  //   let group = e.title[0];
  //   if (!r[group]) r[group] = { group, children: [e] };
  //   else r[group].children.push(e);
  //   return r;
  // }, {});

  // let result = Object.values(data);
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
      <div className="relative bg-[#101010] text-[#F2F2F2]">
        <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
          <div className=" sm:text-center">
            <div className="font-medium text-white ">
              <div className="md:hidden">
                <div className="">
                  <Link href="https://api.madefor.earth/data/co2">
                    <div
                      id="widget-for-co2-today-source-glossary"
                      className="umami--click--widget-for-co2-today-source-glossary"
                    >
                      {!props.atmosphericReadings[1].co2 ? (
                        <>Loading Atmospheric CO₂</>
                      ) : (
                        <>
                          Atmospheric CO₂{" "}
                          {props.atmosphericReadings[1].co2.measurement} ppm{" "}
                          <span className="font-mono"> ↗</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex justify-between">
                <div className="">Atmospheric Readings:</div>
                <div className="">
                  <Link href="https://api.madefor.earth/data/ch4">
                    <div
                      id="widget-for-ch4-today-source-glossary"
                      className="umami--click--widget-for-ch4-today-source-glossary"
                    >
                      {!props.atmosphericReadings[0].ch4 ? (
                        <>Loading CH₄</>
                      ) : (
                        <>
                          CH₄ {props.atmosphericReadings[0].ch4.measurement} ppt
                          <span className="font-mono"> ↗</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="">
                  <Link href="https://api.madefor.earth/data/co2">
                    <div
                      id="widget-for-co2-today-source-glossary"
                      className="umami--click--widget-for-co2-today-source-glossary"
                    >
                      {!props.atmosphericReadings[1].co2 ? (
                        <>Loading CO₂</>
                      ) : (
                        <>
                          CO₂ {props.atmosphericReadings[1].co2.measurement} ppm
                          <span className="font-mono"> ↗</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="">
                  <Link href="https://api.madefor.earth/data/n2o">
                    <div
                      id="widget-for-n2o-today-source-glossary"
                      className="umami--click--widget-for-n2o-today-source-glossary"
                    >
                      {!props.atmosphericReadings[2].n2o ? (
                        <>Loading N₂O</>
                      ) : (
                        <>
                          N₂O {props.atmosphericReadings[2].n2o.measurement} ppb
                          <span className="font-mono"> ↗</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
                <div className="">
                  <Link href="https://api.madefor.earth/data/sf6">
                    <div
                      id="widget-for-sf6-today-source-glossary"
                      className="umami--click--widget-for-sf6-today-source-glossary"
                    >
                      {!props.atmosphericReadings[3].sf6 ? (
                        <>Loading SF₆</>
                      ) : (
                        <>
                          SF₆ {props.atmosphericReadings[3].sf6.measurement} ppt
                          <span className="font-mono"> ↗</span>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              </div>
              {/* <span className="block sm:ml-2 sm:inline-block">
        <a
          href="https://api.madefor.earth"
          className="font-bold text-white underline"
        >
          <span aria-hidden="true"> &rarr;</span>
        </a>
        </span> */}
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-start pt-1 pr-1 sm:items-start sm:pt-1 sm:pr-2">
            {/* <button
        type="button"
        className="flex rounded-md p-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
      >
        <span className="sr-only">Dismiss</span>
         <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" /> 
      </button> */}
          </div>
        </div>
      </div>
      <Layout>
        {/* Hero */}

        <div className="py-24">
          <div className="text-h4 sm:text-h3 md:text-h1  font-bold">
            A shared source of truth to build a better future.
          </div>

          <div className="text-h4 sm:text-h3 md:text-h2">
            As awareness of the climate crysis increases, so does the noise and
            origin of informaiton. We are working to make a glossary of terms,
            agreements, companies, orginizations and more.
          </div>
        </div>

        {/* Search By */}
        <div className="my-24 border-t-2">
          <div className="py-9 text-h4 sm:text-h3 md:text-h2 font-bold uppercase ">
            search by
          </div>
          <div className="flex flex-wrap">
            <div className="w-full">
              As awareness of the climate crysis increases, so does the noise
              and origin of informaiton. We are working to make a glossary of
              terms, agreements, companies, orginizations and more.
            </div>

            <div className="pt-9 flex flex-wrap w-full">
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

        {/* missing something? */}
        <div className="my-24 border-t-2">
          <div className="pt-9 text-h4 sm:text-h3 md:text-h2 font-bold uppercase">
            grow the glossary
          </div>
          <div className="py-9">
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

        {/* translation */}

        {/* by the numbers */}
        <div className="my-24 border-t-2">
          <div className="py-9 text-h4 sm:text-h3 md:text-h2 font-bold uppercase">
            by the numbers
          </div>

          <div className="flex flex-wrap">
            <div className="w-full sm:w-1/2">
              As awareness of the climate crysis increases, so does the noise
              and origin of informaiton. We are working to make a glossary of
              terms, agreements, companies, orginizations and more.
            </div>

            <div className="w-full sm:w-1/2 ">
              <div className="">
                {" "}
                <div className=" text-h4 sm:text-h3 md:text-h1  font-bold block">
                  {props.numberOfTerms}
                </div>
                <div className="block">glossary terms</div>
              </div>

              <div className="">
                {" "}
                <div className="text-h4 sm:text-h3 md:text-h1  font-bold block">
                  {props.numberOfContributors}
                </div>
                <div className="block">contrinutors</div>
              </div>

              <div className="">
                {" "}
                <div className="text-h4 sm:text-h3 md:text-h1  font-bold block">
                  {props.numberOfLanguages}
                </div>
                <div className="block">languages</div>
              </div>
            </div>
          </div>
        </div>
        {/* company sponsorship*/}
        <div className="my-24 border-t-2">
          <div className="pt-9  text-h4 sm:text-h3 md:text-h2 font-bold uppercase">
            Sponsor our project
          </div>
          <div className="py-9">
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
        <div className="my-24 border-t-2">
          <div className="pt-9  text-h4 sm:text-h3 md:text-h2 font-bold uppercase">
            you made it to the bottom!
          </div>

          <div className="">
            give you self a{" "}
            <Link href="#">
              <div className="underline underline-offset-2 inline">🖐️</div>
            </Link>{" "}
            and learn a{" "}
            <Link href="#">
              <div className="underline underline-offset-2 inline">
                new climate term
              </div>
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;
