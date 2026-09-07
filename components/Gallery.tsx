"use client";

import { Aspect, ImageWithCredit } from "./ImageWithCredit";
import { Lightbox } from "./Lightbox";
import type { LightboxHandle } from "./Lightbox";
import { useRef } from "react";

export type GalleryEntry = {
  file_name: string;
  title: string;
  width: number | null;
  height: number | null;
};

export const Gallery: React.FC<{
  images: GalleryEntry[];
  aspect?: Aspect;
}> = ({ images, aspect = "aspect-square" }): React.JSX.Element => {
  const lightbox = useRef<LightboxHandle>(null);
  const entries = images.map((entry) => ({
    src: `images/${entry.file_name}`,
    title: entry.title,
    artist: null,
    width: entry.width,
    height: entry.height,
  }));

  return (
    <>
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {entries.map((entry, at) => (
          <ImageWithCredit
            key={entry.src}
            src={entry.src}
            title={entry.title}
            artist={null}
            aspect={aspect}
            width="third"
            onOpen={() => lightbox.current?.open(at)}
          />
        ))}
      </section>
      <Lightbox ref={lightbox} images={entries} />
    </>
  );
};
