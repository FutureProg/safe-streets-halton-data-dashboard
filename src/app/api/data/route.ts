export const dynamic = "force-dynamic";

import { db } from "@/db/db";
import { NextRequest } from "next/server";
import { decodeCursor, encodeCursor } from "../pagination";
import { hrpsData } from "@/db/schema";
import { isMissingRelation } from "@/db/common";
import { intersections } from "@/db/geo";
import { incidentLocations } from "@/db/incidents";
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

const findData = async (
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

  let results: DataRecord[];
  try {
    results = await withIntersections();
  } catch (error) {
    if (!isMissingRelation(error)) throw error;
    if (!warnedMissingCuratedData) {
      warnedMissingCuratedData = true;
      console.warn(
        "Curated intersection data unavailable; serving incidents without intersections.",
        error,
      );
    }
    results = await baseQuery();
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

export const GET = async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const cursor = searchParams.get("cursor") ?? undefined;
  const endDate = new Date(
    Number.parseInt(searchParams.get("endDate") ?? Date.now().toString()),
  );
  const defaultStartDate = new Date(endDate);
  defaultStartDate.setDate(endDate.getDate() - 30);
  const startDate = new Date(
    Number.parseInt(
      searchParams.get("startDate") ?? defaultStartDate.getTime().toString(),
    ),
  );
  const cities = searchParams.get("city")?.split(",");
  const body = await findData(startDate, endDate, {
    includedCities: cities,
    limit,
    cursor,
  });
  return Response.json(body);
};
