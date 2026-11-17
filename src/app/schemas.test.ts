import { describe, expect, test } from "vite-plus/test";

import { encodeCursor } from "../db/pagination";
import { CaseQuerySchema, DataQuerySchema, MAX_PAGE_SIZE } from "./schemas";

const parse = (input: Record<string, unknown>) =>
  DataQuerySchema.safeParse(input);

describe("DataQuerySchema", () => {
  test("defaults to the last 30 days, a full page, and no cities", () => {
    const result = parse({ endDate: 1700000000000 });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.limit).toBe(MAX_PAGE_SIZE);
    expect(result.data.cities).toEqual([]);
    expect(result.data.endDate.getTime()).toBe(1700000000000);
    expect(
      result.data.endDate.getTime() - result.data.startDate.getTime(),
    ).toBe(30 * 24 * 60 * 60 * 1000);
  });

  test("splits and trims the city list", () => {
    const result = parse({ city: ["Oakville", " Burlington ", "Milton"] });
    expect(result.success && result.data.cities).toEqual([
      "Oakville",
      "Burlington",
      "Milton",
    ]);
  });

  test("accepts a cursor the endpoint produced", () => {
    const cursor = encodeCursor({ id: "abc", date: new Date(0).toISOString() });
    expect(parse({ cursor }).success).toBe(true);
  });

  test.each([
    ["non-numeric date", { startDate: "yesterday" }],
    ["fractional date", { startDate: 1.5 }],
    ["date out of range", { endDate: 1e17 }],
    ["limit above the maximum", { limit: 101 }],
    ["zero limit", { limit: 0 }],
    ["non-numeric limit", { limit: "ten" }],
    ["garbage cursor", { cursor: "not-a-cursor" }],
    ["cities as a string", { city: "Oakville,Milton" }],
    ["blank city", { city: ["Oakville", " "] }],
    ["too many cities", { city: Array(51).fill("x") }],
    ["start after end", { startDate: 2000, endDate: 1000 }],
  ])("rejects %s", (_name, input) => {
    expect(parse(input).success).toBe(false);
  });
});

describe("CaseQuerySchema", () => {
  const parseCase = (input: Record<string, unknown>) =>
    CaseQuerySchema.safeParse(input);

  test("trims the case number", () => {
    const result = parseCase({ caseNo: "  2024-123  " });
    expect(result.success && result.data.caseNo).toBe("2024-123");
  });

  test.each([
    ["missing", {}],
    ["blank", { caseNo: "   " }],
    ["too long", { caseNo: "x".repeat(65) }],
  ])("rejects a %s case number", (_name, input) => {
    expect(parseCase(input).success).toBe(false);
  });
});
