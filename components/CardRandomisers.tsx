"use client";

import Link from "next/link";
import { useState } from "react";

export const StrategyCardRandomiser: React.FC<{
  baseHref: string;
  cards: {
    origin: string;
    ids: string[];
  }[];
}> = ({ baseHref, cards }): React.JSX.Element => {
  const [origins, setOrigins] = useState(
    new Set(cards.map(({ origin }) => origin)),
  );
  const [excludeVirusOutbreak, setExcludeVirusOutbreak] = useState(true);
  let ids = cards
    .filter((card) => origins.has(card.origin))
    .flatMap(({ ids }) => ids);

  if (excludeVirusOutbreak) {
    ids = ids.filter((id) => id !== "Virus_Outbreak");
  }

  return (
    <>
      <div className="-mx-4 md:-mx-8 flex flex-col items-start gap-4 pt-4 px-4 md:px-8 bg-2ed-mid-blue border-t-4 border-black shadow-lg">
        <p className="text-xl">
          Select which card decks you wish to include and randomly draw one
          card.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          {cards.map((group) => {
            const originId = group.origin.split(" ").join("_");
            return (
              <div key={originId} className="flex gap-2">
                <input
                  type="checkbox"
                  id={originId}
                  checked={origins.has(group.origin)}
                  onChange={() => {
                    setOrigins((previous) => {
                      const next = new Set(previous);

                      if (next.has(group.origin)) {
                        next.delete(group.origin);
                      } else {
                        next.add(group.origin);
                      }

                      return next;
                    });
                  }}
                  className="rounded-none size-6 accent-2ed-mid-blue dark:scheme-only-dark"
                />
                <label htmlFor={originId} className="text-lg">
                  {group.origin}
                </label>
              </div>
            );
          })}
          <div className="flex gap-2">
            <input
              type="checkbox"
              id="Exclude_Virus_Outbreak"
              checked={excludeVirusOutbreak}
              onChange={() => {
                setExcludeVirusOutbreak(!excludeVirusOutbreak);
              }}
              className="rounded-none size-6 accent-2ed-mid-blue dark:scheme-only-dark"
            />
            <label htmlFor="Exclude_Virus_Outbreak" className="text-lg">
              Exclude Virus Outbreak
            </label>
          </div>
        </div>
      </div>
      <div className="sticky top-0 z-10 -mx-4 md:-mx-8 -mt-8 bg-background border-b-4 border-black shadow-lg">
        <div className="flex flex-col items-start gap-4 p-4 md:px-8 w-full h-full bg-2ed-mid-blue ">
          <Link
            className="px-4 py-1 rounded-none bg-2ed-light-blue border-4 border-black outline-0 text-black font-subtitle shadow-lg"
            href={baseHref}
            onNavigate={(e) => {
              e.preventDefault();

              if (ids.length) {
                const href =
                  baseHref + "#" + ids[Math.floor(Math.random() * ids.length)];

                window.location.replace(new URL(window.location.origin + href));
              }
            }}
            scroll
          >
            Draw one card at random!
          </Link>
        </div>
      </div>
    </>
  );
};
