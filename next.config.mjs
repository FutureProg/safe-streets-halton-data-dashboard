import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

export default async (phase) => {
  const env = {
    dataAPI:
      phase === PHASE_DEVELOPMENT_SERVER
        ? "http://localhost:3091"
        : "https://nickmorrison.me:3091",
  };

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    env,
    // The Cloudflare Worker build (vite.cloudflare.config.ts) must not emit a Node standalone bundle.
    output: process.env.CLOUDFLARE_BUILD ? undefined : "standalone",
  };

  return nextConfig;
};
