import Link from "next/link";
const navigation = {
  main: [
    {
      name: "about",
      href: "https://madefor.earth/about",
    },

    { name: "newsletter ", href: "https://buttondown.email/madeforearth" },
  ],
  contribute: [
    {
      name: "help translate ",
      href: "https://form.typeform.com/to/hV9yuh6J",
    },
    {
      name: "add a term ",
      href: "https://form.typeform.com/to/lowIfjl5",
    },
    {
      name: "sponsor us ",
      href: "https://form.typeform.com/to/NVs38SdG",
    },
  ],
  social: [
    {
      name: "twitter ",
      href: "https://twitter.com/mdfrearth",
    },
    {
      name: "are.na  ",
      href: "https://www.are.na/made-for-earth",
    },
    {
      name: "gitHub",
      href: "https://github.com/tiny-factories/mfe-glossary",
    },
  ],
};

export default function Example() {
  return (
    <footer className="font-sans p-9 mx-auto bottom-0">
      <div className="border-t border-black py-12 mx-auto  overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="...">
            <div className="font-bold">
              <div className="inline-block">
                By{" "}
                <Link href="https://tinyfactories.space">
                  <div
                    id="link-to-tiny-factories"
                    className="umami--click--link-to-tiny-factories inline-block underline underline-offset-2"
                  >
                    Tiny Factories
                  </div>
                </Link>
              </div>
            </div>
            <div className="">
              Made on a pale blue dot, the only known place in the universe to
              house life.
            </div>
          </div>
          <div className="...">
            <div className="font-bold">Made For Earth</div>
            {navigation.main.map((item, i) => (
              <div key={i} className="">
                <Link
                  id={`link-to-${item.name}`}
                  href={item.href}
                  className={`umami--click--link-to-${item.name} text-base text-gray-500 hover:text-gray-900`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
          <div className="...">
            <div className="font-bold">Contribute</div>
            {navigation.contribute.map((item, i) => (
              <div key={i} className="">
                <Link
                  id={`link-to-${item.name}`}
                  href={item.href}
                  className={`umami--click--link-to-${item.name} text-base text-gray-500 hover:text-gray-900`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
          <div className="...">
            <div className="font-bold">Social</div>
            {navigation.social.map((item, i) => (
              <div key={i} className="">
                <Link
                  id={`link-to-${item.name}`}
                  href={item.href}
                  className={`umami--click--link-to-${item.name} text-base text-gray-500 hover:text-gray-900`}
                >
                  {item.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
        {/* <div className="border-t border-black py-12">
          <div
            className="-mx-5 -my-2 flex flex-wrap justify-center"
            aria-label="Footer"
          >
            {navigation.main.map((item,i) => (
              <div key={i} className="px-5 py-2">
                <div
                  id={`link-to-${item.name}`}
                  href={item.href}
                  className={`umami--click--link-to-${item.name} text-base text-gray-500 hover:text-gray-900`}
                >
                  {item.name}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-base text-gray-400">
            Part of{" "}
            <Link href="https://madefor.earth">
              <div className="underline underline-offset-2">
                Made for <span>Earth</span>
              </div>
            </Link>{" "}
            by{" "}
            <Link href="https://tinyfactories.space">
              <div className="underline underline-offset-2">Tiny Factories</div>
            </Link>
          </p>
        </div> */}
      </div>
    </footer>
  );
}
