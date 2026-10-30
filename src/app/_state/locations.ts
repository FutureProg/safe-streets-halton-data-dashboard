import type { CaseData } from "@/common";

/**
 * A place incidents can be browsed by: a matched intersection, or, for
 * incidents that don't match one, the spot the police reported them at.
 */
export interface Location {
  key: string;
  /** Intersection label, or the HRPS street for unmatched incidents. */
  name: string;
  city: string;
  position: [number, number];
  incidents: CaseData[];
  isIntersection: boolean;
}

type IncidentRecord = Record<string, any>;

const toCaseData = (record: IncidentRecord): CaseData => ({
  case_no: record["caseNo"],
  city: record["city"],
  date: new Date(record["date"]),
  description: record["description"],
  globalID: record["globalId"] ?? record["globalID"],
  latitude: record["latitude"],
  location: record["location"],
  longitude: record["longitude"],
  intersectionId: record["intersectionId"] ?? null,
  intersectionLabel: record["intersectionLabel"] ?? null,
});

/** Groups incidents by intersection; unmatched ones group by reported spot. */
export function groupLocations(records: IncidentRecord[]): Location[] {
  const groups = new Map<string, Location>();
  for (const record of records) {
    const caseData = toCaseData(record);
    const matched =
      caseData.intersectionId &&
      typeof record["intersectionLatitude"] === "number" &&
      typeof record["intersectionLongitude"] === "number";
    const lat = Number.parseFloat(caseData.latitude.toFixed(4));
    const lng = Number.parseFloat(caseData.longitude.toFixed(4));
    const key = matched ? `i:${caseData.intersectionId}` : `p:${lat},${lng}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        name: matched
          ? (caseData.intersectionLabel ?? caseData.location ?? "")
          : (caseData.location ?? ""),
        city: caseData.city,
        position: matched
          ? [record["intersectionLatitude"], record["intersectionLongitude"]]
          : [lat, lng],
        incidents: [],
        isIntersection: Boolean(matched),
      };
      groups.set(key, group);
    }
    group.incidents.push(caseData);
  }
  return [...groups.values()];
}

/** Highest incident count first; ties broken by name so the order is stable. */
export const sortLocations = <T extends { name: string; count: number }>(
  locations: T[],
) =>
  [...locations].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name),
  );

export const dateRange = (incidents: CaseData[]) => {
  const times = incidents.map((incident) => incident.date.getTime());
  return [new Date(Math.min(...times)), new Date(Math.max(...times))] as const;
};
