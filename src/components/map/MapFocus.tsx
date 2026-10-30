"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

import { MapDataContext } from "@/app/_state/MapDataState";
import { useFilteredLocations } from "@/app/_state/useFilteredLocations";

const FOCUS_ZOOM = 17;
/** Where the selected location sits, as a fraction of the map's height. */
const DESKTOP_ANCHOR = 0.35; // above the bottom-centre incident list
const PHONE_ANCHOR = 1 / 6; // centre of the top third, above the half sheet

/** Centres the map on the selected location, leaving room for its incident list. */
export default function MapFocus() {
  const map = useMap();
  const locations = useFilteredLocations();
  const selectedKey = MapDataContext.useSelector(
    (snapshot) => snapshot.context.selectedLocationKey,
  );

  const focusRequest = MapDataContext.useSelector(
    (snapshot) => snapshot.context.focusRequest,
  );

  useEffect(() => {
    const location = locations.find((item) => item.key === selectedKey);
    if (!location) return;
    const anchor = window.matchMedia("(min-width: 1024px)").matches
      ? DESKTOP_ANCHOR
      : PHONE_ANCHOR;
    const zoom = Math.max(map.getZoom(), FOCUS_ZOOM);
    const { y: height } = map.getSize();
    // Move the map's centre below the location, so the location lands at `anchor`.
    const centre = map
      .project(location.position, zoom)
      .add([0, height * (0.5 - anchor)]);
    map.flyTo(map.unproject(centre, zoom), zoom, { duration: 0.6 });
    // Only re-centre on a selection (even of the same row), not when filters re-sort the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKey, focusRequest, map]);

  return null;
}
