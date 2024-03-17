import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  return (
    <nav className="flex backdrop-blur">
      {/* Navigation */}
      <div className="w-full py-3">
        <div className="flex justify-between items-center rounded-lg">
          {/* Left-aligned title */}
          <div className="flex">
            <Link href="/">
              <div className="font-bold hover:underline hover:underline-offset-4 hover:decoration-2 uppercase">
                Earth Directory
              </div>
            </Link>
          </div>

          {/* Center-aligned search bar, hidden on md and smaller screens */}
          <div className="hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 rounded-lg border-2 border-gray-200"
            />
          </div>

          {/* Right-aligned links */}
          <div className="flex">
            <Link href="/tags">
              <div
                className={`hover:underline hover:underline-offset-4 hover:decoration-2 px-4 py-2 ${
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
                className={`hover:underline hover:underline-offset-4 hover:decoration-2 px-4 py-2 ${
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
    </nav>
  );
};

export default Header;
