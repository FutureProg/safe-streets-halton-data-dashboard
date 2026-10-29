import { CSSProperties, useState } from "react";

import { transitionView } from "@/lib/viewTransition";
import { ArrowLeftIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { dateRange } from "../_state/locations";
import { VisibleLocation } from "../_state/useVisibleLocations";
import IncidentDetail from "./IncidentDetail";
import IncidentTable from "./IncidentTable";
import { useCityLabel } from "./LocationList";
import { useLocaleFormatters } from "../../hooks/useLocaleFormatters";

/**
 * The card for one selected location: a header with its name and summary,
 * then either the list of its incidents or the detail of a single incident.
 */
export default function LocationIncidentsCard({
  location,
  variant,
  onClose,
  onBack,
}: {
  location: VisibleLocation;
  variant: "card" | "sheet";
  onClose: () => void;
  onBack?: () => void;
}) {
  const format = useLocaleFormatters();
  const { translate } = format;
  const cityLabel = useCityLabel();
  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [first, last] = dateRange(location.incidents);
  const isSheet = variant === "sheet";
  const incidentCount = translate("IncidentCount", { count: location.count });
  const range =
    first.toDateString() === last.toDateString()
      ? format.date(first)
      : `${format.date(first)} – ${format.date(last)}`;

  return (
    <Card
      role="region"
      aria-label={location.name || translate("UnknownLocation")}
      style={{ "--card-spacing": "0" } as CSSProperties}
      className={
        isSheet
          ? "incident-panel pointer-events-auto fixed inset-x-0 bottom-0 z-20 h-1/2 rounded-b-none py-0 shadow-lg"
          : "incident-panel pointer-events-auto absolute bottom-0 left-1/2 max-h-[40dvh] w-[40rem] max-w-[calc(100vw-40rem)] min-w-96 -translate-x-1/2 py-0"
      }
    >
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          {onBack ? (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2.5"
              onPress={onBack}
            >
              <ArrowLeftIcon aria-hidden />
              {translate("AllLocations")}
            </Button>
          ) : null}
          <h2 className="truncate text-sm font-medium">
            {location.name || translate("UnknownLocation")}
          </h2>
          <p className="text-muted-foreground">
            {cityLabel(location.city)} ·{incidentCount} · {range}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={translate("CloseLocation")}
          onPress={onClose}
        >
          <XIcon />
        </Button>
      </div>
      <div className="incident-panel-body min-h-0 flex-1 overflow-y-auto">
        {detailIndex === null ? (
          <IncidentTable
            incidents={location.incidents}
            onOpen={(index) =>
              transitionView(() => setDetailIndex(index), "forward")
            }
            stacked={isSheet}
          />
        ) : (
          <div className="pt-3">
            <IncidentDetail
              location={location}
              index={Math.min(detailIndex, location.incidents.length - 1)}
              onIndexChange={setDetailIndex}
              onBack={() =>
                transitionView(() => setDetailIndex(null), "backward")
              }
            />
          </div>
        )}
      </div>
    </Card>
  );
}
