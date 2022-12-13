import React from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="w-full mb-9 sm:py-9 text-h4 sm:text-h3 font-sans">
        We at{" "}
        <Link href="https://madefor.earth">
          <a className="font-bold hover:underline hover:underline-offset-2">
            Made For <span className="text-green">Earth</span>
          </a>
        </Link>{" "}
        think that a shared source of truth is required to build a better
        future. So we started a glossary of terms, technologies, policies, and
        regulations around climate change. Please help us grow the glossary by{" "}
        <Link href="/add">
          <a className="hover:underline hover:underline-offset-2 italic">
            recommending missing terms
          </a>
        </Link>{" "}
        or{" "}
        <Link href="/translate">
          <a className="hover:underline hover:underline-offset-2 italic">
            helping us translate our project
          </a>
        </Link>{" "}
        into more languages.
      </div>
    </Layout>
  );
};

export default AboutPage;
