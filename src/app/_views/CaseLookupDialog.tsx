"use client";

import { FormEvent, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { CaseLookupContext } from "../_state/CaseLookupState";
import type { Location } from "../_state/locations";
import IncidentDetail from "./IncidentDetail";

/** The incidents of one location, using the same detail view as the map flow. */
function CaseResult({ location }: { location: Location }) {
  const [index, setIndex] = useState(0);
  return (
    <IncidentDetail
      location={{ ...location, count: location.incidents.length }}
      index={index}
      onIndexChange={setIndex}
    />
  );
}

function CaseLookupContent() {
  const { t: translate } = useTranslation();
  const actor = CaseLookupContext.useActorRef();
  const snapshot = CaseLookupContext.useSelector((s) => s);
  const { caseNo, locations } = snapshot.context;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get("caseNumber");
    actor.send({
      type: "submit",
      caseNo: typeof value === "string" ? value : "",
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{translate("CaseLookupTitle")}</DialogTitle>
        <DialogDescription>
          {translate("CaseLookupDescription")}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="px-6 pb-4">
        <Field>
          <FieldLabel htmlFor="caseNumber">
            <SearchIcon aria-hidden className="size-3.5" />
            {translate("CaseNumber")}
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id="caseNumber"
              name="caseNumber"
              autoFocus
              autoComplete="off"
              defaultValue={caseNo}
            />
            <Button type="submit" isDisabled={snapshot.matches("loading")}>
              {translate("Submit")}
            </Button>
          </div>
        </Field>
      </form>
      <div
        className="min-h-0 flex-1 overflow-y-auto border-t pt-4"
        aria-live="polite"
        hidden={snapshot.matches("idle")}
      >
        {snapshot.matches("loading") ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : null}
        {snapshot.matches("found")
          ? locations.map((location) => (
              <CaseResult key={location.key} location={location} />
            ))
          : null}
        {snapshot.matches("notFound") ? (
          <div className="px-6 pb-6">
            <p className="font-medium">
              {translate("CaseNotFound", { caseNo })}
            </p>
            <p className="text-muted-foreground">
              {translate("CaseNotFoundDescription")}
            </p>
          </div>
        ) : null}
        {snapshot.matches("failure") ? (
          <div className="px-6 pb-6">
            <p className="font-medium">{translate("CaseLookupFailed")}</p>
            <p className="text-muted-foreground">
              {translate("CaseLookupFailedDescription")}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}

/**
 * "Case lookup": a dialog with a search field. The incident found shows
 * below the field, and the field stays editable for another lookup. Its state
 * machine is created when the dialog opens, so it holds nothing from the map.
 */
export default function CaseLookupDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const { t: translate } = useTranslation();
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      closeLabel={translate("CloseDialog")}
    >
      <CaseLookupContext.Provider>
        <CaseLookupContent />
      </CaseLookupContext.Provider>
    </Dialog>
  );
}
