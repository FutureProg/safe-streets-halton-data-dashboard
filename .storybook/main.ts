import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-designs",
    "@storybook/addon-a11y",
    "@storybook/addon-coverage",
    "@storybook/addon-docs",
    "@storybook/addon-vitest"
  ],

  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },

  build: {
    test: {
      disabledAddons: [
        '@storybook/addon-docs',
        '@storybook/addon-essentials/docs'
      ]
    }
  },

  staticDirs: ["../public"],

  docs: {},

};
export default config;
