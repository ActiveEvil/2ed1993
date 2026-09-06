const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SUPABASE_PROJECT_ID is not set");
}

const encodePath = (path: string): string =>
  path.split("/").map(encodeURIComponent).join("/");

export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality: number;
}) {
  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${encodePath(src)}?width=${width}&quality=${quality || 75}&resize=contain`;
}
