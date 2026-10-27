import { describe, expect, test } from "vite-plus/test";
import { dateRange, groupLocations, sortLocations } from "./locations";

const record = (overrides: Record<string, unknown> = {}) => ({
  caseNo: "C-1",
  date: "2026-10-01T12:00:00Z",
  description: "MVC - PI",
  location: "DUNDAS ST",
  city: "OAKVILLE",
  latitude: 43.4675,
  longitude: -79.6877,
  globalId: "G-1",
  ...overrides,
});

const matched = (overrides: Record<string, unknown> = {}) =>
  record({
    intersectionId: "dpk8x",
    intersectionLabel: "Dundas St & Walkers Line",
    intersectionLatitude: 43.46,
    intersectionLongitude: -79.68,
    ...overrides,
  });

describe("groupLocations", () => {
  test("groups incidents matched to the same intersection", () => {
    const locations = groupLocations([
      matched({ globalId: "G-1" }),
      matched({ globalId: "G-2", latitude: 43.4676 }),
    ]);
    expect(locations).toHaveLength(1);
    expect(locations[0]).toMatchObject({
      key: "i:dpk8x",
      name: "Dundas St & Walkers Line",
      position: [43.46, -79.68],
      isIntersection: true,
    });
    expect(locations[0].incidents).toHaveLength(2);
  });

  test("gives unmatched incidents their own row, named after the HRPS street", () => {
    const locations = groupLocations([
      record({ globalId: "G-1" }),
      record({ globalId: "G-2", latitude: 43.5, location: "MAIN ST" }),
      record({ globalId: "G-3" }),
    ]);
    expect(locations.map((l) => [l.name, l.incidents.length])).toEqual([
      ["DUNDAS ST", 2],
      ["MAIN ST", 1],
    ]);
    expect(locations.every((l) => !l.isIntersection)).toBe(true);
  });

  test("treats an intersection id without coordinates as unmatched", () => {
    const [location] = groupLocations([record({ intersectionId: "x" })]);
    expect(location.isIntersection).toBe(false);
  });
});

test("sortLocations puts the highest count first", () => {
  const sorted = sortLocations([
    { name: "B", count: 2 },
    { name: "A", count: 2 },
    { name: "C", count: 9 },
  ]);
  expect(sorted.map((l) => l.name)).toEqual(["C", "A", "B"]);
});

test("dateRange returns the earliest and latest incident dates", () => {
  const [first, last] = dateRange(
    groupLocations([
      record({ date: "2026-10-05T00:00:00Z" }),
      record({ date: "2026-10-01T00:00:00Z", globalId: "G-2" }),
    ])[0].incidents,
  );
  expect(first.toISOString()).toBe("2026-10-01T00:00:00.000Z");
  expect(last.toISOString()).toBe("2026-10-05T00:00:00.000Z");
});
