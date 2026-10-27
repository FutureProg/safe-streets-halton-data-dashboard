"use client";

import { assign, fromPromise, setup } from "xstate";
import { createActorContext } from "@xstate/react";
import { Location, groupLocations } from "./locations";
import { ClientSideFilters, DataResponseBody } from "../common";

export type FetchDataParams = {
  city: string[];
  startDate: string | number | Date;
  endDate: string | number | Date;
  cursor?: string;
};

const fetchData = async (params: FetchDataParams) => {
  params.startDate =
    params.startDate instanceof Date
      ? params.startDate.getTime()
      : params.startDate;
  params.endDate =
    params.endDate instanceof Date ? params.endDate.getTime() : params.endDate;

  const baseURL = "/api/data?";
  let result: DataResponseBody | null = null;
  let nextCursor = params.cursor;

  // fetch all pages
  do {
    if (nextCursor) {
      params.cursor = nextCursor;
    }
    let urlParams = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, v as string]),
    );
    const tempResult: DataResponseBody = await fetch(baseURL + urlParams, {
      cache: "no-cache",
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    });
    if (!result) {
      result = tempResult;
    } else {
      result.data = result.data.concat(tempResult.data);
      result.nextCursor = tempResult.nextCursor;
      result.hasMore = tempResult.hasMore;
    }
    if (tempResult.hasMore) {
      nextCursor = tempResult.nextCursor ?? undefined;
    }
  } while (result && result.hasMore);

  return result!;
};

const mapDataMachine = setup({
  types: {
    context: {} as {
      data?: any;
      params?: any;
      error?: any;
      locations?: Location[];
      selectedLocationKey?: string | null;
      clientFilters?: ClientSideFilters;
    },
    events: {} as
      | { type: "request"; params: FetchDataParams }
      | { type: "filterClient"; filters: ClientSideFilters }
      | { type: "selectLocation"; key: string }
      | { type: "clearLocation" },
    input: {} as FetchDataParams,
  },
  actors: {
    fetchData: fromPromise(async ({ input }) => {
      return fetchData(input as FetchDataParams);
    }),
  },
}).createMachine({
  initial: "idle",
  context: { data: {} },
  on: {
    filterClient: {
      actions: [assign({ clientFilters: ({ event }) => event.filters })],
    },
    selectLocation: {
      actions: assign({ selectedLocationKey: ({ event }) => event.key }),
    },
    clearLocation: {
      actions: assign({ selectedLocationKey: null }),
    },
  },

  states: {
    idle: {
      on: {
        request: {
          target: "loading",
        },
      },
    },
    loading: {
      invoke: {
        id: "getData",
        src: "fetchData",
        input: ({ event }) =>
          event.type == "request"
            ? ({ ...event.params } as FetchDataParams)
            : undefined,
        onDone: {
          target: "success",
          actions: [
            assign({ data: ({ event }) => event.output }),
            assign({
              locations: ({ event }) =>
                groupLocations((event.output as any).data),
              selectedLocationKey: null,
            }),
          ],
        },
        onError: {
          target: "failure",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    success: {
      on: {
        request: {
          target: "loading",
        },
      },
    },
    failure: {
      on: {
        request: {
          target: "loading",
        },
      },
    },
  },
});

export const MapDataMachine = mapDataMachine;
export const MapDataContext = createActorContext(mapDataMachine);
