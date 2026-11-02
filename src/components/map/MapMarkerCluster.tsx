"use client";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MarkerPopupContents } from "../MarkerPopupContents";
import { MapDataContext } from "@/app/_state/MapDataState";
import { useFilteredLocations } from "@/app/_state/useFilteredLocations";

import { clusterIconHtml } from "@/lib/clusterStyle";
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

const CLUSTER_SIZE = 40;

/** Incidents a marker stands for, kept on its options for the cluster badge. */
type CountedMarker = L.Marker & { options: { incidentCount?: number } };

/** The part of leaflet.markercluster's cluster this file uses (no typings ship). */
type Cluster = { getAllChildMarkers: () => L.Marker[] };

const createClusterIcon = (cluster: Cluster, cap: number) => {
  const incidentCount = cluster
    .getAllChildMarkers()
    .reduce(
      (total, marker) =>
        total + ((marker as CountedMarker).options.incidentCount ?? 1),
      0,
    );
  return L.divIcon({
    html: clusterIconHtml(incidentCount, cap),
    className: "incident-cluster",
    iconSize: [CLUSTER_SIZE, CLUSTER_SIZE],
  });
};

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
    className: selected
      ? "incident-marker incident-marker-selected"
      : "incident-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -BADGE_SIZE / 2],
  });
  iconCache.set(key, icon);
  return icon;
};

export default () => {
  const locations = useFilteredLocations();
  // The busiest a cluster can get: every incident in the current results.
  const totalIncidents = useMemo(
    () => locations.reduce((total, location) => total + location.count, 0),
    [locations],
  );
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
            {...({ incidentCount: location.count } as object)}
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
        <MarkerClusterGroup
          key={totalIncidents}
          chunkedLoading
          iconCreateFunction={(cluster: Cluster) =>
            createClusterIcon(cluster, totalIncidents)
          }
        >
          {items}
        </MarkerClusterGroup>
      ) : null}
    </>
  );
};
