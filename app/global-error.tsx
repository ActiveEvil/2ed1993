"use client";

import "./globals.css";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="font-block text-base antialiased flex flex-col justify-center items-center w-full min-w-10">
        <div className="flex flex-col justify-center items-center w-full p-2 md:p-4">
          <main
            id="main"
            className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg"
          >
            <header>
              <h1 className="uppercase tracking-wide text-4xl md:text-5xl text-center">
                The Machine Spirit Falters
              </h1>
            </header>

            <section className="flex flex-col gap-4 w-full text-xl">
              <p>
                2ed1993 could not be loaded. The fault is at this end, not
                yours&mdash;a second attempt may well succeed.
              </p>
              <p>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a className="underline underline-offset-4" href="/">
                  Return to the home page
                </a>
                .
              </p>
            </section>

            <div className="flex flex-col gap-8 items-start">
              <button
                onClick={reset}
                className="px-4 py-1 rounded-none border-4 border-black font-subtitle shadow-lg"
              >
                Try again
              </button>
              {error.digest ? (
                <p className="text-xs">Reference: {error.digest}</p>
              ) : null}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
