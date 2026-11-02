import { bindings, defineConfig, defineWorker } from "cf/config";

// Hyperdrive config ID for the dashboard's read-only database user. It is
// supplied by the deploy environment (the Workers Builds build variable HYPERDRIVE_ID)
// so no account-specific values are committed.
const hyperdriveId = process.env.HYPERDRIVE_ID;

export default defineConfig({
  worker: defineWorker({
    name: "safe-streets-halton-dashboard",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-02",
    compatibilityFlags: ["nodejs_compat"],
    domains: ["streetsdash.nickmorrison.me"],
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
  }),
});
