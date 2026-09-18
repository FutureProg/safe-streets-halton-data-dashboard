import { Page, Route } from '@playwright/test';

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
};

export const buildIncident = (overrides: Partial<MockIncident> = {}): MockIncident => ({
  caseNo: 'CASE-0001',
  date: new Date().toISOString(),
  description: 'Motor Vehicle Collision',
  location: '123 Main St',
  city: 'Oakville',
  latitude: 43.4675,
  longitude: -79.6877,
  globalID: 'GLOBAL-0001',
  ...overrides,
});

/**
 * Intercepts the client-side fetch to /api/data (triggered by FilterForm
 * submit) and returns a single, non-paginated page of fixture incidents
 * instead of hitting the real database.
 */
export const mockIncidentData = async (page: Page, incidents: MockIncident[]) => {
  await page.route('**/api/data?**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: incidents,
        nextCursor: null,
        hasMore: false,
      }),
    });
  });
};
