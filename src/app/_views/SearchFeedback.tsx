"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { MapDataContext } from "../_state/MapDataState";

/** Tells the user when a search found nothing or failed. */
export default function SearchFeedback() {
  const { t } = useTranslation();
  // The translation instance is recreated on every render; keep the
  // subscription below stable.
  const translateRef = useRef(t);
  translateRef.current = t;
  const mapDataActor = MapDataContext.useActorRef();

  useEffect(() => {
    let previous = mapDataActor.getSnapshot().value;
    const subscription = mapDataActor.subscribe((snapshot) => {
      // Client-side filter changes re-emit the snapshot; only react to
      // actual transitions out of "loading".
      const justFinished =
        previous === "loading" && snapshot.value !== previous;
      previous = snapshot.value;
      if (!justFinished) return;
      if (snapshot.matches("failure")) {
        toast.error(translateRef.current("LoadFailed"), {
          description: translateRef.current("LoadFailedDescription"),
        });
      } else if (
        snapshot.matches("success") &&
        snapshot.context.markerData?.length === 0
      ) {
        toast.info(translateRef.current("NoIncidentsFound"), {
          description: translateRef.current("NoIncidentsFoundDescription"),
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [mapDataActor]);

  return <Toaster position="bottom-center" />;
}
