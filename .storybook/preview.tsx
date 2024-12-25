import React from "react";
import type { Preview } from "@storybook/react";
import TranslationProvider from "../src/app/TranslationProvider";
import initTranslations from "../src/app/i18n";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  tags: ["autodocs"],

  loaders: [
    async ({ locale = "en", i18nNamespaces = ["translations"] }) => ({
      i18nResources: (await initTranslations(locale, i18nNamespaces)).resources,
    }),
  ],

  decorators: [
    (Story, { parameters, loaded: {i18nResources} }) => {
      const {
        locale = "en",
        i18nNamespaces = ["translations"],
      } = parameters;

      return (
        <TranslationProvider
          locale={locale}
          namespaces={i18nNamespaces}
          resources={i18nResources}
        >
          <Story />
        </TranslationProvider>
      );
    },
  ],
};

export default preview;
