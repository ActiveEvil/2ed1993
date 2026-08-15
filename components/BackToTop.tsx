"use client";

import { useEffect, useState } from "react";

export const BackToTop: React.FC = (): React.JSX.Element | null => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let queued = false;

    const update = () => {
      queued = false;
      setShow(window.scrollY > window.innerHeight);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0 });
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
