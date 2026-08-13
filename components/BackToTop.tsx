"use client";

import { useEffect, useState } from "react";

export const BackToTop: React.FC = (): React.JSX.Element | null => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let queued = false;

    const update = () => {
      queued = false;
      // One screenful of page behind you is the point at which scrolling back
      // by hand starts to be a chore. Measured rather than a fixed pixel count,
      // so it holds on a phone and on a desktop.
      setShow(window.scrollY > window.innerHeight);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Covers landing part-way down the page on a hash link.
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => {
        // No `behavior`, so this inherits scroll-behavior from `html`, which is
        // already behind a prefers-reduced-motion guard. One definition, not two.
        window.scrollTo({ top: 0 });
        // The button unmounts the moment the scroll passes the threshold, and a
        // focused element that unmounts drops focus to <body>. Hand it to the
        // skip link instead, which is the first thing on the page anyway.
        document
          .querySelector<HTMLElement>('a[href="#main"]')
          ?.focus({ preventScroll: true });
      }}
      className="fixed bottom-4 right-4 z-40 flex justify-center items-center size-11 bg-2ed-light-yellow border-4 border-black text-black font-subtitle text-xl shadow-lg hover:bg-black hover:text-2ed-light-yellow print:hidden"
    >
      <span aria-hidden="true">&uarr;</span>
      <span className="sr-only">Back to top</span>
    </button>
  );
};
