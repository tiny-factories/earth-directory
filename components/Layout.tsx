import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import Head from "next/head";
import Footer from "./Footer";
import Term from "./Term";

import useDebounce from "../hooks/useDebounce";

type Props = {
  children: ReactNode;
};

export interface Notice {
  title: string;
  content: string;
  id: string;
  published: boolean;
  sponsor: boolean;
  sourceId: string;
  group: any;
  children: any;
  notice: any;
}

export interface Links {
  self: Images;
  images: Images;
  thumbnail: Images;
}

export interface Images {
  href: string;
}

const Layout: React.FC<Props> = (props) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [search, setSearch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  let title = "Earth Directory";

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
    <div>
      <Head>
        {process.env.UMAMI != "DEVELOPMENT" ? (
          <>
            <title>Earth Directory</title>
          </>
        ) : (
          <>
            <title>Earth Directory</title>
          </>
        )}
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:image" content={`/api/og?title=${title}`} />
      </Head>
      <Script
        async
        defer
        data-website-id="ba22ccb4-a53c-4978-bbd1-efe7ba466072"
        src="https://umami.tinyfactories.space/umami.js"
      />

      <div className="font-sans bg-[#EEEDE6] min-h-screen bg-white rounded">
        {/* Navigation */}
        <div className="mx-auto py-3 px-3">
          <div className="relative flex justify-between rounded-lg bg-[#ffffff]">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/">
                  <div className="font-bold hover:underline hover:underline-offset-4 hoveßr:decoration-2 uppercase pl-4 pr-2 py-2">
                    Earth Directory
                  </div>
                </Link>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center px-3 py-2">
                <div className="w-full">
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    {/* <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    Icon
                  </div> */}
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border-none focus:border-none bg-[#EEEDE6] text-sm placeholder-gray-500 "
                      placeholder="Search for terms, agencies, treaties, emissions … "
                      type="search"
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex inset-y-0 left-0 static col-span-2">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/terms">
                  <div className="hover:underline hover:underline-offset-4 hover:decoration-2  pl-2 pr-4 py-2">
                    terms
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {!search && <div className="mx-auto p-3 md:p-9">{props.children}</div>}

        <div className="mx-auto p-9">
          {notices.map((term, i) => {
            return (
              <div key={i} className="">
                <Term term={term} />
              </div>
            );
          })}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
