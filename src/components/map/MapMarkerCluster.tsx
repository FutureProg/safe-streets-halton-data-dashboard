"use client";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MarkerPopupContents } from "../MarkerPopupContents";
import { MapDataContext } from "@/app/_state/MapDataState";
import { useFilteredLocations } from "@/app/_state/useFilteredLocations";

import {
  incidentIconSvg,
  mostSevereCode,
  selectedIconSize,
} from "@/lib/incidentTypes";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const BADGE_SIZE = 30;

const iconCache = new Map<string, L.DivIcon>();

/**
 * A location shows the badge of its most serious incident type. Selecting it
 * adds a ring around the badge, which grows the box but keeps the badge's
 * centre where it was.
 */
const getIcon = (code: string | undefined, selected: boolean) => {
  const key = `${code}|${selected}`;
  const cached = iconCache.get(key);
  if (cached) return cached;
  const size = selected ? selectedIconSize(BADGE_SIZE) : BADGE_SIZE;
  const icon = L.divIcon({
    html: incidentIconSvg(code ?? "", { selected }),
    className: "incident-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -BADGE_SIZE / 2],
  });
  iconCache.set(key, icon);
  return icon;
};

export default () => {
  const locations = useFilteredLocations();
  const selectedKey = MapDataContext.useSelector(
    (snapshot) => snapshot.context.selectedLocationKey,
  );

  const items = useMemo(
    () =>
      locations.map((location) => {
        const isSelected = location.key === selectedKey;
        return (
          <Marker
            position={location.position}
            key={`Marker-${location.key}`}
            icon={getIcon(mostSevereCode(location.incidents), isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            title={location.name}
          >
            <MarkerPopupContents
              key={`Popup-${location.key}`}
              data={location.incidents}
            />
          </Marker>
        );
      }),
    [locations, selectedKey],
  );

  return (
    <>
      {items.length > 0 ? (
        <MarkerClusterGroup chunkedLoading>{items}</MarkerClusterGroup>
      ) : null}
    </>
  );
};
