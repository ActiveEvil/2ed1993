CREATE TABLE public.hero_images (
  slug text NOT NULL,
  image_id integer NOT NULL REFERENCES public.images(id),
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (slug, image_id)
);

CREATE INDEX hero_images_image_id_idx ON public.hero_images (image_id);

CREATE POLICY "Public hero_images are viewable by everyone." ON public.hero_images FOR
SELECT USING (true);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
