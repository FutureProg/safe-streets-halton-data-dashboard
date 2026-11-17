import { defineConfig } from "vite";
import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { createHash } from "node:crypto";
import { patchCssModules } from "vite-css-modules";
import path from "node:path";

export default defineConfig({
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: [
      {
        // Connect through the Hyperdrive binding instead of DB_* variables.
        // Exact specifier only: pg has its own internal "./connection" module.
        find: /^@\/db\/connection$/,
        replacement: path.resolve(
          import.meta.dirname,
          "src/db/connection.cloudflare.ts",
        ),
      },
      {
        // Read the Flagship binding from the Worker env.
        find: /^@\/lib\/flags\/flags-binding$/,
        replacement: path.resolve(
          import.meta.dirname,
          "src/lib/flags-binding.cloudflare.ts",
        ),
      },
    ],
  },
  plugins: [
    patchCssModules({ exportMode: "default" }),
    vinext(),
    cloudflare({
      viteEnvironment: {
        name: "rsc",
        childEnvironments: ["ssr"],
      },
    }),
  ],
  css: {
    modules: {
      generateScopedName(name: string, filename: string) {
        const relativePath = path
          .relative(import.meta.dirname, filename.replace(/\?.*$/, ""))
          .replaceAll("\\", "/");
        return `_${name}_${createHash("sha256").update(relativePath).digest("hex").slice(0, 7)}`;
      },
    },
  },
});
