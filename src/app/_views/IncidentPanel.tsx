import { useState } from "react";

import { transitionView } from "@/lib/viewTransition";
import {
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { CaseData } from "@/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { MapDataContext } from "../_state/MapDataState";
import { dateRange } from "../_state/locations";
import {
  VisibleLocation,
  useVisibleLocations,
} from "../_state/useVisibleLocations";
import { useCityLabel } from "./LocationList";

const useFormatters = () => {
  const { t: translate, i18n } = useTranslation();
  const { t: tStaticValues } = useTranslation("staticValues");
  return {
    date: (date: Date, style: "medium" | "full" = "medium") =>
      date.toLocaleDateString(i18n.language, { dateStyle: style }),
    time: (date: Date) =>
      date.toLocaleTimeString(i18n.language, { timeStyle: "short" }),
    description: (code: string) => tStaticValues(code),
    translate,
  };
};

function IncidentTable({
  incidents,
  onOpen,
  stacked,
}: {
  incidents: CaseData[];
  onOpen: (index: number) => void;
  stacked?: boolean;
}) {
  const format = useFormatters();
  const { translate } = format;
  if (stacked) {
    return (
      <ul>
        {incidents.map((incident, index) => (
          <li key={incident.globalID} className="border-t first:border-t-0">
            <button
              type="button"
              onClick={() => onOpen(index)}
              className="hover:bg-muted focus-visible:ring-ring flex w-full items-center justify-between gap-3 px-4 py-2 text-left outline-none focus-visible:ring-2"
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-sm font-medium">
                  {format.description(incident.description)}
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    · {incident.description}
                  </span>
                </span>
                <span className="text-muted-foreground">
                  {format.date(incident.date)} · {format.time(incident.date)} ·{" "}
                  {incident.case_no}
                </span>
              </span>
              <ChevronRightIcon
                aria-hidden
                className="text-muted-foreground size-4 shrink-0"
              />
            </button>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <table className="w-full text-left text-xs">
      <thead className="bg-card text-muted-foreground sticky top-0">
        <tr>
          <th scope="col" className="px-4 py-1.5 font-medium">
            {translate("Date")}
          </th>
          <th scope="col" className="px-2 py-1.5 font-medium">
            {translate("Time")}
          </th>
          <th scope="col" className="px-2 py-1.5 font-medium">
            {translate("Incident")}
          </th>
          <th scope="col" className="px-2 py-1.5 font-medium">
            {translate("CaseNumberShort")}
          </th>
          <th scope="col" className="w-8 px-2 py-1.5">
            <span className="sr-only">{translate("ViewIncident")}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {incidents.map((incident, index) => (
          <tr
            key={incident.globalID}
            onClick={() => onOpen(index)}
            className="hover:bg-muted cursor-pointer border-t"
          >
            <td className="px-4 py-1.5 whitespace-nowrap">
              {format.date(incident.date)}
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap">
              {format.time(incident.date)}
            </td>
            <td className="px-2 py-1.5">
              {/* The row handles the click; the button gives keyboard users a stop. */}
              <button
                type="button"
                className="focus-visible:ring-ring rounded text-left outline-none focus-visible:ring-2"
              >
                {format.description(incident.description)}
                <span className="text-muted-foreground">
                  {" "}
                  · {incident.description}
                </span>
              </button>
            </td>
            <td className="px-2 py-1.5 whitespace-nowrap">
              {incident.case_no}
            </td>
            <td className="px-2 py-1.5">
              <ChevronRightIcon
                aria-hidden
                className="text-muted-foreground size-4"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IncidentDetail({
  location,
  index,
  onIndexChange,
  onBack,
}: {
  location: VisibleLocation;
  index: number;
  onIndexChange: (index: number) => void;
  onBack: () => void;
}) {
  const format = useFormatters();
  const { translate } = format;
  const cityLabel = useCityLabel();
  const total = location.incidents.length;
  const incident = location.incidents[index];
  const move = (delta: number) =>
    onIndexChange((index + delta + total) % total);

  const details: [string, string][] = [
    [translate("Date"), format.date(incident.date, "full")],
    [translate("Time"), format.time(incident.date)],
    [translate("CaseNumberShort"), incident.case_no],
    [translate("Municipality"), cityLabel(incident.city)],
    [translate("Street"), incident.location],
    [
      translate("Intersection"),
      location.isIntersection ? location.name : translate("NoIntersection"),
    ],
  ];

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onPress={onBack}>
          <ArrowLeftIcon aria-hidden />
          {translate("AllIncidents")}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={translate("PreviousIncident")}
            onPress={() => move(-1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Badge variant="secondary">
            {translate("IncidentCounter", { current: index + 1, total })}
          </Badge>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={translate("NextIncident")}
            onPress={() => move(1)}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium">
          {format.description(incident.description)}
        </p>
        <p className="text-muted-foreground">{incident.description}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        {details.map(([term, description]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground font-medium">{term}</dt>
            <dd>{description}</dd>
          </div>
        ))}
      </dl>
      <p className="text-muted-foreground italic">
        {translate("ApproximateLocationNote")}
      </p>
    </div>
  );
}

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
  const { t: translate } = useTranslation();
  const locations = useVisibleLocations();
  const cityLabel = useCityLabel();
  const mapDataActor = MapDataContext.useActorRef();
  const selectedKey = MapDataContext.useSelector(
    (snapshot) => snapshot.context.selectedLocationKey,
  );
  const location = locations.find((item) => item.key === selectedKey);
  if (!location) return null;
  return (
    <SelectedLocation
      key={location.key}
      location={location}
      variant={variant}
      cityLabel={cityLabel(location.city)}
      onClose={() => mapDataActor.send({ type: "clearLocation" })}
      onBack={
        onBack
          ? () => {
              mapDataActor.send({ type: "clearLocation" });
              onBack();
            }
          : undefined
      }
      closeLabel={translate("CloseLocation")}
    />
  );
}

function SelectedLocation({
  location,
  variant,
  cityLabel,
  onClose,
  onBack,
  closeLabel,
}: {
  location: VisibleLocation;
  variant: "card" | "sheet";
  cityLabel: string;
  onClose: () => void;
  onBack?: () => void;
  closeLabel: string;
}) {
  const { t: translate } = useTranslation();
  const format = useFormatters();
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
      aria-label={location.name}
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
          <h2 className="truncate text-sm font-medium">{location.name}</h2>
          <p className="text-muted-foreground">
            {cityLabel} · {incidentCount} · {range}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={closeLabel}
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
              index={detailIndex}
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
