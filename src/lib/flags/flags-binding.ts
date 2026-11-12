import type { Flagship } from "@cloudflare/workers-types";

/**
 * The Flagship binding for the Node runtime (local dev, tests, `next start`).
 * There is none, so flags resolve to their fallbacks. The Cloudflare build
 * swaps this module for `flags-binding.cloudflare.ts`
 * (see vite.cloudflare.config.ts).
 */
export function getFlagshipBinding(): Flagship | undefined {
  return undefined;
}
