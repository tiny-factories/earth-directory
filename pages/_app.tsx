import { SessionProvider } from "next-auth/react";
import { AppProps } from "next/app";
import { Inter, Fira_Code } from "next/font/google";

import "../styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <div className={`${inter.variable} ${firaCode.variable}`}>
      <SessionProvider session={pageProps.session}>
        <Component {...pageProps} />
      </SessionProvider>
    </div>
  );
};

export default App;
