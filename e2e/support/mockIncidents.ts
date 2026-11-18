import { Page, Request, Route, expect } from "@playwright/test";

/**
 * Shape returned by the searchIncidents server action (see src/app/common.ts PagingResponseBody /
 * DataResponseBody, and the fields src/app/_state/MapDataState.ts reads off
 * each record when building map markers).
 */
export type MockIncident = {
  caseNo: string;
  date: string;
  description: string;
  location: string;
  city: string;
  latitude: number;
  longitude: number;
  globalID: string;
  intersectionId?: string | null;
  intersectionLabel?: string | null;
  intersectionLatitude?: number | null;
  intersectionLongitude?: number | null;
};

export const buildIncident = (
  overrides: Partial<MockIncident> = {},
): MockIncident => ({
  caseNo: "CASE-0001",
  date: new Date().toISOString(),
  description: "Motor Vehicle Collision",
  location: "123 Main St",
  city: "Oakville",
  latitude: 43.4675,
  longitude: -79.6877,
  globalID: "GLOBAL-0001",
  ...overrides,
});

/**
 * The dashboard reads incidents through server actions (see src/app/actions.ts).
 * A server action call is a POST carrying a `next-action` header, with the
 * arguments as a JSON array in the body. The action id is a build-time hash,
 * so these helpers recognise a call by the shape of its argument instead:
 * `{ caseNo }` is the case lookup, anything else is the incident search.
 */
export type ActionCall = { kind: "search" | "case"; input: any };

export const parseActionCall = (request: Request): ActionCall | null => {
  if (request.method() !== "POST") return null;
  if (!request.headers()["next-action"]) return null;
  try {
    const [input] = JSON.parse(request.postData() ?? "[]");
    return { kind: input && "caseNo" in input ? "case" : "search", input };
  } catch {
    return null;
  }
};

export const isSearchRequest = (request: Request) =>
  parseActionCall(request)?.kind === "search";

export const isCaseRequest = (request: Request) =>
  parseActionCall(request)?.kind === "case";

/** Arguments of an incident search: `{ city, startDate, endDate, cursor? }`. */
export const searchInput = (request: Request) =>
  parseActionCall(request)!.input as {
    city: string[];
    startDate: number;
    endDate: number;
    cursor?: string;
  };

/**
 * Answers a server action call with `value`, in the RSC "flight" format the
 * client expects. Dates travel as `$D<iso>`, so the `date` of each incident is
 * encoded that way, as the real server does.
 */
export const fulfillAction = async (route: Route, value: unknown) => {
  const body = JSON.stringify(value, (key, item) =>
    key === "date" && typeof item === "string" ? `$D${item}` : item,
  );
  await route.fulfill({
    status: 200,
    contentType: "text/x-component",
    body: `0:{"a":"$@1","q":"","i":true,"b":"development"}\n1:${body}\n`,
  });
};

/** Answers a server action call as a thrown error, as the real server does. */
export const failAction = (route: Route) =>
  route.fulfill({
    status: 500,
    contentType: "text/x-component",
    body:
      `0:{"a":"$@1","q":"","i":true,"b":"development"}\n` +
      `1:E{"digest":"mock","name":"Error","message":"mock failure","stack":[],"env":"Server","owner":null}\n`,
  });

/**
 * Registers a handler for incident searches. Other requests, including the
 * case lookup, pass through. A handler registered later wins over an earlier
 * one, as with any Playwright route.
 */
export const routeSearch = (
  page: Page,
  handler: (route: Route, request: Request) => Promise<void> | void,
) =>
  page.route(
    (url) => url.pathname.startsWith("/"),
    async (route) => {
      const request = route.request();
      if (!isSearchRequest(request)) return route.fallback();
      await handler(route, request);
    },
  );

/** Registers a handler for case lookups; see `routeSearch`. */
export const routeCase = (
  page: Page,
  handler: (route: Route, request: Request) => Promise<void> | void,
) =>
  page.route(
    (url) => url.pathname.startsWith("/"),
    async (route) => {
      const request = route.request();
      if (!isCaseRequest(request)) return route.fallback();
      await handler(route, request);
    },
  );

/** Answers every incident search with one non-paginated page of fixtures. */
export const mockIncidentData = async (
  page: Page,
  incidents: MockIncident[],
) => {
  await routeSearch(page, (route) =>
    fulfillAction(route, { data: incidents, nextCursor: null, hasMore: false }),
  );
};

/**
 * Answers case lookups with the fixture incidents whose case number matches
 * the one asked for.
 */
export const mockCaseLookup = async (page: Page, incidents: MockIncident[]) => {
  await routeCase(page, (route, request) =>
    fulfillAction(route, {
      data: incidents.filter(
        (incident) =>
          incident.caseNo === parseActionCall(request)!.input.caseNo,
      ),
    }),
  );
};

/**
 * Opens the dashboard and waits for the automatic first search (which runs on
 * load with the default filters) to finish, so a test can then interact with
 * a settled page. The initial search is answered with `incidents`; a test can
 * register its own `mockIncidentData` afterwards to answer later searches.
 */
export const gotoDashboard = async (
  page: Page,
  incidents: MockIncident[] = [],
  path = "/en",
) => {
  await mockIncidentData(page, incidents);
  const firstSearch = page.waitForResponse((response) =>
    isSearchRequest(response.request()),
  );
  await page.goto(path);
  await firstSearch;
  await expect(page.getByText("Loading incidents…")).toHaveCount(0);
};
