"use client";

import { Aspect, BLUR_DATA_URL } from "./ImageWithCredit";
import NextImage from "next/image";

export const GalleryImage: React.FC<{
  src: string;
  title: string;
  aspect?: Aspect;
  onOpen: () => void;
}> = ({ src, title, aspect = "aspect-square", onOpen }): React.JSX.Element => {
  return (
    <button
      className="block w-full cursor-zoom-in"
      aria-haspopup="dialog"
      onClick={onOpen}
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
        <figcaption className="absolute bottom-2 right-2 ml-2 p-1 border-2 border-black bg-2ed-light-blue font-bold text-black text-xs text-right">
          {title}
        </figcaption>
      </figure>
    </button>
  );
};
