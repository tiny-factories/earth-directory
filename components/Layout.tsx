import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
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

  let title = "Climate Glossary MFE";

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
            <title>Climate Glossary MFE [PREVIEW]</title>
          </>
        ) : (
          <>
            <title>Climate Glossary MFE</title>
          </>
        )}
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:image" content={`/api/og?title=${title}`} />

        <script
          async
          defer
          data-website-id="ba22ccb4-a53c-4978-bbd1-efe7ba466072"
          src="https://umami.tinyfactories.space/umami.js"
        ></script>
      </Head>
      <div className="bg-[#F2F2F2]  min-h-screen">
        <div className="mx-auto py-3 px-9 ">
          <div className="relative flex justify-between ">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/">
                  <div className="font-bold hover:underline">
                    <span className="">G.</span>
                  </div>
                </Link>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center px-6 py-4 ">
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
                      className="block w-full rounded-md border-none focus:border-gray-300 bg-[#E9E9E9] text-sm placeholder-gray-500 "
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
                  <div className="font-bold hover:underline pr-3">terms</div>
                </Link>
              </div>
              <div className="flex flex-shrink-0 items-center">
                <Link href="/about">
                  <div className="font-bold hover:underline">about</div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {!search && (
          <div className="mx-auto p-9 max-w-screen-xl">{props.children}</div>
        )}

        <div className="mx-auto p-9">
          {notices.map((term, i) => {
            return (
              <div key={term.i} className="">
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
