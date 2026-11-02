import { describe, expect, test } from "vite-plus/test";
import {
  incidentIconSvg,
  mostSevereCode,
  selectedIconSize,
} from "./incidentTypes";

const CODES = [
  "MVC - FATALITY",
  "MVC - PI",
  "MVC - HIT & RUN",
  "DANGEROUS OPERATION - TRAFFIC",
  "IMPAIRED DRIVING",
  "ROADSIDE TEST",
  "THEFT OF BICYCLE",
];

describe("incidentIconSvg", () => {
  test("gives every incident type its own outline", () => {
    const outlines = CODES.map(
      (code) =>
        incidentIconSvg(code).match(/<(polygon|circle|rect)[^>]*\/>/)?.[0],
    );
    expect(new Set(outlines).size).toBe(CODES.length);
  });

  test("falls back to a neutral badge for unknown codes", () => {
    expect(incidentIconSvg("SOMETHING NEW")).toContain("#5a6a62");
  });

  test("adds a ring that follows the outline when selected", () => {
    const plain = incidentIconSvg("IMPAIRED DRIVING");
    const selected = incidentIconSvg("IMPAIRED DRIVING", { selected: true });
    expect(plain).not.toContain("#2f8a57");
    expect(selected.match(/<polygon/g)).toHaveLength(3);
    expect(selectedIconSize(48)).toBe(70);
  });
});

describe("mostSevereCode", () => {
  test("picks the most serious type", () => {
    expect(
      mostSevereCode([
        { description: "ROADSIDE TEST" },
        { description: "MVC - PI" },
        { description: "MVC - HIT & RUN" },
      ]),
    ).toBe("MVC - PI");
  });

  test("ranks unknown types last and handles no incidents", () => {
    expect(
      mostSevereCode([
        { description: "NEW" },
        { description: "ROADSIDE TEST" },
      ]),
    ).toBe("ROADSIDE TEST");
    expect(mostSevereCode([])).toBeUndefined();
  });
});
