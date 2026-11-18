export default async () => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // The Cloudflare Worker build (vite.cloudflare.config.ts) must not emit a Node standalone bundle.
    output: process.env.CLOUDFLARE_BUILD ? undefined : "standalone",
  };

  return nextConfig;
};
