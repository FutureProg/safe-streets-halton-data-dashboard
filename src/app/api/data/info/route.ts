import { findInfo } from "@/db/db";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export const GET = async (request: NextRequest) => {
    const searchParams = request.nextUrl.searchParams;
    const result = await findInfo();
    return Response.json(result);
}