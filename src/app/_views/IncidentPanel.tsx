import { MapDataContext } from "../_state/MapDataState";
import { useFilteredLocations } from "../_state/useVisibleLocations";
import LocationIncidentsCard from "./LocationIncidentsCard";

/**
 * The incidents at the selected location. On desktop it is a card at the
 * bottom centre of the screen; on phones a half-height sheet with no overlay,
 * so the map above it stays usable. Only shown while a location is selected.
 */
export default function IncidentPanel({
  variant,
  onBack,
}: {
  variant: "card" | "sheet";
  /** Sheet only: return to the list of locations. */
  onBack?: () => void;
}) {
  const locations = useFilteredLocations();
  const mapDataActor = MapDataContext.useActorRef();
  const selectedKey = MapDataContext.useSelector(
    (snapshot) => snapshot.context.selectedLocationKey,
  );
  const location = locations.find((item) => item.key === selectedKey);
  if (!location) return null;
  return (
    <LocationIncidentsCard
      key={location.key}
      location={location}
      variant={variant}
      onClose={() => mapDataActor.send({ type: "clearLocation" })}
      onBack={
        onBack
          ? () => {
              mapDataActor.send({ type: "clearLocation" });
              onBack();
            }
          : undefined
      }
    />
  );
}
