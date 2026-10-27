import type { HRPSDataModel } from "@/db/models";

export type HTMLInputOption = {
  label: string;
  value: string;
};

export type StaticValues = {
  incidentTypes: HTMLInputOption[];
  cities: HTMLInputOption[];
};

export type ClientSideFilters = {
  incidentTypes: string[];
};

export interface PagingResponseBody<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface PaginationParams {
  limit?: number;
  cursor?: string;
}

/** An HRPS incident, plus its nearest intersection when one was matched. */
export type DataRecord = HRPSDataModel & {
  intersectionId?: string | null;
  intersectionLabel?: string | null;
  intersectionLatitude?: number | null;
  intersectionLongitude?: number | null;
};

export type DataResponseBody = PagingResponseBody<DataRecord>;
