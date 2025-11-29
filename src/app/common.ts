import type { HRPSDataModel } from "@/db/models";

export type HTMLInputOption = {
    label: string;
    value: string;
}

export type StaticValues = {
    incidentTypes: HTMLInputOption[],
    cities: HTMLInputOption[]
}

export type ClientSideFilters = {
    incidentTypes: string[]
}

export interface PaginationParams {
    limit?: number;
    cursor?: string;
}

export interface PagingResponseBody<T> {
    data: T[],
    nextCursor: string | null,
    hasMore: boolean;
};

export interface PaginationParams {
    limit?: number;
    cursor?: string;
}

export type DataResponseBody = PagingResponseBody<HRPSDataModel>;