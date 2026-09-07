"use client";

import { Lightbox } from "./Lightbox";
import type { LightboxHandle, LightboxImage } from "./Lightbox";
import { useRef } from "react";

export const OpenableFigure: React.FC<
  {
    image: LightboxImage;
    onOpen?: () => void;
  } & React.PropsWithChildren
> = ({ image, onOpen, children }): React.JSX.Element => {
  const lightbox = useRef<LightboxHandle>(null);

  return (
    <>
      <button
        type="button"
        className="block w-full cursor-zoom-in"
        aria-haspopup="dialog"
        aria-label={`Open ${image.title}`}
        onClick={onOpen ?? (() => lightbox.current?.open(0))}
      >
        {children}
      </button>
      {!onOpen && <Lightbox ref={lightbox} images={[image]} />}
    </>
  );
};
