"use server";

import { findByCaseNo } from "@/db/cases";
import { findIncidents } from "@/db/incidentSearch";
import type { CaseResponseBody, DataResponseBody } from "./common";
import { CaseQuerySchema, DataQuerySchema } from "./schemas";

/**
 * Server actions are public POST endpoints: anyone can call them with any
 * input, whatever the TypeScript types say. So the arguments are `unknown`
 * and validated with Zod before use. A failed parse throws.
 */

/** Incidents in a date range for the chosen cities, one page at a time. */
export async function searchIncidents(
  input: unknown,
): Promise<DataResponseBody> {
  const query = DataQuerySchema.parse(input);
  return findIncidents(query.startDate, query.endDate, {
    includedCities: query.cities,
    limit: query.limit,
    cursor: query.cursor,
  });
}

/**
 * Every incident carrying the case number. The list is empty when none match.
 * Normally there is one incident per case; an array keeps the result stable if
 * that ever changes.
 */
export async function lookupCase(input: unknown): Promise<CaseResponseBody> {
  const { caseNo } = CaseQuerySchema.parse(input);
  return { data: await findByCaseNo(caseNo) };
}
