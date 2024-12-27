export const dynamic = 'force-dynamic';

import { findData } from '@/db/db';
import { NextRequest } from 'next/server';
import { createPagingResponseBody } from '../utils';

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const itemCount = parseInt(searchParams.get('itemCount') ?? "100");
    const itemOffset = parseInt(searchParams.get("itemOffset") ?? "0");
    const endDate = new Date(Number.parseInt(searchParams.get('endDate') ?? Date.now().toString()));
    const defaultStartDate = new Date(endDate);
    defaultStartDate.setDate(endDate.getDate() - 30);
    const startDate = new Date(Number.parseInt(searchParams.get('startDate') ?? defaultStartDate.getTime().toString()));
    const cities = searchParams.getAll('city');
    const data = await findData(startDate, endDate, {includedCities: cities, itemCount, itemOffset});
    let responseBody = createPagingResponseBody(data, itemOffset, itemCount);
    return Response.json(responseBody);
}