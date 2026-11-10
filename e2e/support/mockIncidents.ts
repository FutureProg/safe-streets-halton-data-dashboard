import { Page, Route, expect } from "@playwright/test";

/**
 * Shape returned by GET /api/data (see src/app/common.ts PagingResponseBody /
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
 * Intercepts the client-side fetch to /api/data (triggered by FilterForm
 * submit) and returns a single, non-paginated page of fixture incidents
 * instead of hitting the real database.
 */
export const mockIncidentData = async (
  page: Page,
  incidents: MockIncident[],
) => {
  await page.route("**/api/data?**", async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: incidents,
        nextCursor: null,
        hasMore: false,
      }),
    });
  });
};

/**
 * Intercepts GET /api/data/case and answers with the fixture incidents whose
 * case number matches the `caseNo` query parameter.
 */
export const mockCaseLookup = async (page: Page, incidents: MockIncident[]) => {
  await page.route("**/api/data/case?**", async (route: Route) => {
    const caseNo = new URL(route.request().url()).searchParams.get("caseNo");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: incidents.filter((incident) => incident.caseNo === caseNo),
      }),
    });
  });
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
  const firstSearch = page.waitForResponse("**/api/data?**");
  await page.goto(path);
  await firstSearch;
  await expect(page.getByText("Loading incidents…")).toHaveCount(0);
};
