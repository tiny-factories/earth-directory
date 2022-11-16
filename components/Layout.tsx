import React, { ReactNode } from "react";
import Navigation from "./Navigation";
import Footer from "./Footer";

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div className="bg-[#F2F2F2]">
    <Navigation />
    <div className="mx-auto p-9">{props.children}</div>
    <Footer />
  </div>
);

export default Layout;
