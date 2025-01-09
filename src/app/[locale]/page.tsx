"use client";
import BaseMap from "@/components/BaseMap";
import styles from "./page.module.scss";
import MenuPanel from "@/app/_views/MenuPanel";
import SimpleForm from "@/components/SimpleForm";
import FormLabel from "@/components/FormLabel";

import LookupIcon from "@/img/icon-lookup.svg";
import Panel from "@/components/Panel";
import InputText from "@/components/InputText";
import FormElement from "@/components/FormElement";
import MultiSelect from "@/components/MultiSelect";
import FilterForm from "../_views/FilterForm";
import CarCrashIcon from "@/img/icon-car-crash.svg";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import { HTMLInputOption } from "../common";

const MapMakerCluster = dynamic(
  () => import("@/components/map/MapMarkerCluster"),
  { ssr: false },
);

export default function Home() {
  let { t: translate } = useTranslation();

  const incidentTypes = [
    { label: "Fatality", value: "Fatality" },
    { label: "Injury", value: "Injury" },
  ] satisfies HTMLInputOption[];

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
        <div></div>
        <div className="hidden lg:flex absolute right-0 flex-col items-end gap-3 *:pointer-events-auto">
          {/* Lookup by Case ID */}
          <Panel>
            <SimpleForm>
              <FormElement>
                <FormLabel
                  icon={{ src: LookupIcon, alt: "" }}
                  htmlFor="caseNumber"
                >
                  Case Number
                </FormLabel>
                <InputText id="caseNumber" name="caseNumber" />
              </FormElement>
            </SimpleForm>
          </Panel>
          <FilterForm />
          <div className={styles.divider}></div>
          <Panel>
            <FormElement>
              <FormLabel
                icon={{ src: CarCrashIcon, alt: "" }}
                htmlFor="incidentType"
              >
                {translate("IncidentType")}
              </FormLabel>
              <MultiSelect
                options={incidentTypes}
                defaultValues={incidentTypes.map(({ value }) => value)}
                name="incidentType"
                id="incidentType"
              />
            </FormElement>
          </Panel>
        </div>
      </div>
    </main>
  );
}
