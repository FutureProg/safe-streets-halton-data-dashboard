import { describe, expect, test } from "vite-plus/test";
import { createActor, fromPromise, waitFor } from "xstate";

import { caseLookupMachine } from "./CaseLookupState";

const record = {
  caseNo: "C-1",
  date: "2026-10-01T12:00:00Z",
  description: "MVC - PI",
  location: "DUNDAS ST",
  city: "OAKVILLE",
  latitude: 43.4675,
  longitude: -79.6877,
  globalId: "G-1",
};

const start = (fetchCase: (caseNo: string) => Promise<unknown>) => {
  const actor = createActor(
    caseLookupMachine.provide({
      actors: {
        fetchCase: fromPromise(({ input }: { input: { caseNo: string } }) =>
          fetchCase(input.caseNo),
        ) as never,
      },
    }),
  );
  actor.start();
  return actor;
};

describe("caseLookupMachine", () => {
  test("starts idle with nothing to show", () => {
    const actor = start(async () => ({ data: [] }));
    expect(actor.getSnapshot().value).toBe("idle");
    expect(actor.getSnapshot().context.locations).toEqual([]);
  });

  test("a matching case ends up found, grouped into locations", async () => {
    const actor = start(async () => ({ data: [record] }));
    actor.send({ type: "submit", caseNo: " C-1 " });
    expect(actor.getSnapshot().value).toBe("loading");
    const snapshot = await waitFor(actor, (s) => s.matches("found"));
    expect(snapshot.context.caseNo).toBe("C-1");
    expect(snapshot.context.locations).toHaveLength(1);
    expect(snapshot.context.locations[0].incidents[0].case_no).toBe("C-1");
  });

  test("no matching case ends up notFound", async () => {
    const actor = start(async () => ({ data: [] }));
    actor.send({ type: "submit", caseNo: "NOPE" });
    await waitFor(actor, (s) => s.matches("notFound"));
  });

  test("a failed request ends up in failure", async () => {
    const actor = start(async () => {
      throw new Error("boom");
    });
    actor.send({ type: "submit", caseNo: "C-1" });
    const snapshot = await waitFor(actor, (s) => s.matches("failure"));
    expect(snapshot.context.error).toBeInstanceOf(Error);
  });

  test("a blank case number is ignored", () => {
    const actor = start(async () => ({ data: [] }));
    actor.send({ type: "submit", caseNo: "   " });
    expect(actor.getSnapshot().value).toBe("idle");
  });

  test("submitting again replaces the earlier result", async () => {
    const actor = start(async (caseNo) => ({
      data: caseNo === "C-1" ? [record] : [],
    }));
    actor.send({ type: "submit", caseNo: "C-1" });
    await waitFor(actor, (s) => s.matches("found"));
    actor.send({ type: "submit", caseNo: "C-2" });
    expect(actor.getSnapshot().context.locations).toEqual([]);
    await waitFor(actor, (s) => s.matches("notFound"));
  });
});
