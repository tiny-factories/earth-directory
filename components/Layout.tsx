import React, { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import Navigation from "./Navigation";
import Footer from "./Footer";
import Term from "./Term";
import useDebounce from "../hooks/useDebounce";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
    <div>
      {/* <div className="relative bg-indigo-600">
        <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
          <div className="pr-16 sm:px-16 sm:text-center">
            <p className="font-medium text-white">
              <span className="md:hidden">We announced a new product!</span>
              <span className="hidden md:inline">
                Big news! We're excited to announce a brand new product.
              </span>
              <span className="block sm:ml-2 sm:inline-block">
                <a href="#" className="font-bold text-white underline">
                  Learn more
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </span>
            </p>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-start pt-1 pr-1 sm:items-start sm:pt-1 sm:pr-2">
            <button
              type="button"
              className="flex rounded-md p-2 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div> */}
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
                  <a className="font-bold hover:underline pr-3">terms</a>
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
    </div>
  );
};

export default Layout;
