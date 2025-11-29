export const dynamic = "force-dynamic";

import { db, HRPSDataColumns } from "@/db/db";
import { NextRequest } from "next/server";
import { decodeCursor, encodeCursor } from "../pagination";
import { hrpsData } from "@/db/schema";
import {
    and,
    between,
    desc,
    eq,
    inArray,
    isNotNull,
    lt,
    or,
} from "drizzle-orm";
import { PaginationParams } from "@/app/common";

export const findData = async (
    startDate: Date,
    endDate: Date,
    options?: {
        includedCities?: string[];
    } & PaginationParams,
) => {
    const limit = Math.min(options?.limit ?? 100, 100);
    const includedCities = options?.includedCities ?? [];

    const query = db
        .select()
        .from(hrpsData)
        .orderBy(desc(hrpsData.date), desc(hrpsData.globalId))
        .limit(limit + 1)
        .$dynamic();

    const conditions = [and(
        between(hrpsData.date, startDate, endDate),
        inArray(hrpsData.city, includedCities),
    )];

    if (options?.cursor) {
        const cursor = decodeCursor(options.cursor);
        const cursorDate = new Date(cursor.date);
        conditions.push(
            or(
                lt(hrpsData.date, cursorDate),
                and(
                    eq(hrpsData.date, cursorDate),
                    lt(hrpsData.globalId, cursor.id),
                ),
            ),
        );
    }
    query.where(and(...conditions));

    const results = await query;
    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    const nextCursor = hasMore && data.length > 0
        ? encodeCursor({
            id: data[data.length - 1].globalId,
            date: data[data.length - 1].date.toISOString(),
        })
        : null;

    return {
        data,
        nextCursor,
        hasMore,
    }
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
            searchParams.get("startDate") ??
                defaultStartDate.getTime().toString(),
        ),
    );
    const cities = searchParams.get("city")?.split(",");
    console.log(startDate, endDate, {
        includedCities: cities,
        limit,
        cursor
    });
    const body = await findData(startDate, endDate, {
        includedCities: cities,
        limit,
        cursor,
    });
    return Response.json(body);
};
