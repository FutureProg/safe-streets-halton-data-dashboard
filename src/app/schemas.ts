import { z } from "zod";

import { decodeCursor } from "../db/pagination";

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
 * Inputs of the server actions in `actions.ts`. Server actions are public
 * endpoints, so everything that arrives is validated here before it gets near
 * the database.
 */

const timestamp = z
  .number()
  .int("Must be a whole number of milliseconds.")
  .min(-MAX_TIMESTAMP, "Not a valid date.")
  .max(MAX_TIMESTAMP, "Not a valid date.");

const limit = z
  .number()
  .int()
  .min(1)
  .max(MAX_PAGE_SIZE, `Must be ${MAX_PAGE_SIZE} or fewer.`);

const cursor = z
  .string()
  .max(MAX_CURSOR_LENGTH)
  .refine((value) => {
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
  }, "Not a valid cursor.");

const cities = z
  .array(z.string().trim().min(1).max(MAX_CITY_LENGTH))
  .max(MAX_CITIES, `At most ${MAX_CITIES} cities.`);

export const DataQuerySchema = z
  .object({
    limit: limit.default(MAX_PAGE_SIZE),
    cursor: cursor.optional(),
    endDate: timestamp.optional(),
    startDate: timestamp.optional(),
    city: cities.default([]),
  })
  // The window defaults to the 30 days before the end date.
  .transform((query) => {
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
  })
  .refine((query) => query.startDate <= query.endDate, {
    message: "startDate must not be after endDate.",
    path: ["startDate"],
  });
export type DataQuery = z.output<typeof DataQuerySchema>;

export const CaseQuerySchema = z.object({
  caseNo: z
    .string()
    .trim()
    .min(1, "caseNo is required.")
    .max(
      MAX_CASE_NO_LENGTH,
      `caseNo must be ${MAX_CASE_NO_LENGTH} characters or fewer.`,
    ),
});
export type CaseQuery = z.output<typeof CaseQuerySchema>;
