/** Turns a stored image reference into a URL the browser can load. */
export function imageUrl(path: string | undefined | null): string | null {
  if (!path) return null;
  if (/^(https?:|data:)/.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/artworks/${path
    .split('/')
    .map(encodeURIComponent)
    .join('/')}`;
}
