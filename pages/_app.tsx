import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";

import { AppProps } from "next/app";
import "../styles/globals.css";
import { init } from "commandbar";

if (typeof window !== "undefined") {
  init("86dc031d");
}

const App = ({ Component, pageProps }: AppProps) => {
  const { push } = useRouter();
  const [commandBarReady, setCommandBarReady] = useState(false);

  //   useEffect(() => {
  //     window.CommandBar.boot("me").then(() => {
  //       setCommandBarReady(true);
  //     });
  //
  //     return window.CommandBar.shutdown;
  //   }, []);

  useEffect(() => {
    if (commandBarReady) {
      window.CommandBar.addCommand({
        name: "home",
        text: "Go to Home",
        category: "Navigation",
        icon: "https://openmoji.org/data/color/svg/E269.svg",
        template: { type: "link", value: "/", operation: "router" },
        availability_rules: [
          {
            type: "url",
            operator: "isNot",
            value: "/",
          },
        ],
      });
      window.CommandBar.addCommand({
        name: "foo",
        text: "Go to Foo",
        category: "Navigation",
        icon: "https://openmoji.org/data/color/svg/E269.svg",
        template: { type: "link", value: "/foo", operation: "router" },
        availability_rules: [
          {
            type: "url",
            operator: "isNot",
            value: "/foo",
          },
        ],
      });
      window.CommandBar.addCommand({
        name: "foo2",
        text: "Go to Foo2",
        category: "Navigation",
        icon: "https://openmoji.org/data/color/svg/E269.svg",
        template: { type: "link", value: "/foo", operation: "router" },
        availability_rules: [
          {
            type: "url",
            operator: "isNot",
            value: "/foo",
          },
        ],
      });

      return () => {
        window.CommandBar.removeCommand("home");
        window.CommandBar.removeCommand("foo");
      };
    }
  }, [commandBarReady]);

  useEffect(() => {
    if (commandBarReady) {
      window.CommandBar.addRouter(push);
    }
  }, [push, commandBarReady]);

  return (
    <SessionProvider session={pageProps.session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

export default App;
