import React, { ReactNode } from "react";
import Header from "./Header";
import Link from "next/link";

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div className="">
    <Header />
    <div className="p-3 mt-[100px]">{props.children}</div>
    <footer className="text-center p-4 mt-8">
      <div className="container mx-auto">
        <p className="text-sm text-gray-700">
          &copy; {new Date().getFullYear()} Earth Directory. All rights
          reserved.
        </p>
        <ul className="flex justify-center space-x-4 mt-3">
          <li>
            <Link href="/about">
              <div className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
                About Us
              </div>
            </Link>
          </li>
          <li>
            <Link href="/terms">
              <div className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
                Terms of Service
              </div>
            </Link>
          </li>
          <li>
            <Link href="/privacy">
              <div className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
                Privacy Policy
              </div>
            </Link>
          </li>
          <li>
            <Link href="/contact">
              <div className="text-gray-600 hover:text-gray-900 transition-colors duration-300">
                Contact Us
              </div>
            </Link>
          </li>
        </ul>
      </div>
      <Link href="https://planetary.software">
        <div className="">
          <div className="">icon</div>
          <div className="uppercase">
            <div>planetary</div> <div>software</div>
          </div>
        </div>
      </Link>
    </footer>
  </div>
);

export default Layout;
