CREATE TABLE public.image_galleries (
  name text NOT NULL,
  image_id integer NOT NULL REFERENCES public.images(id),
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (name, image_id)
);

CREATE INDEX image_galleries_image_id_idx ON public.image_galleries (image_id);

CREATE POLICY "Public image_galleries are viewable by everyone." ON public.image_galleries FOR
SELECT USING (true);

ALTER TABLE public.image_galleries ENABLE ROW LEVEL SECURITY;
