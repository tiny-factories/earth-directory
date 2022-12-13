import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "./Navigation";
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
    <div className="bg-[#F2F2F2] min-h-screen">
      <div className="mx-auto py-3 px-9 ">
        <div className="relative flex justify-between ">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <a className="font-bold hover:underline">
                  <span className="">G.</span>
                </a>
              </Link>
            </div>
          </div>
          <div className="min-w-0 flex-1 ">
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
          <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/contribute">
                <a className="font-bold hover:underline pr-3">contribute</a>
              </Link>
            </div>
            <div className="flex flex-shrink-0 items-center">
              <Link href="/about">
                <a className="font-bold hover:underline">about</a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!search && <div className="mx-auto p-9">{props.children}</div>}

      <div className="mx-auto p-9">
        {notices.map((term, i) => {
          return (
            <div key={term.id} className="">
              <Term term={term} />
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
