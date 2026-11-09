"use client";

import { useTranslation } from "react-i18next";

import { Spinner } from "@/components/ui/spinner";
import { MapDataContext } from "../_state/MapDataState";

/**
 * A small pill at the top centre of the screen (the left stays clear) while
 * the automatic first load runs (a Search press has its own button spinner), so the map doesn't look broken before pins appear.
 */
export default function LoadingIndicator() {
  const { t: translate } = useTranslation();
  const isLoading = MapDataContext.useSelector(
    (snapshot) =>
      snapshot.matches("loading") && snapshot.context.loadSource === "auto",
  );
  if (!isLoading) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-5 z-20 flex justify-center">
      <div
        role="status"
        aria-live="polite"
        className="bg-card text-card-foreground flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-lg"
      >
        <Spinner aria-hidden className="size-4" />
        {translate("LoadingIncidents")}
      </div>
    </div>
  );
}
