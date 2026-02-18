"use client";

import { Tiny2ed1993 } from "./Logos";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const TopNav: React.FC = (): React.JSX.Element => {
  const pathname = usePathname();

  console.log(pathname);

  const items = [
    {
      href: "/factions",
      anchor: "Factions",
    },
    {
      href: "/wargear",
      anchor: "Wargear",
    },
    {
      href: "/rules",
      anchor: "Rules",
    },
  ];

  const list = items.map(({ href, anchor }) => (
    <li key={href} className="font-subtitle text-xl uppercase">
      {pathname === href ? (
        <span>{anchor}</span>
      ) : (
        <Link className="hover:underline underline-offset-4" href={href}>
          {anchor}
        </Link>
      )}
    </li>
  ));

  return (
    <header className="flex justify-center items-center w-full p-2 bg-black text-white">
      <nav className="flex justify-center items-center gap-8 w-full max-w-5xl">
        {pathname === "/" ? (
          <Tiny2ed1993 grayscale />
        ) : (
          <Link href="/">
            <Tiny2ed1993 />
          </Link>
        )}

        <ul className="flex justify-end items-center gap-8 w-full">{list}</ul>
      </nav>
    </header>
  );
};
