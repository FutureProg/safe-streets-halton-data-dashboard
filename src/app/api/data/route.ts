export const dynamic = 'force-dynamic';

import { findData } from '@/db/db';
import { NextRequest } from 'next/server';

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const itemCount = parseInt(searchParams.get('itemCount') ?? "100");
    const itemOffset = parseInt(searchParams.get("offset") ?? "0");
    const endDate = new Date(Number.parseInt(searchParams.get('endDate') ?? Date.now().toString()));
    const defaultStartDate = new Date(endDate);
    defaultStartDate.setDate(endDate.getDate() - 30);
    const startDate = new Date(Number.parseInt(searchParams.get('startDate') ?? defaultStartDate.getTime().toString()));
    const excludedCities = searchParams.getAll('excludeCity');
    const data = await findData(startDate, endDate, {excludedCities, itemCount, itemOffset});
    console.log(startDate, endDate);
    let responseBody = {
        data,
        offset: itemOffset,
        itemCount,
        hitRequestLimit: data.length >= itemCount
    } 
    return Response.json(responseBody);
}