import type { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import Link from "next/link";
import React from "react";
import Layout from "../components/Layout";
import Term, { TermProps } from "../components/Term";
import prisma from "../lib/prisma";
import Search from "../components/Search.js";
import useDebounce from "../hooks/useDebounce";

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

export interface Notice {
  title: string;
  content: string;
}

export interface Links {
  self: Images;
  images: Images;
  thumbnail: Images;
}

export interface Images {
  href: string;
}

const Home: React.FC<Props> = (props) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    // search the api

    async function fetchData() {
      setLoading(true);

      setNotices([]);

      const data = await fetch(
        `/api/nextSearch?searchString=${debouncedSearch}`
      ).then((res) => res.json());
      setNotices(data);
      setLoading(false);
    }

    if (debouncedSearch) fetchData();
  }, [debouncedSearch]);

  return (
    <Layout>
      <div>New Search Demo Start</div>
      <Search />
      <input
        id="search"
        name="search"
        className="block w-full rounded-md border-none focus:border-gray-300 bg-[#E9E9E9] text-sm placeholder-gray-500 "
        placeholder="Search for terms, agencies, treaties, emissions … "
        type="search"
        onChange={(e) => setSearch(e.target.value)}
      />
      <div>
        {loading && <p>Loading...</p>}

        {notices.map((notice) => {
          return (
            <div key={notice.id} className="">
              <div className="">
                <div key={notice.id} className="">
                  <Term term={notice} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div>New Search Demo SEndsart</div>
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
                  <div
                    id={term.group}
                    className="text-h2 font-bold text-gray-500 font-satoshi"
                  >
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
