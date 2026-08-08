"use client";

import { Aspect, BLUR_DATA_URL } from "./ImageWithCredit";
import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const figureRef = useRef<HTMLElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const ratio = width && height ? width / height : 1;
  const zoomable = Boolean(width && height);

  useEffect(() => {
    const figure = figureRef.current;
    if (zoomed && figure) {
      figure.scrollLeft = (figure.scrollWidth - figure.clientWidth) / 2;
      figure.scrollTop = (figure.scrollHeight - figure.clientHeight) / 2;
    }
  }, [zoomed]);

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
        onClose={() => setZoomed(false)}
        className="m-auto p-0 max-w-[100vw] shadow-lg backdrop:bg-black/75"
      >
        <div
          className="relative mx-auto flex flex-col w-screen"
          style={{ maxWidth: `calc(80vh * ${ratio})` }}
        >
          <figure
            ref={figureRef}
            className={`relative w-full border-4 border-black ${
              zoomed ? "overflow-auto" : ""
            }`}
            style={{ aspectRatio: `${ratio}` }}
          >
            {zoomed && width && height ? (
              <NextImage
                src={src}
                alt={title}
                quality={80}
                width={width}
                height={height}
                sizes={`${width}px`}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className="max-w-none cursor-zoom-out"
                onClick={() => setZoomed(false)}
              />
            ) : (
              <NextImage
                src={src}
                alt={title}
                quality={80}
                loading="lazy"
                sizes="(min-width: 768px) 80vh, 100vw"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                className={`w-full h-auto object-cover object-center ${
                  zoomable ? "cursor-zoom-in" : ""
                }`}
                onClick={zoomable ? () => setZoomed(true) : undefined}
                fill
              />
            )}
          </figure>
          {zoomable && (
            <button
              onClick={() => setZoomed(!zoomed)}
              className="absolute bottom-2 left-2 px-2 leading-2 rounded-none bg-2ed-light-blue border-4 border-black outline-0 text-black font-subtitle shadow-lg"
            >
              <span className="sr-only">
                {zoomed ? "Zoom out to fit" : "Zoom in to full size"}
              </span>
              <span className="text-xl" aria-hidden="true">
                {zoomed ? <>&#8854;</> : <>&#8853;</>}
              </span>
            </button>
          )}
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
