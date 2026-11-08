"use client";

import { assign, fromPromise, setup } from "xstate";
import { createActorContext } from "@xstate/react";

import type { CaseResponseBody } from "../common";
import { Location, groupLocations } from "./locations";

export const fetchCase = async (caseNo: string): Promise<CaseResponseBody> => {
  const params = new URLSearchParams({ caseNo });
  const response = await fetch(`/api/data/case?${params}`, {
    cache: "no-cache",
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
};

/**
 * Looks up incidents by case number. Kept apart from the map's machine so the
 * lookup never touches the search results or the selected location.
 */
export const caseLookupMachine = setup({
  types: {
    context: {} as {
      caseNo: string;
      /** The incidents of the last lookup, grouped the way the map groups them. */
      locations: Location[];
      error?: unknown;
    },
    events: {} as { type: "submit"; caseNo: string },
  },
  actors: {
    fetchCase: fromPromise(({ input }: { input: { caseNo: string } }) =>
      fetchCase(input.caseNo),
    ),
  },
}).createMachine({
  id: "caseLookup",
  initial: "idle",
  context: { caseNo: "", locations: [] },
  // Submitting again, from any state, starts a new lookup and drops the old one.
  on: {
    submit: {
      guard: ({ event }) => event.caseNo.trim() !== "",
      target: ".loading",
      reenter: true,
      actions: assign({
        caseNo: ({ event }) => event.caseNo.trim(),
        locations: [],
        error: undefined,
      }),
    },
  },
  states: {
    idle: {},
    loading: {
      invoke: {
        src: "fetchCase",
        input: ({ context }) => ({ caseNo: context.caseNo }),
        onDone: [
          {
            guard: ({ event }) => event.output.data.length === 0,
            target: "notFound",
          },
          {
            target: "found",
            actions: assign({
              locations: ({ event }) => groupLocations(event.output.data),
            }),
          },
        ],
        onError: {
          target: "failure",
          actions: assign({ error: ({ event }) => event.error }),
        },
      },
    },
    found: {},
    notFound: {},
    failure: {},
  },
});

export const CaseLookupContext = createActorContext(caseLookupMachine);
