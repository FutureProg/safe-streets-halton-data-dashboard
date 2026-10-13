import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite-plus";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

import { playwright } from "vite-plus/test/browser-playwright";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    // Vitest v4 compatibility: preserve mock call history.
    // Remove after tests no longer rely on calls from setup or earlier tests.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
    clearMocks: false,
    // Vitest v4 compatibility: keep separate Vite servers for inline projects.
    // Remove when plugins and config hooks can run once for shared projects.
    // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
    // https://vitest.dev/guide/migration/#inline-projects-share-the-vite-server-by-default
    sharedViteServer: false,
    projects: [
      {
        // Vitest v4 compatibility: keep this inline project independent of the root config.
        // Remove to inherit root options, including plugins and setup files.
        // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
        // https://vitest.dev/guide/migration/#inline-projects-inherit-the-root-config-by-default
        extends: false,
        test: {
          // Vitest v4 compatibility: preserve mock call history.
          // Remove after tests no longer rely on calls from setup or earlier tests.
          // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
          // https://vitest.dev/guide/migration/#clearmocks-is-enabled-by-default
          clearMocks: false,
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: {
            locators: {
              // Vitest v4 compatibility: keep partial, case-insensitive locator matching.
              // Remove after updating locators for full, case-sensitive matches.
              // https://viteplus.dev/guide/vitest-v5#remove-unneeded-compatibility-settings
              // https://vitest.dev/guide/migration/#locators-are-strict-by-default
              exact: false,
            },
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
          env: {
            // Define environment variables for Storybook tests
            DB_USER: "test_user",
            DB_HOST: "localhost",
            DB_PASS: "test_pass",
            DB_PORT: "3306",
            DB_NAME: "test_db",
            dataAPI: "http://localhost:3000/api",
          },
        },
      },
    ],
  },
});
