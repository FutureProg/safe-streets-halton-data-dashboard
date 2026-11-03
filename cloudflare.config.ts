import { bindings, defineConfig, defineWorker } from "cf/config";

// Hyperdrive config ID for the dashboard's read-only database user. It is
// supplied by the deploy environment (the Workers Builds build variable HYPERDRIVE_ID)
// so no account-specific values are committed.
const hyperdriveId = process.env.HYPERDRIVE_ID;

// Preview builds (`cf previews deploy`) evaluate this config with isPreview = true.
// Previews must not claim the production custom domain, so it is left out for them.
// Instead they get a workers.dev address and preview URLs (otherwise the deploy
// prints no URL at all). Production stays on its custom domain only.
// Everything else, including the read-only Hyperdrive binding, stays the same.
export default defineConfig({
  worker: defineWorker(({ isPreview }) => ({
    name: "safe-streets-halton-dashboard",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-02",
    compatibilityFlags: ["nodejs_compat"],
    ...(isPreview
      ? { workersDev: true, previewUrls: true }
      : { domains: ["streetsdash.nickmorrison.me"] }),
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    observability: {
      logs: {
        enabled: true,
        invocationLogs: true,
        persist: true,
      },
      issues: {
        enabled: true,
      },
    },
    env: {
      ASSETS: bindings.assets(),
      ...(hyperdriveId
        ? { HYPERDRIVE: bindings.hyperdrive({ id: hyperdriveId }) }
        : {}),
    },
  })),
});
