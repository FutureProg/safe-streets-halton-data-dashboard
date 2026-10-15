"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";
import { MapDataContext } from "../_state/MapDataState";

/** Tells the user when a search found nothing or failed. */
export default function SearchFeedback() {
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
        toast.error("Couldn't load incidents", {
          description: "Something went wrong. Please try searching again.",
        });
      } else if (
        snapshot.matches("success") &&
        snapshot.context.markerData?.length === 0
      ) {
        toast.info("No incidents found", {
          description: "Try a wider date range or more municipalities.",
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [mapDataActor]);

  return <Toaster position="bottom-center" />;
}
