import Head from "next/head";
import Link from "next/link";


export default function Example() {
  return (
    <>
      <Head>
        <title>Climate Glossary [alpha]</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script
          async
          defer
          data-website-id="ba22ccb4-a53c-4978-bbd1-efe7ba466072"
          src="https://umami.tinyfactories.space/umami.js"
        ></script>
      </Head>
      <div className="mx-auto py-3 px-9 ">
        <div className="relative flex justify-between ">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <a className="font-bold">G.</a>
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
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* <div className="flex md:absolute md:inset-y-0 md:left-0 lg:static xl:col-span-2">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <a className="font-bold pr-3">contribute</a>
              </Link>
            </div>
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <a className="font-bold">about</a>
              </Link>
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
}
