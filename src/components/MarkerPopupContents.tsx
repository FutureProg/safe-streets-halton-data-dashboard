import { CaseData } from "@/common";
import { useState } from "react";
import { Popup } from "react-leaflet";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocaleFormatters } from "@/hooks/useLocaleFormatters";

export interface MarkerPopupContentProps {
  key: string;
  data: CaseData[];
}

export const MarkerPopupContents = (props: MarkerPopupContentProps) => {
  const format = useLocaleFormatters();
  const { translate } = format;
  const onPageButtonClick = (delta: number) => () => {
    let nPageNum = pageNumber + delta;
    if (nPageNum >= props.data.length) {
      nPageNum = 0;
    } else if (nPageNum < 0) {
      nPageNum = props.data.length - 1;
    }
    setPageNumber(nPageNum);
  };

  let [pageNumber, setPageNumber] = useState(0);
  let caseData = props.data[pageNumber];
  // Typically will trigger on a reload
  if (!caseData && props.data.length > 0) {
    caseData = props.data[0];
    setPageNumber(0);
  } else if (!caseData || props.data.length == 0) {
    return <></>;
  }

  const details: [string, string][] = [
    [translate("CaseNumberShort"), caseData.case_no],
    [translate("Municipality"), caseData.city],
    [translate("Date"), format.date(caseData.date, "full")],
    [translate("Time"), format.time(caseData.date)],
    [translate("IncidentCode"), caseData.description],
    [translate("Description"), format.description(caseData.description)],
  ];

  return (
    <Popup>
      <div className="flex min-w-56 flex-col gap-3">
        {props.data.length > 1 ? (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={translate("PreviousIncident")}
              onPress={onPageButtonClick(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Badge variant="secondary">
              {translate("IncidentCounter", {
                current: pageNumber + 1,
                total: props.data.length,
              })}
            </Badge>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={translate("NextIncident")}
              onPress={onPageButtonClick(1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        ) : null}
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          {details.map(([term, description]) => (
            <div key={term} className="contents">
              <dt className="text-muted-foreground font-medium">{term}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Popup>
  );
};
