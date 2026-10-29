import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "cn";

import { MapDataContext } from "../_state/MapDataState";
import { useVisibleLocations } from "../_state/useVisibleLocations";
import { StaticValuesContext } from "../StaticValuesContext";

/** The municipality as the user's language writes it (HRPS sends it in capitals). */
export function useCityLabel() {
  const { cities } = useContext(StaticValuesContext);
  return (city: string) =>
    cities.find((option) => option.value === city)?.label ?? city;
}

export function useTotalIncidents() {
  return useVisibleLocations().reduce(
    (sum, location) => sum + location.count,
    0,
  );
}

/** Every location in the current search, busiest first. Selecting one centres the map on it. */
export default function LocationList({
  onSelect,
}: {
  onSelect?: (key: string) => void;
}) {
  const { t: translate } = useTranslation();
  const locations = useVisibleLocations();
  const cityLabel = useCityLabel();
  const mapDataActor = MapDataContext.useActorRef();
  const selectedKey = MapDataContext.useSelector(
    (snapshot) => snapshot.context.selectedLocationKey,
  );

  if (locations.length === 0) {
    return (
      <p className="text-muted-foreground px-(--card-spacing,1rem) py-2 text-xs">
        {translate("NoLocations")}
      </p>
    );
  }

  return (
    <ul aria-label={translate("Locations")} className="flex flex-col">
      {locations.map((location) => {
        const isSelected = location.key === selectedKey;
        return (
          <li key={location.key}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => {
                mapDataActor.send({
                  type: "selectLocation",
                  key: location.key,
                });
                onSelect?.(location.key);
              }}
              className={cn(
                "hover:bg-muted focus-visible:ring-ring flex w-full items-center justify-between gap-3 px-4 py-2 text-left outline-none focus-visible:ring-2",
                isSelected && "bg-primary/10 ring-primary ring-1 ring-inset",
              )}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {location.name || translate("UnknownLocation")}
                </span>
                <span className="text-foreground/70 truncate">
                  {cityLabel(location.city)}
                </span>
              </span>
              <span
                className="text-sm font-medium tabular-nums"
                aria-label={translate("IncidentCount", {
                  count: location.count,
                })}
              >
                {location.count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
