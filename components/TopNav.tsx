"use client";

import { Tiny2ed1993 } from "./Logos";
import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const useIsSmallScreen = (): boolean | undefined => {
  const [isSmallScreen, setIsSmallScreen] = useState<boolean | undefined>(
    undefined,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.matchMedia("(width < 48rem)").matches);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isSmallScreen;
};

const BurgerMenu: React.FC<{
  items: {
    href: string;
    anchor: string;
  }[];
}> = ({ items }): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const list = items.map(({ href, anchor }) => (
    <li key={href} className="font-subtitle text-xl uppercase">
      {pathname === href ? (
        <span className="p-1 bg-2ed-light-yellow text-black underline underline-offset-4">
          {anchor}
        </span>
      ) : (
        <Link className="p-1 underline underline-offset-4" href={href}>
          {anchor}
        </Link>
      )}
    </li>
  ));

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(!open);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, open]);

  return (
    <div className="relative flex justify-end items-center w-full">
      <div>
        <button
          className="flex flex-col gap-1 w-8 h-6"
          onClick={(e) => setOpen(!open)}
        >
          <span className="sr-only">Menu</span>
          <div className="w-8 h-1 bg-2ed-light-yellow"></div>
          <div className="w-8 h-1 bg-2ed-light-yellow"></div>
          <div className="w-8 h-1 bg-2ed-light-yellow"></div>
        </button>
        <div
          ref={ref}
          className={clsx({
            "collapse absolute inset-y-auto right-2 p-2 bg-background border-4 border-black text-foreground": true,
            visible: open,
          })}
        >
          <ul className="flex flex-col gap-2 w-full">{list}</ul>
        </div>
      </div>
    </div>
  );
};

const StandardMenu: React.FC<{
  items: {
    href: string;
    anchor: string;
  }[];
}> = ({ items }): React.JSX.Element => {
  const pathname = usePathname();
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

  return <ul className="flex justify-end items-center gap-8 w-full">{list}</ul>;
};

export const TopNav: React.FC = (): React.JSX.Element => {
  const pathname = usePathname();
  const isSmallScreen = useIsSmallScreen();

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

  return (
    <header className="flex justify-center items-center w-full bg-black text-white">
      <nav className="flex justify-center items-center gap-8 w-full max-w-5xl p-4 box-content">
        {pathname === "/" ? (
          <Tiny2ed1993 grayscale />
        ) : (
          <Link href="/">
            <Tiny2ed1993 />
          </Link>
        )}

        {isSmallScreen ? (
          <BurgerMenu items={items} />
        ) : (
          <StandardMenu items={items} />
        )}
      </nav>
    </header>
  );
};
