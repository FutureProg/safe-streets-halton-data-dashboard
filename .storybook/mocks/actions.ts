// Stand-in for src/app/actions.ts in Storybook. The real module is a set of
// server actions that reach the database; Storybook runs in the browser, which
// has no server and cannot load `pg`. Stories that need data should seed the
// state machines directly rather than call these.
import type { CaseResponseBody, DataResponseBody } from "../../src/app/common";

export async function searchIncidents(
  _input: unknown,
): Promise<DataResponseBody> {
  return { data: [], nextCursor: null, hasMore: false };
}

export async function lookupCase(_input: unknown): Promise<CaseResponseBody> {
  return { data: [] };
}
