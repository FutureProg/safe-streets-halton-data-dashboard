"use client";
import BaseMap from "@/components/BaseMap";
import MenuPanel from "@/app/_views/MenuPanel";
import FilterPanels, { CaseLookup, FilterValues } from "../_views/FilterPanels";
import { useFilterFormValues } from "../_views/FilterForm";
import SearchFeedback from "../_views/SearchFeedback";
import { SlidersHorizontalIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useContext, useEffect, useState } from "react";
import { StaticValuesContext } from "../StaticValuesContext";
import { MapDataContext } from "../_state/MapDataState";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MapMakerCluster = dynamic(
  () => import("@/components/map/MapMarkerCluster"),
  { ssr: false },
);

export default function Home() {
  const { t: translate } = useTranslation();
  const staticValues = useContext(StaticValuesContext);
  const mapDataActor = MapDataContext.useActorRef();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [formValues, setFormValues] = useFilterFormValues();
  const [incidentTypes, setIncidentTypes] = useState(() =>
    staticValues.incidentTypes.map(({ value }) => value),
  );
  const filters: FilterValues = { ...formValues, incidentTypes };
  const onFiltersChange = ({
    incidentTypes,
    ...formPatch
  }: Partial<FilterValues>) => {
    if (incidentTypes) setIncidentTypes(incidentTypes);
    setFormValues(formPatch);
  };

  useEffect(() => {
    mapDataActor.send({
      type: "filterClient",
      filters: {
        incidentTypes: staticValues.incidentTypes.map(({ value }) => value),
      },
    });
  }, []);

  return (
    <main>
      <div className="absolute inset-0 z-0">
        <BaseMap>
          <MapMakerCluster />
        </BaseMap>
      </div>
      <div className="pointer-events-none absolute inset-x-3 inset-y-5 z-10">
        <div className="absolute left-0 flex flex-col gap-3 *:pointer-events-auto">
          <MenuPanel />
        </div>
        {isDesktop ? (
          <div className="absolute right-0 flex flex-col items-end gap-3 *:pointer-events-auto">
            <CaseLookup />
            <FilterPanels values={filters} onValuesChange={onFiltersChange} />
          </div>
        ) : (
          <div className="pointer-events-auto absolute right-0">
            <SheetTrigger isOpen={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <Button variant="secondary" size="lg">
                <SlidersHorizontalIcon />
                {translate("Filters")}
              </Button>
              <SheetContent side="bottom" className="max-h-[85dvh]">
                <SheetHeader>
                  <SheetTitle>{translate("Filters")}</SheetTitle>
                  <SheetDescription>
                    {translate("FiltersDescription")}
                  </SheetDescription>
                </SheetHeader>
                <div className="overflow-y-auto px-6 pb-6">
                  <FilterPanels
                    embedded
                    values={filters}
                    onValuesChange={onFiltersChange}
                    onSearch={() => setIsSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </SheetTrigger>
          </div>
        )}
      </div>
      <SearchFeedback />
    </main>
  );
}
