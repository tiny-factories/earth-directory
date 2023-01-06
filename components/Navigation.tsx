import Head from "next/head";
import Link from "next/link";

export type SearchProps = {
  id: string;
  title: string;
};

export default function Navigation() {
  return (
    <>
      <Head>
        <title>Climate Glossary [a]</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script
          async
          defer
          data-website-id="ba22ccb4-a53c-4978-bbd1-efe7ba466072"
          src="https://umami.tinyfactories.space/umami.js"
        ></script>
      </Head>
    </>
  );
}
