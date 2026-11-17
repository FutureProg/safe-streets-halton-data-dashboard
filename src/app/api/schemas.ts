import * as v from "valibot";

import { decodeCursor } from "./pagination";

/** Largest page the data endpoint will return. */
export const MAX_PAGE_SIZE = 100;
export const MAX_CASE_NO_LENGTH = 64;
const MAX_CITIES = 50;
const MAX_CITY_LENGTH = 100;
const MAX_CURSOR_LENGTH = 512;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Largest timestamp (in ms) a JavaScript Date can hold. */
const MAX_TIMESTAMP = 8.64e15;

/**
 * Query-string values arrive as strings, so these schemas accept strings and
 * produce typed values. Callers other than the route handlers (for example
 * server actions) can pass the same shape.
 */

const timestamp = v.pipe(
  v.string(),
  v.regex(/^-?\d+$/, "Must be a whole number of milliseconds."),
  v.transform(Number),
  v.number(),
  v.minValue(-MAX_TIMESTAMP, "Not a valid date."),
  v.maxValue(MAX_TIMESTAMP, "Not a valid date."),
);

const limit = v.pipe(
  v.string(),
  v.regex(/^\d+$/, "Must be a whole number."),
  v.transform(Number),
  v.number(),
  v.integer(),
  v.minValue(1),
  v.maxValue(MAX_PAGE_SIZE, `Must be ${MAX_PAGE_SIZE} or fewer.`),
);

const cursor = v.pipe(
  v.string(),
  v.maxLength(MAX_CURSOR_LENGTH),
  v.check((value) => {
    try {
      const decoded = decodeCursor(value);
      return (
        typeof decoded?.id === "string" &&
        typeof decoded?.date === "string" &&
        !Number.isNaN(new Date(decoded.date).getTime())
      );
    } catch {
      return false;
    }
  }, "Not a valid cursor."),
);

/** A comma-separated list of city names, e.g. "Oakville,Burlington". */
const cities = v.pipe(
  v.string(),
  v.transform((value) =>
    value
      .split(",")
      .map((city) => city.trim())
      .filter(Boolean),
  ),
  v.array(v.pipe(v.string(), v.maxLength(MAX_CITY_LENGTH))),
  v.maxLength(MAX_CITIES, `At most ${MAX_CITIES} cities.`),
);

export const DataQuerySchema = v.pipe(
  v.object({
    limit: v.optional(limit, String(MAX_PAGE_SIZE)),
    cursor: v.optional(cursor),
    endDate: v.optional(timestamp),
    startDate: v.optional(timestamp),
    city: v.optional(cities, ""),
  }),
  // The window defaults to the 30 days before the end date.
  v.transform((query) => {
    const endDate = new Date(query.endDate ?? Date.now());
    const startDate = new Date(
      query.startDate ?? endDate.getTime() - 30 * DAY_MS,
    );
    return {
      limit: query.limit,
      cursor: query.cursor,
      cities: query.city,
      startDate,
      endDate,
    };
  }),
  v.check(
    (query) => query.startDate <= query.endDate,
    "startDate must not be after endDate.",
  ),
);
export type DataQuery = v.InferOutput<typeof DataQuerySchema>;

export const CaseQuerySchema = v.object({
  caseNo: v.pipe(
    v.string(),
    v.trim(),
    v.minLength(1, "caseNo is required."),
    v.maxLength(
      MAX_CASE_NO_LENGTH,
      `caseNo must be ${MAX_CASE_NO_LENGTH} characters or fewer.`,
    ),
  ),
});
export type CaseQuery = v.InferOutput<typeof CaseQuerySchema>;

/** Reads the named query-string parameters into a plain object, skipping absent ones. */
export const paramsToObject = (
  searchParams: URLSearchParams,
  keys: string[],
): Record<string, string> => {
  const entries: Record<string, string> = {};
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value !== null) entries[key] = value;
  }
  return entries;
};

/** A 400 response listing what was wrong with the input. */
export const invalidRequest = (
  issues: [v.BaseIssue<unknown>, ...v.BaseIssue<unknown>[]],
) =>
  Response.json(
    { error: "Invalid request.", issues: v.flatten(issues) },
    { status: 400 },
  );
