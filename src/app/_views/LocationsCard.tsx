import { MapPinIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LocationList, { useTotalIncidents } from "./LocationList";

/** Desktop: the locations of the current search, under the filters. */
export default function LocationsCard() {
  const { t: translate } = useTranslation();
  const total = useTotalIncidents();
  return (
    <Card className="min-h-0 w-72 flex-1 gap-0 py-0">
      <CardHeader className="border-b py-3">
        <CardTitle className="flex items-center gap-1.5">
          <MapPinIcon aria-hidden className="size-3.5" />
          {translate("Locations")}
        </CardTitle>
        <CardDescription>
          {translate("IncidentCount", { count: total })}
        </CardDescription>
      </CardHeader>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        <LocationList />
      </div>
    </Card>
  );
}
