"use client";

import { GalleryImage } from "./GalleryImage";
import { Aspect, BLUR_DATA_URL } from "./ImageWithCredit";
import NextImage from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export type GalleryEntry = {
  file_name: string;
  title: string;
  width: number | null;
  height: number | null;
};

const CONTROL =
  "px-2 leading-2 rounded-none bg-2ed-light-blue border-4 border-black text-black font-subtitle shadow-lg";

export const Gallery: React.FC<{
  images: GalleryEntry[];
  aspect?: Aspect;
}> = ({ images, aspect = "aspect-square" }): React.JSX.Element => {
  const ref = useRef<HTMLDialogElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const image = images[index];
  const ratio = image?.width && image?.height ? image.width / image.height : 1;
  const zoomable = Boolean(image?.width && image?.height);
  const neighbours = Array.from(
    new Set([
      (index + 1) % images.length,
      (index - 1 + images.length) % images.length,
    ]),
  ).filter((at) => at !== index);

  const open = (at: number) => {
    flushSync(() => {
      setIndex(at);
      setZoomed(false);
    });
    ref.current?.showModal();
  };

  const step = useCallback(
    (by: number) => {
      setZoomed(false);
      setIndex((current) => (current + by + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    const figure = figureRef.current;
    if (zoomed && figure) {
      figure.scrollLeft = (figure.scrollWidth - figure.clientWidth) / 2;
      figure.scrollTop = (figure.scrollHeight - figure.clientHeight) / 2;
    }
  }, [zoomed, index]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (zoomed || images.length < 2) {
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    };

    dialog.addEventListener("keydown", onKeyDown);
    return () => dialog.removeEventListener("keydown", onKeyDown);
  }, [images.length, step, zoomed]);

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((entry, at) => (
          <GalleryImage
            key={entry.file_name}
            src={`images/${entry.file_name}`}
            title={entry.title}
            aspect={aspect}
            onOpen={() => open(at)}
          />
        ))}
      </section>
      <dialog
        ref={ref}
        aria-label="Gallery image"
        onClick={(event) => {
          if (event.target === ref.current) {
            ref.current?.close();
          }
        }}
        onClose={() => setZoomed(false)}
        className="m-auto p-0 max-w-[100vw] shadow-lg backdrop:bg-black/75"
      >
        {image && (
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
              {zoomed && image.width && image.height ? (
                <NextImage
                  src={`images/${image.file_name}`}
                  alt={image.title}
                  quality={80}
                  width={image.width}
                  height={image.height}
                  sizes={`${image.width}px`}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="max-w-none cursor-zoom-out"
                  onClick={() => setZoomed(false)}
                />
              ) : (
                <>
                  <NextImage
                    src={`images/${image.file_name}`}
                    alt={image.title}
                    quality={80}
                    sizes="(min-width: 768px) 80vh, 100vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className={`w-full h-auto object-cover object-center ${
                      zoomable ? "cursor-zoom-in" : ""
                    }`}
                    onClick={zoomable ? () => setZoomed(true) : undefined}
                    fill
                  />
                  {neighbours.map((at) => (
                    <NextImage
                      key={images[at].file_name}
                      src={`images/${images[at].file_name}`}
                      alt=""
                      aria-hidden="true"
                      quality={80}
                      sizes="(min-width: 768px) 80vh, 100vw"
                      className="opacity-0 pointer-events-none"
                      fill
                    />
                  ))}
                </>
              )}
            </figure>
            <figcaption className="absolute top-2 left-2 p-1 border-2 border-black bg-2ed-light-blue font-bold text-black text-sm text-center">
              {image.title}
            </figcaption>
            {zoomable && (
              <button
                onClick={() => setZoomed(!zoomed)}
                className={`absolute bottom-2 left-2 ${CONTROL}`}
              >
                <span className="sr-only">
                  {zoomed ? "Zoom out to fit" : "Zoom in to full size"}
                </span>
                <span className="text-xl" aria-hidden="true">
                  {zoomed ? <>&#8854;</> : <>&#8853;</>}
                </span>
              </button>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
                <button onClick={() => step(-1)} className={CONTROL}>
                  <span className="sr-only">Previous image</span>
                  <span className="text-xl" aria-hidden="true">
                    &#9666;
                  </span>
                </button>
                <span
                  aria-live="polite"
                  className="px-2 py-1 border-4 border-black bg-2ed-white font-subtitle text-black text-xs shadow-lg"
                >
                  {index + 1} / {images.length}
                </span>
                <button onClick={() => step(1)} className={CONTROL}>
                  <span className="sr-only">Next image</span>
                  <span className="text-xl" aria-hidden="true">
                    &#9656;
                  </span>
                </button>
              </div>
            )}
            <button
              onClick={() => ref.current?.close()}
              className={`absolute bottom-2 right-2 ${CONTROL}`}
            >
              <span aria-hidden="true" className="text-xl">
                &#9746;
              </span>
              <span className="sr-only sm:not-sr-only"> Close</span>
            </button>
          </div>
        )}
      </dialog>
    </>
  );
};
