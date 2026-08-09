import React from "react";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";

/**
 * Design tokens from tailwind.config.js and globals.css.
 * Keep in sync with theme when adding/removing tokens.
 */
const TOKENS = {
  colors: [
    { name: "green", value: "#0C7D01", tailwind: "green" },
    { name: "tan", value: "#EEEDE6", tailwind: "tan" },
    { name: "white", value: "#FFFFFF", tailwind: "white" },
  ],
  fontSize: [
    { name: "paragraph", value: "20px", tailwind: "text-paragraph" },
    { name: "h3", value: "24px", tailwind: "text-h3" },
    { name: "h2", value: "34px", tailwind: "text-h2" },
    { name: "h1", value: "64px", tailwind: "text-h1" },
  ],
  fontFamily: [
    { name: "sans", value: "var(--font-inter), system-ui, …", tailwind: "font-sans" },
    { name: "satoshi", value: "Satoshi var, system-ui, …", tailwind: "font-satoshi" },
    { name: "serif", value: "ui-serif, Georgia", tailwind: "font-serif" },
    { name: "mono", value: "var(--font-fira-code), SFMono…", tailwind: "font-mono" },
  ],
};

const DesignTokensPage: React.FC = () => {
  return (
    <Layout>
      <Head>
        <title>Design tokens — Earth Directory</title>
      </Head>
      <div className="max-w-4xl mx-auto space-y-16">
        <header className="border-b border-black/10 pb-6">
          <h1 className="font-sans text-h1 font-bold">Design tokens</h1>
          <p className="font-sans text-paragraph text-black/70 mt-2">
            CSS and Tailwind theme tokens used across the site.
          </p>
        </header>

        {/* Colors */}
        <section>
          <h2 className="font-sans text-h2 font-bold mb-6">Colors</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TOKENS.colors.map((c) => (
              <div
                key={c.name}
                className="rounded-xl overflow-hidden border border-black/10 bg-white shadow-sm"
              >
                <div
                  className="h-28 w-full"
                  style={{ backgroundColor: c.value }}
                />
                <div className="p-4 font-mono text-sm">
                  <div className="font-sans font-medium text-black">{c.name}</div>
                  <div className="text-black/70 mt-1">{c.value}</div>
                  <div className="text-black/50 mt-1">.{c.tailwind}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Type scale */}
        <section>
          <h2 className="font-sans text-h2 font-bold mb-6">Type scale</h2>
          <div className="space-y-6 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            {TOKENS.fontSize.map((t) => (
              <div key={t.name} className="border-b border-black/5 pb-6 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-baseline gap-4 gap-y-2">
                  <span
                    className={`font-sans font-medium ${t.tailwind}`}
                    style={{ lineHeight: 1.2 }}
                  >
                    The quick brown fox
                  </span>
                  <span className="font-mono text-sm text-black/50">
                    {t.name} · {t.value}
                  </span>
                </div>
                <div className="font-mono text-xs text-black/40 mt-1">.{t.tailwind}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Font families */}
        <section>
          <h2 className="font-sans text-h2 font-bold mb-6">Font families</h2>
          <div className="space-y-6 rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            {TOKENS.fontFamily.map((f) => (
              <div key={f.name} className="border-b border-black/5 pb-6 last:border-0 last:pb-0">
                <div className={`font-medium text-h3 ${f.tailwind}`}>
                  The quick brown fox jumps over the lazy dog.
                </div>
                <div className="font-mono text-sm text-black/50 mt-2">{f.value}</div>
                <div className="font-mono text-xs text-black/40 mt-1">.{f.tailwind}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CSS variables (from _app / Next.js fonts) */}
        <section>
          <h2 className="font-sans text-h2 font-bold mb-6">CSS variables</h2>
          <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm font-mono text-sm space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <code className="bg-[#EEEDE6] px-2 py-1 rounded">--font-inter</code>
              <span className="text-black/60">Sans-serif (Inter via Next.js font)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <code className="bg-[#EEEDE6] px-2 py-1 rounded">--font-fira-code</code>
              <span className="text-black/60">Monospace (Fira Code via Next.js font)</span>
            </div>
          </div>
        </section>

        <footer className="pt-8 text-sm text-black/50">
          <Link href="/" className="text-green hover:underline">
            Back to home
          </Link>
        </footer>
      </div>
    </Layout>
  );
};

export default DesignTokensPage;
