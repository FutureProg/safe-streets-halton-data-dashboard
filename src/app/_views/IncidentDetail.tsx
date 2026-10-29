import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { VisibleLocation } from "../_state/useVisibleLocations";
import { useCityLabel } from "./LocationList";
import { useLocaleFormatters } from "../../hooks/useLocaleFormatters";

export default function IncidentDetail({
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
  const format = useLocaleFormatters();
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
