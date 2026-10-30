import { useMemo } from "react";

import { MapDataContext } from "./MapDataState";
import { Location, sortLocations } from "./locations";

export type FilteredLocation = Location & { count: number };

/**
 * The locations of the current search after the client-side filters (so far
 * only incident type), highest incident count first. The map pins and the
 * Locations list both read this, so they never disagree.
 */
export function useFilteredLocations(): FilteredLocation[] {
  const locations = MapDataContext.useSelector(
    (snapshot) => snapshot.context.locations,
  );
  const clientFilters = MapDataContext.useSelector(
    (snapshot) => snapshot.context.clientFilters,
  );
  const status = MapDataContext.useSelector((snapshot) =>
    snapshot.matches("success"),
  );
  return useMemo(() => {
    if (!status || !locations) return [];
    const types = clientFilters?.incidentTypes ?? [];
    return sortLocations(
      locations
        .map((location) => {
          const incidents = location.incidents.filter((incident) =>
            types.includes(incident.description),
          );
          return { ...location, incidents, count: incidents.length };
        })
        .filter((location) => location.count > 0),
    );
  }, [locations, clientFilters, status]);
}
