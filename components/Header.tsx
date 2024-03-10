import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  return (
    <nav className="backdrop-blur">
      {/* Navigation */}
      <div className="mx-auto py-3 ">
        <div className="relative flex justify-between rounded-lg">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/">
                <div className="font-bold hover:underline hover:underline-offset-4 hoveßr:decoration-2 uppercase pl-2 pr-2 py-2">
                  Earth Directory
                </div>
              </Link>
            </div>
          </div>
          <div className="flex inset-y-0 left-0 static col-span-2">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/tags">
                <div
                  className={`hover:underline hover:underline-offset-4 hover:decoration-2  pl-2 pr-4 py-2 ${
                    isActive("/tags")
                      ? "underline decoration-2 underline-offset-4"
                      : ""
                  }`}
                >
                  Tags
                </div>
              </Link>
              <Link href="/terms">
                <div
                  className={`hover:underline hover:underline-offset-4 hover:decoration-2  pl-2 pr-4 py-2 ${
                    isActive("/terms")
                      ? "underline decoration-2 underline-offset-4"
                      : ""
                  }`}
                >
                  Terms
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
