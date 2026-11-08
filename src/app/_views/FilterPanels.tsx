import { SirenIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useContext } from "react";

import { IncidentTypeIcon } from "@/components/IncidentTypeIcon";
import MultiSelect from "@/components/MultiSelect";
import { Card } from "@/components/ui/card";

import FilterForm, { FilterFormValues } from "./FilterForm";
import { MapDataContext } from "../_state/MapDataState";
import { StaticValuesContext } from "../StaticValuesContext";

export type FilterValues = FilterFormValues & { incidentTypes: string[] };

type FilterPanelsProps = {
  values: FilterValues;
  onValuesChange: (values: Partial<FilterValues>) => void;
  /** Stack the filters inside a sheet instead of floating cards. */
  embedded?: boolean;
  onSearch?: () => void;
};

export default function FilterPanels({
  values,
  onValuesChange,
  embedded = false,
  onSearch,
}: FilterPanelsProps) {
  const { t: translate } = useTranslation();
  const { incidentTypes } = useContext(StaticValuesContext);
  const mapDataActor = MapDataContext.useActorRef();

  const onIncidentTypeChange = (selected: string[]) => {
    onValuesChange({ incidentTypes: selected });
    mapDataActor.send({
      type: "filterClient",
      filters: { incidentTypes: selected },
    });
  };

  const Container = embedded ? "div" : Card;
  return (
    <div
      className={
        embedded ? "flex flex-col gap-6" : "flex flex-col items-end gap-3"
      }
    >
      <FilterForm
        values={values}
        onValuesChange={onValuesChange}
        embedded={embedded}
        onSearch={onSearch}
      />
      <Container className={embedded ? undefined : "w-72 p-4"}>
        <MultiSelect
          label={
            <>
              <SirenIcon aria-hidden className="size-3.5" />
              {translate("IncidentType")}
            </>
          }
          options={incidentTypes}
          value={values.incidentTypes}
          onChange={onIncidentTypeChange}
          name="incidentType"
          renderIcon={(code) => <IncidentTypeIcon code={code} size={16} />}
        />
      </Container>
    </div>
  );
}
