import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const realActions = path.resolve(dirname, "../src/app/actions.ts");
const mockActions = path.resolve(dirname, "mocks/actions.ts");

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-designs",
    "@storybook/addon-a11y",
    "@storybook/addon-coverage",
    "@storybook/addon-docs",
    "@storybook/addon-vitest",
  ],

  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },

  build: {
    test: {
      disabledAddons: [
        "@storybook/addon-docs",
        "@storybook/addon-essentials/docs",
      ],
    },
  },

  staticDirs: ["../public"],

  docs: {},

  // The server actions in src/app/actions.ts import the database driver, which
  // cannot load in the browser. Swap them for a stub, however they are imported.
  viteFinal: async (viteConfig) => {
    viteConfig.plugins = [
      ...(viteConfig.plugins ?? []),
      {
        name: "storybook-mock-server-actions",
        enforce: "pre",
        async resolveId(source, importer, options) {
          if (!importer || !/actions(\.ts)?$/.test(source)) return null;
          const resolved = await this.resolve(source, importer, {
            ...options,
            skipSelf: true,
          });
          return resolved?.id === realActions ? mockActions : null;
        },
      },
    ];
    return viteConfig;
  },
};
export default config;
