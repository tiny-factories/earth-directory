import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  return (
    <nav>
      <div className="left">
        <Link href="/">
          <div className="font-bold uppercase" data-active={isActive("/")}>
            Earth Directory
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Header;
