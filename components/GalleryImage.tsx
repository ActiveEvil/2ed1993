"use client";

import { Aspect, BLUR_DATA_URL } from "./ImageWithCredit";
import NextImage from "next/image";
import { useRef } from "react";

export const GalleryImage: React.FC<{
  src: string;
  title: string;
  width: number | null;
  height: number | null;
  aspect?: Aspect;
}> = ({
  src,
  title,
  width,
  height,
  aspect = "aspect-square",
}): React.JSX.Element => {
  const ref = useRef<HTMLDialogElement>(null);
  const ratio = width && height ? width / height : 1;

  return (
    <>
      <button
        className="block w-full cursor-zoom-in"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <figure
          className={`${aspect} relative w-full border-4 border-black shadow-lg`}
        >
          <NextImage
            src={src}
            alt={title}
            quality={80}
            loading="lazy"
            sizes="(min-width: 1024px) 320px, (min-width: 768px) 33vw, 50vw"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            className="w-full h-auto object-cover object-center"
            fill
          />
          <figcaption className="absolute bottom-2 right-2 ml-2 p-1 border-2 border-black bg-2ed-light-blue font-bold text-black text-xs text-center">
            {title}
          </figcaption>
        </figure>
      </button>
      <dialog
        ref={ref}
        onClick={(event) => {
          if (event.target === ref.current) {
            ref.current?.close();
          }
        }}
        className="m-auto shadow-lg backdrop:bg-black/75"
      >
        <div
          className="flex flex-col w-screen"
          style={{ maxWidth: `calc(80vh * ${ratio})` }}
        >
          <figure
            className="relative w-full border-4 border-black"
            style={{ aspectRatio: `${ratio}` }}
          >
            <NextImage
              src={src}
              alt={title}
              quality={80}
              loading="lazy"
              sizes="(min-width: 768px) 80vh, 100vw"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              className="w-full h-auto object-cover object-center"
              fill
            />
          </figure>
          <button
            onClick={() => ref.current?.close()}
            className="absolute bottom-2 right-2 px-2 leading-2 rounded-none bg-2ed-light-blue border-4 border-black outline-0 text-black font-subtitle shadow-lg"
          >
            <span className="text-xl">&#9746;</span> Close
          </button>
        </div>
      </dialog>
    </>
  );
};
