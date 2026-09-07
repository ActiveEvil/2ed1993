"use client";

import { BLUR_DATA_URL } from "./ImageWithCredit";
import NextImage from "next/image";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";

export type LightboxImage = {
  src: string;
  title: string;
  artist: string | null;
  width: number | null;
  height: number | null;
};

export type LightboxHandle = {
  open: (index: number) => void;
};

const CONTROL =
  "flex items-center justify-center min-h-11 min-w-11 px-2 rounded-none bg-2ed-light-blue border-4 border-frame text-black font-subtitle shadow-lg";

export const Lightbox: React.FC<{
  images: LightboxImage[];
  initialIndex?: number;
  ref: React.Ref<LightboxHandle>;
}> = ({ images, initialIndex = 0, ref }): React.JSX.Element => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const image = images[index];
  const ratio = image?.width && image?.height ? image.width / image.height : 1;
  const zoomable = Boolean(image?.width && image?.height);
  const stepping = images.length > 1;
  const neighbours = Array.from(
    new Set([
      (index + 1) % images.length,
      (index - 1 + images.length) % images.length,
    ]),
  ).filter((at) => at !== index);

  useImperativeHandle(ref, () => ({
    open: (at: number) => {
      flushSync(() => {
        setIndex(at);
        setZoomed(false);
      });
      dialogRef.current?.showModal();
    },
  }));

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
    const dialog = dialogRef.current;
    if (!dialog || !stepping) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (zoomed) {
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
  }, [stepping, step, zoomed]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={stepping ? "Gallery image" : "Image"}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
      onClose={() => setZoomed(false)}
      className="m-auto p-0 max-w-[100vw] shadow-lg backdrop:bg-black/75 print:hidden"
    >
      {image && (
        <div
          className="relative mx-auto flex flex-col w-screen"
          style={{ maxWidth: `calc(80vh * ${ratio})` }}
        >
          <figure
            ref={figureRef}
            className={`relative w-full border-4 border-frame ${
              zoomed ? "overflow-auto" : ""
            }`}
            style={{ aspectRatio: `${ratio}` }}
          >
            {zoomed && image.width && image.height ? (
              <NextImage
                src={image.src}
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
                  src={image.src}
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
                    key={images[at].src}
                    src={images[at].src}
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
            {image.artist ? (
              <>
                <cite>{image.title}</cite> &mdash; {image.artist}
              </>
            ) : (
              image.title
            )}
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
          {stepping && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1">
              <button onClick={() => step(-1)} className={CONTROL}>
                <span className="sr-only">Previous image</span>
                <span className="text-xl" aria-hidden="true">
                  &#9666;
                </span>
              </button>
              <span
                aria-live="polite"
                className="flex items-center min-h-11 px-2 py-1 border-4 border-frame bg-2ed-white font-subtitle text-black text-xs shadow-lg"
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
            onClick={() => dialogRef.current?.close()}
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
  );
};
