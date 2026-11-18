import { db } from "@/db/db";
import { decodeCursor, encodeCursor } from "./pagination";
import { hrpsData } from "@/db/schema";
import { isMissingRelation } from "@/db/common";
import { intersections } from "@/db/geo";
import { incidentLocations, incidentsView } from "@/db/incidents";
import {
  and,
  between,
  desc,
  eq,
  getTableColumns,
  inArray,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { DataRecord, PaginationParams } from "@/app/common";

let warnedMissingCuratedData = false;

export const findIncidents = async (
  startDate: Date,
  endDate: Date,
  options?: {
    includedCities?: string[];
  } & PaginationParams,
) => {
  const limit = Math.min(options?.limit ?? 100, 100);
  const includedCities = options?.includedCities ?? [];

  const conditions = [
    and(
      between(hrpsData.date, startDate, endDate),
      inArray(hrpsData.city, includedCities),
    ),
  ];

  if (options?.cursor) {
    const cursor = decodeCursor(options.cursor);
    const cursorDate = new Date(cursor.date);
    conditions.push(
      or(
        lt(hrpsData.date, cursorDate),
        and(eq(hrpsData.date, cursorDate), lt(hrpsData.globalId, cursor.id)),
      ),
    );
  }

  // Preferred: the de-duplicated view, one row per case, already tagged with
  // its nearest intersection.
  const viewConditions = [
    and(
      between(incidentsView.date, startDate, endDate),
      inArray(incidentsView.city, includedCities),
    ),
  ];
  if (options?.cursor) {
    const cursor = decodeCursor(options.cursor);
    const cursorDate = new Date(cursor.date);
    viewConditions.push(
      or(
        lt(incidentsView.date, cursorDate),
        and(
          eq(incidentsView.date, cursorDate),
          lt(incidentsView.globalId, cursor.id),
        ),
      ),
    );
  }
  const fromView = () =>
    db
      .select({
        caseNo: incidentsView.caseNo,
        date: incidentsView.date,
        description: incidentsView.description,
        location: incidentsView.location,
        city: incidentsView.city,
        latitude: incidentsView.latitude,
        longitude: incidentsView.longitude,
        globalId: incidentsView.globalId,
        intersectionId: incidentsView.intersectionId,
        intersectionLabel: intersections.label,
        intersectionLatitude: sql<number | null>`ST_Y(${intersections.geom})`,
        intersectionLongitude: sql<number | null>`ST_X(${intersections.geom})`,
      })
      .from(incidentsView)
      .leftJoin(
        intersections,
        eq(intersections.intersectionId, incidentsView.intersectionId),
      )
      .where(and(...viewConditions))
      .orderBy(desc(incidentsView.date), desc(incidentsView.globalId))
      .limit(limit + 1);

  const baseQuery = () =>
    db
      .select(getTableColumns(hrpsData))
      .from(hrpsData)
      .where(and(...conditions))
      .orderBy(desc(hrpsData.date), desc(hrpsData.globalId))
      .limit(limit + 1);

  // Tag each incident with its nearest intersection when the curated data
  // from open-data-sync is available; otherwise fall back to the bare rows
  // and let the client group by coordinates.
  const withIntersections = () =>
    db
      .select({
        ...getTableColumns(hrpsData),
        intersectionId: intersections.intersectionId,
        intersectionLabel: intersections.label,
        intersectionLatitude: sql<number | null>`ST_Y(${intersections.geom})`,
        intersectionLongitude: sql<number | null>`ST_X(${intersections.geom})`,
      })
      .from(hrpsData)
      .leftJoin(
        incidentLocations,
        eq(incidentLocations.globalId, hrpsData.globalId),
      )
      .leftJoin(
        intersections,
        eq(intersections.intersectionId, incidentLocations.intersectionId),
      )
      .where(and(...conditions))
      .orderBy(desc(hrpsData.date), desc(hrpsData.globalId))
      .limit(limit + 1);

  // Fall back one step at a time when the open-data-sync relations are
  // missing (local and test databases): view, then raw rows with
  // intersections, then bare raw rows.
  let results: DataRecord[];
  try {
    results = await fromView();
  } catch (error) {
    if (!isMissingRelation(error)) throw error;
    if (!warnedMissingCuratedData) {
      warnedMissingCuratedData = true;
      console.warn(
        "De-duplicated incidents view unavailable; serving raw HRPS rows.",
        error,
      );
    }
    try {
      results = await withIntersections();
    } catch (innerError) {
      if (!isMissingRelation(innerError)) throw innerError;
      results = await baseQuery();
    }
  }
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, limit) : results;

  const nextCursor =
    hasMore && data.length > 0
      ? encodeCursor({
          id: data[data.length - 1].globalId,
          date: data[data.length - 1].date.toISOString(),
        })
      : null;

  return {
    data,
    nextCursor,
    hasMore,
  };
};
