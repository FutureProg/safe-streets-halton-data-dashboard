import { FormEventHandler, useContext, useState } from "react";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { DatePicker } from "@/components/ui/date-picker";
import MultiSelect from "@/components/MultiSelect";

import { MapDataContext } from "../_state/MapDataState";
import { StaticValuesContext } from "../StaticValuesContext";

export type FilterFormValues = {
  startDate: CalendarDate | null;
  endDate: CalendarDate | null;
  cities: string[];
};

export const useFilterFormValues = (): [
  FilterFormValues,
  (values: Partial<FilterFormValues>) => void,
] => {
  const { cities } = useContext(StaticValuesContext);
  const [values, setValues] = useState<FilterFormValues>(() => {
    const endDate = today(getLocalTimeZone());
    return {
      startDate: endDate.subtract({ days: 7 }),
      endDate,
      cities: cities.map(({ value }) => value),
    };
  });
  return [values, (patch) => setValues((prev) => ({ ...prev, ...patch }))];
};

export type FilterFormProps = {
  values: FilterFormValues;
  onValuesChange: (values: Partial<FilterFormValues>) => void;
  /** Render without the surrounding card, e.g. inside a sheet. */
  embedded?: boolean;
  onSearch?: () => void;
};

const evalDate = (dateStr: string, boundary: "start" | "end") => {
  let newDate = Date.parse(dateStr);
  if (boundary == "end") {
    let baseDate = new Date(newDate);
    newDate = new Date(newDate).setDate(baseDate.getDate() + 1);
    newDate = new Date(newDate).setMilliseconds(baseDate.getMilliseconds() - 1);
  }
  return newDate;
};

export default function FilterForm({
  values,
  onValuesChange,
  embedded = false,
  onSearch,
}: FilterFormProps) {
  const mapDataActor = MapDataContext.useActorRef();
  const loadStatus = MapDataContext.useSelector((snapshot) => snapshot.value);
  const { cities: cityOptions } = useContext(StaticValuesContext);
  const isLoading = loadStatus === "loading";

  const onSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();
    if (isLoading || !values.startDate || !values.endDate) return;
    mapDataActor.send({
      type: "request",
      params: {
        city: values.cities,
        endDate: `${evalDate(values.endDate.toString(), "end")}`,
        startDate: `${evalDate(values.startDate.toString(), "start")}`,
      },
    });
    onSearch?.();
  };

  const Container = embedded ? "div" : Card;
  return (
    <Container className={embedded ? undefined : "w-72 p-4"}>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <DatePicker
            label="Start Date"
            name="startDate"
            value={values.startDate}
            isInvalid={!values.startDate}
            onChange={(startDate) => onValuesChange({ startDate })}
          />
          <DatePicker
            label="End Date"
            name="endDate"
            value={values.endDate}
            isInvalid={!values.endDate}
            onChange={(endDate) => onValuesChange({ endDate })}
          />
          <MultiSelect
            label={
              <>
                <MapPinIcon aria-hidden className="size-3.5" />
                Municipality
              </>
            }
            options={cityOptions}
            value={values.cities}
            onChange={(cities) => onValuesChange({ cities })}
            name="city"
          />
          <Button type="submit" className="w-full">
            {isLoading ? <Spinner aria-hidden /> : null}
            Search
          </Button>
        </FieldGroup>
      </form>
    </Container>
  );
}
