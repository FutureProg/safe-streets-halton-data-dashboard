import type { PagingResponseBody, PaginationParams } from "@/app/common";

export interface Cursor {
    id: string;
    date: string;
}

export function encodeCursor(cursor: Cursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64');
}

export function decodeCursor(cursorStr: string): Cursor {
    const decodedStr = Buffer.from(cursorStr, 'base64').toString('utf-8');
    return JSON.parse(decodedStr) as Cursor;
}

export const getPagingParams = (searchParams: URLSearchParams) => {
    const limit = parseInt(searchParams.get('limit') ?? "100");
    const cursor = searchParams.get("cursor");
    return {
        limit, 
        cursor
    }
}