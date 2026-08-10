"use client";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
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
    <>
      <Breadcrumbs
        crumbs={[
          {
            href: "/",
            anchor: "2ed1993",
          },
          {
            anchor: "Error",
          },
        ]}
      />
      <main className="flex flex-col justify-center gap-8 w-full max-w-5xl p-4 md:p-8 border-4 border-black shadow-lg">
        <header>
          <h1 className="font-title uppercase tracking-wide text-4xl md:text-5xl text-center">
            The Machine Spirit Falters
          </h1>
        </header>

        <section className="flex flex-col gap-4 w-full text-lg">
          <p>
            This page could not be retrieved from the record. The fault is at
            this end, not yours&mdash;the page exists, and a second attempt may
            well succeed.
          </p>
          <p>
            Try again, or return to the{" "}
            <Link className="underline underline-offset-4" href="/">
              home page
            </Link>
            .
          </p>
        </section>

        <div className="flex flex-col gap-8 items-start">
          <button
            onClick={reset}
            className="px-4 py-1 rounded-none border-4 border-black outline-0 font-subtitle shadow-lg"
          >
            Try again
          </button>
          {error.digest ? (
            <p className="font-title text-xs">Reference: {error.digest}</p>
          ) : null}
        </div>
      </main>
    </>
  );
}
