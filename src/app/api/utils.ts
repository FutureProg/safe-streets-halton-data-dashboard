import type { PagingResponseBody } from "@/app/common";

export interface Cursor {
    id: number;
    created_at: string;
}

export function encodeCursor(cursor: Cursor): string {
    return Buffer.from(JSON.stringify(cursor)).toString('base64');
}

export function decodeCursor(cursorStr: string): Cursor | null {
    try {
        const decodedStr = Buffer.from(cursorStr, 'base64').toString('utf-8');
        return JSON.parse(decodedStr) as Cursor;
    } catch (e) {
        return null;
    }
}

export const getPagingParams = (searchParams: URLSearchParams) => {
    const itemCount = parseInt(searchParams.get('itemCount') ?? "100");
    const itemOffset = parseInt(searchParams.get("itemOffset") ?? "0");
    return {
        itemCount, itemOffset
    }
}

export const createPagingResponseBody = <T>(data: T[], itemOffset: number, limit: number) : PagingResponseBody<T> => {
    return {
        data,
        offset: itemOffset,
        itemCount: data.length,
        hitRequestLimit: data.length >= limit
    }
}