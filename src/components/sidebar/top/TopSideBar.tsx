import Image from "next/image";
import { extraProps } from "../interface";
import Link from "next/link";

export default function TopSideBar({ className }: extraProps) {
  return (
    <div
      className={`w-full h-12 min-h-12 flex items-center justify-center ${className}`}
    >
      <Link href="/">
        <Image
          src="/logos/logo-transparent-1.png"
          alt="Team App Logo"
          width={35}
          height={35}
          loading="eager"
        />
      </Link>
    </div>
  );
}
