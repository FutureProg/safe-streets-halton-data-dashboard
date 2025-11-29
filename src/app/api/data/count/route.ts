export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import { createPagingResponseBody, getPagingParams } from "../../pagination";
import { findDataGroupBy, HRPSDataColumns } from "@/db/db";

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const { itemCount, itemOffset } = getPagingParams(searchParams);
    const groupBy = searchParams.get("groupBy")?.split(",");
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
    const cities = searchParams.getAll("city");
    const data = await findDataGroupBy(
        groupBy as HRPSDataColumns[],
        startDate,
        endDate,
        true,
        { includedCities: cities, itemCount, itemOffset }
    );
    const body = createPagingResponseBody(data, itemOffset, itemCount);
    return Response.json(body);
};
