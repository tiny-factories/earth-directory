import type { GetStaticProps } from "next";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import Layout from "../components/Layout";
import { TermProps } from "../components/Term";
import Tag from "../components/Tag";

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
        <div className="grid sm:grid-cols-2 grid-cols-1 gap-4 rounded-lg min-h-max flex items-center">
          <div className="text-h2 lg:text-h1 font-bold">
            A shared source of truth to build a better future.
          </div>
          <div className="">
            <Image
              src="/g-hero-earth.webp"
              width={500}
              height={500}
              alt="Picture of the author"
            />
          </div>
        </div>
        {/* Explore */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
            <div className="align-middle text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              Explore
            </div>
          </div>
          <div className="flex flex-wrap py-9">
            {/* <div className="w-full text-paragraph">
              As our planet faces a growing climate crisis, it can be
              overwhelming to navigate the vast amount of information available.
              That's why we're creating a comprehensive glossary of terms,
              agreements, companies, organizations, and more to help you
              understand and take action.
            </div> */}

            <div className="flex flex-wrap w-full ">
              {props.allTags.map((tag, i) => {
                return (
                  <div key={i} className="p-3">
                    <Tag tag={tag} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* grow */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
            <span className="align-middle text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              grow
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-2 py-9 text-paragraph">
              We rely on our community to help us expand and refine the
              glossary. Anyone can suggest a term, and our team carefully
              verifies each submission before adding it to the database.
            </div>
            <Link
              href="https://form.typeform.com/to/lowIfjl5"
              className="bg-[#fff] p-3 rounded-lg text-h3 font-satoshi font-bold uppercase"
            >
              Add a Term <span className="font-mono">↗</span>
            </Link>
            <Link
              href="https://form.typeform.com/to/lowIfjl5"
              className="bg-[#fff] p-3 rounded-lg text-h3 font-satoshi font-bold uppercase"
            >
              Help Translate <span className="font-mono">↗</span>
            </Link>
          </div>
        </div>
        {/* contribute */}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
            <div className="align-middle text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              contribute
            </div>
          </div>

          <div className="py-9 text-paragraph">
            We may be a small organization, but we believe in the power of
            collective action to drive meaningful change. As we grow, we&apos;re
            excited to co-create the future of this project with the
            MadeForEarth community. Who knows what&apos;s next? An API, a
            Twitter bot, or even a role in a future UN treaty? For now, here are
            some numbers to show our progress.
          </div>

          <div className="py-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border-2 rounded p-9 bg-[#FFF]">
              {" "}
              <div className="text-h4 sm:text-h3 md:text-h1 font-bold block">
                {props.numberOfTerms}
              </div>
              <div className="block">terms</div>
            </div>

            <div className="border-2 rounded p-9 bg-[#FFF]">
              {" "}
              <div className="text-h4 sm:text-h3 md:text-h1  font-bold block">
                {props.numberOfContributors}
              </div>
              <div className="block">contrinutors</div>
            </div>

            <div className="border-2 rounded p-9 bg-[#FFF]">
              {" "}
              <div className="text-h4 sm:text-h3 md:text-h1  font-bold block">
                {props.numberOfLanguages}
              </div>
              <div className="block">languages</div>
            </div>
          </div>
        </div>
        {/* sponsorship*/}
        {/* <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
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
          </div>
        </div> */}
        {/* you made it*/}
        <div className="my-24 mx-auto max-w-screen-lg">
          <div className="border-b-4">
            <div className="align-middle text-h3 md:text-h2 font-bold uppercase font-satoshi inline-block">
              you made it
            </div>
          </div>

          <div className="py-9 text-paragraph">
            Welcome to the bottom of the page, give you self a 🖐️. This was made
            by{" "}
            <Link href="https://tinyfactories.space">
              <span className="underline underline-offset-4">
                {" "}
                Tiny Factories
              </span>
            </Link>{" "}
            as pary of our{" "}
            <Link href="https://madefor.earth">
              <span className="underline underline-offset-4">
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
