"use client";

import { assign, fromPromise, setup } from "xstate";
import { createActorContext } from "@xstate/react";
import { Location, groupLocations } from "./locations";
import { searchIncidents } from "../actions";
import { ClientSideFilters, DataResponseBody } from "../common";

export type FetchDataParams = {
  city: string[];
  startDate: string | number | Date;
  endDate: string | number | Date;
  cursor?: string;
};

const toTimestamp = (value: string | number | Date) =>
  value instanceof Date ? value.getTime() : Number(value);

const fetchData = async (params: FetchDataParams) => {
  const request = {
    city: params.city,
    startDate: toTimestamp(params.startDate),
    endDate: toTimestamp(params.endDate),
  };
  let result: DataResponseBody | null = null;
  let cursor = params.cursor;

  // fetch all pages
  do {
    const page: DataResponseBody = await searchIncidents({
      ...request,
      cursor,
    });
    if (!result) {
      result = page;
    } else {
      result.data = result.data.concat(page.data);
      result.nextCursor = page.nextCursor;
      result.hasMore = page.hasMore;
    }
    cursor = page.nextCursor ?? undefined;
  } while (result.hasMore);

  return result;
};

const mapDataMachine = setup({
  types: {
    context: {} as {
      data?: any;
      params?: any;
      error?: any;
      locations?: Location[];
      selectedLocationKey?: string | null;
      /** Bumped on every selection so the map re-centres even on the same row. */
      focusRequest?: number;
      clientFilters?: ClientSideFilters;
      /** "auto" for the search made on page open, "user" for a Search press. */
      loadSource?: "auto" | "user";
    },
    events: {} as
      | { type: "request"; params: FetchDataParams; source?: "auto" | "user" }
      | { type: "filterClient"; filters: ClientSideFilters }
      | { type: "selectLocation"; key: string }
      | { type: "clearLocation" },
    input: {} as FetchDataParams,
  },
  actions: {
    setLoadSource: assign({
      loadSource: ({ event }) =>
        event.type === "request" ? (event.source ?? "user") : "user",
    }),
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
      actions: assign({
        selectedLocationKey: ({ event }) => event.key,
        focusRequest: ({ context }) => (context.focusRequest ?? 0) + 1,
      }),
    },
    clearLocation: {
      actions: assign({ selectedLocationKey: null }),
    },
  },

  states: {
    idle: {
      on: {
        request: { target: "loading", actions: "setLoadSource" },
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
        request: { target: "loading", actions: "setLoadSource" },
      },
    },
    failure: {
      on: {
        request: { target: "loading", actions: "setLoadSource" },
      },
    },
  },
});

export const MapDataMachine = mapDataMachine;
export const MapDataContext = createActorContext(mapDataMachine);
