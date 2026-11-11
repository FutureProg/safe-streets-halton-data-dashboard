import { env } from "cloudflare:workers";
import type { Flagship } from "@cloudflare/workers-types";

/**
 * Running inside a Cloudflare Worker: read the FLAGS binding declared in
 * cloudflare.config.ts. It is absent when FLAGSHIP_APP_ID was not set at
 * build time (previews, local), in which case flags resolve to fallbacks.
 */
export function getFlagshipBinding(): Flagship | undefined {
  return (env as unknown as { FLAGS?: Flagship }).FLAGS;
}
