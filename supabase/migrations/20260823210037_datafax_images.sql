create table public.datafax_images (
  datafax_id  integer not null references public.datafaxes (id) on delete cascade,
  image_id    integer not null references public.images (id),
  position    integer not null default 0,
  primary key (datafax_id, image_id)
);
alter table public.datafax_images enable row level security;
create policy "Public datafax_images are viewable by everyone."
  on public.datafax_images for select using (true);
