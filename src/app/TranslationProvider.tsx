"use client";

import { I18nextProvider } from "react-i18next";
import initTranslations from "./i18n";
import { createInstance } from "i18next";
import React from "react";

type TranslationProviderProps = {
    children: React.ReactNode;
    locale: string;
    namespaces: string[];
    resources: any;
};

const TranslationProvider = (
    { children, locale, namespaces, resources }: TranslationProviderProps,
) => {
    const i18n = createInstance();
    initTranslations(locale, namespaces, i18n, resources);
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default TranslationProvider;
