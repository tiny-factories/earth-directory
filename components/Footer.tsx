import Link from "next/link";
const navigation = {
  main: [
    {
      name: "about",
      href: "/about",
    },

    { name: "newsletter ↗", href: "https://buttondown.email/madeforearth" },
  ],
  contribute: [
    {
      name: "help translate ↗",
      href: "https://form.typeform.com/to/hV9yuh6J",
    },
    {
      name: "add a term ↗",
      href: "https://form.typeform.com/to/lowIfjl5",
    },
  ],
  social: [
    {
      name: "Twitter ↗",
      href: "https://twitter.com/mdfrearth",
    },
    {
      name: "Are.na  ↗",
      href: "https://www.are.na/made-for-earth",
    },
    {
      name: "GitHub ↗",
      href: "https://github.com/tiny-factories/mfe-climate-glossary",
    },
  ],
};

export default function Example() {
  return (
    <footer className="p-9 inset-x-0 bottom-0">
      <div className="border-t border-black py-12 mx-auto  overflow-hidden">
        <div className="grid grid-cols-4 gap-4">
          <div className="...">
            <div className="font-bold">
              By{" "}
              <Link href="https://tinyfactories.space">
                <div
                  id="link-to-tiny-factories"
                  className="umami--click--link-to-tiny-factories underline underline-offset-2"
                >
                  Tiny Factories
                </div>
              </Link>
            </div>
            <div className="py-2">
              Made on a pale blue dot for the Earth, the only known place in the
              universe to house life.
            </div>
          </div>
          <div className="...">
            <div className="font-bold">Made For Earth</div>
            {navigation.main.map((item, i) => (
              <div key={item.i} className="py-2">
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
          <div className="...">
            <div className="font-bold">Contribute</div>
            {navigation.contribute.map((item, i) => (
              <div key={item.i} className="py-2">
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
          <div className="...">
            <div className="font-bold">Social</div>
            {navigation.social.map((item, i) => (
              <div key={item.i} className="py-2">
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
        </div>
        {/* <div className="border-t border-black py-12">
          <div
            className="-mx-5 -my-2 flex flex-wrap justify-center"
            aria-label="Footer"
          >
            {navigation.main.map((item) => (
              <div key={item.name} className="px-5 py-2">
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
