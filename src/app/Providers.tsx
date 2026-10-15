"use client";

import { PropsWithChildren } from "react";
import { I18nProvider } from "react-aria-components";
import { useTranslation } from "react-i18next";
import { MapDataContext } from "./_state/MapDataState";

const Providers = ({ children }: PropsWithChildren) => {
  const { i18n } = useTranslation();
  return (
    // Localizes React Aria dates, calendars and announcements to the route locale.
    <I18nProvider locale={i18n.language}>
      <MapDataContext.Provider>{children}</MapDataContext.Provider>
    </I18nProvider>
  );
};

export default Providers;
