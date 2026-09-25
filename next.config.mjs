/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Artwork photos are uploaded straight to Supabase Storage from the
      // browser, so actions only carry form fields.
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
