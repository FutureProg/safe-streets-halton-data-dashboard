"use client";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MarkerPopupContents } from "../MarkerPopupContents";
import { MapDataContext } from "@/app/_state/MapDataState";
import { useVisibleLocations } from "@/app/_state/useVisibleLocations";

import mvcCrashIcon from "@/img/mvc-crash-icon.png";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useMemo } from "react";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const PIN_SIZE: [number, number] = [32, 45];
const SELECTED_PIN_SIZE: [number, number] = [40, 56];

const createIcon = (selected: boolean) => {
  const [width, height] = selected ? SELECTED_PIN_SIZE : PIN_SIZE;
  return new L.Icon({
    iconUrl: mvcCrashIcon.src,
    iconRetinaUrl: mvcCrashIcon.src,
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -height],
    className: selected ? "location-pin-selected" : undefined,
  });
};

export default () => {
  const locations = useVisibleLocations();
  const selectedKey = MapDataContext.useSelector(
    (snapshot) => snapshot.context.selectedLocationKey,
  );

  const icons = useMemo(
    () => ({ normal: createIcon(false), selected: createIcon(true) }),
    [],
  );

  const items = useMemo(
    () =>
      locations.map((location) => {
        const isSelected = location.key === selectedKey;
        return (
          <Marker
            position={location.position}
            key={`Marker-${location.key}`}
            icon={isSelected ? icons.selected : icons.normal}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <MarkerPopupContents
              key={`Popup-${location.key}`}
              data={location.incidents}
            />
          </Marker>
        );
      }),
    [locations, selectedKey, icons],
  );

  return (
    <>
      {items.length > 0 ? (
        <MarkerClusterGroup chunkedLoading>{items}</MarkerClusterGroup>
      ) : null}
    </>
  );
};
