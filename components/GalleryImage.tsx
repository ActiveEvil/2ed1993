"use client";

import { Aspect, BLUR_DATA_URL } from "./ImageWithCredit";
import NextImage from "next/image";
import { useRef } from "react";

export const GalleryImage: React.FC<{
  src: string;
  title: string;
  aspect?: Aspect;
}> = ({ src, title, aspect = "aspect-square" }): React.JSX.Element => {
  const ref = useRef<HTMLDialogElement>(null);

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
        <div className="flex flex-col w-screen max-w-[80vh]">
          <figure className={`${aspect} relative w-full border-4 border-black`}>
            <NextImage
              src={src}
              alt={title}
              quality={80}
              loading="lazy"
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
