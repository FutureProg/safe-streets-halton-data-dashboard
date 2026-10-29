import { ChevronRightIcon } from "lucide-react";

import { CaseData } from "@/common";

import { useLocaleFormatters } from "../../hooks/useLocaleFormatters";

export default function IncidentTable({
  incidents,
  onOpen,
  stacked,
}: {
  incidents: CaseData[];
  onOpen: (index: number) => void;
  stacked?: boolean;
}) {
  const format = useLocaleFormatters();
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
