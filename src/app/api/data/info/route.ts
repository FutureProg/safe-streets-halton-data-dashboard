import { findInfo } from "@/db/db";

export const dynamic = 'force-dynamic';

export const GET = async () => {
    const result = await findInfo();
    return Response.json(result);
}