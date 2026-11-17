import { describe, expect, test } from "vite-plus/test";
import * as v from "valibot";

import { encodeCursor } from "./pagination";
import { CaseQuerySchema, DataQuerySchema, MAX_PAGE_SIZE } from "./schemas";

const parse = (input: Record<string, string>) =>
  v.safeParse(DataQuerySchema, input);

describe("DataQuerySchema", () => {
  test("defaults to the last 30 days, a full page, and no cities", () => {
    const result = parse({ endDate: "1700000000000" });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.output.limit).toBe(MAX_PAGE_SIZE);
    expect(result.output.cities).toEqual([]);
    expect(result.output.endDate.getTime()).toBe(1700000000000);
    expect(
      result.output.endDate.getTime() - result.output.startDate.getTime(),
    ).toBe(30 * 24 * 60 * 60 * 1000);
  });

  test("splits and trims the city list", () => {
    const result = parse({ city: "Oakville, Burlington,,Milton " });
    expect(result.success && result.output.cities).toEqual([
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
    ["date out of range", { endDate: "99999999999999999" }],
    ["limit above the maximum", { limit: "101" }],
    ["zero limit", { limit: "0" }],
    ["non-numeric limit", { limit: "ten" }],
    ["garbage cursor", { cursor: "not-a-cursor" }],
    ["too many cities", { city: Array(51).fill("x").join(",") }],
    ["start after end", { startDate: "2000", endDate: "1000" }],
  ])("rejects %s", (_name, input) => {
    expect(parse(input).success).toBe(false);
  });
});

describe("CaseQuerySchema", () => {
  const parseCase = (input: Record<string, string>) =>
    v.safeParse(CaseQuerySchema, input);

  test("trims the case number", () => {
    const result = parseCase({ caseNo: "  2024-123  " });
    expect(result.success && result.output.caseNo).toBe("2024-123");
  });

  test.each([
    ["missing", {}],
    ["blank", { caseNo: "   " }],
    ["too long", { caseNo: "x".repeat(65) }],
  ])("rejects a %s case number", (_name, input) => {
    expect(parseCase(input).success).toBe(false);
  });
});
