import { test, expect } from '@playwright/test';
import { buildIncident, mockIncidentData } from './support/mockIncidents';
import { assertNoA11yViolations } from './support/a11y';

const MARKER_SELECTOR = '.leaflet-marker-icon, .marker-cluster';

// Feature: Filter form search
// As a visitor, I fill in the date range / municipality filters and submit,
// which fetches incidents from /api/data (mocked here) and renders them as
// markers on the map.

test.describe('Given the filter form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('When submitted with default dates and matching incidents exist, then markers render on the map', async ({ page }) => {
    await mockIncidentData(page, [
      buildIncident({ globalID: 'GLOBAL-0001', latitude: 43.4675, longitude: -79.6877 }),
      buildIncident({ globalID: 'GLOBAL-0002', latitude: 43.5, longitude: -79.9 }),
    ]);

    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator(MARKER_SELECTOR)).not.toHaveCount(0);
  });

  test('When submitted and the API returns no incidents, then no markers render', async ({ page }) => {
    await mockIncidentData(page, []);

    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator(MARKER_SELECTOR)).toHaveCount(0);
  });

  test('When submitted, then the request carries the selected start/end dates', async ({ page }) => {
    await mockIncidentData(page, []);

    const [request] = await Promise.all([
      page.waitForRequest('**/api/data?**'),
      page.getByRole('button', { name: 'Search' }).click(),
    ]);

    const url = new URL(request.url());
    expect(url.searchParams.get('startDate')).toBeTruthy();
    expect(url.searchParams.get('endDate')).toBeTruthy();
  });

  test('When the user removes a municipality before submitting, then the request omits it', async ({ page }) => {
    await mockIncidentData(page, []);

    const municipalityField = page.getByLabel('Municipality');
    const removeButtons = municipalityField.locator('..').getByRole('button', { name: /^Remove / });
    const chipCountBefore = await removeButtons.count();
    test.skip(chipCountBefore === 0, 'No municipality options available from the database in this environment');

    const firstChipLabel = await removeButtons.first().getAttribute('aria-label');
    await removeButtons.first().click();
    // Removing a chip focuses the combobox and reopens its options list;
    // close it so it doesn't sit on top of the Search button below.
    await page.keyboard.press('Escape');

    const [request] = await Promise.all([
      page.waitForRequest('**/api/data?**'),
      page.getByRole('button', { name: 'Search' }).click(),
    ]);

    const url = new URL(request.url());
    const requestedCities = (url.searchParams.get('city') ?? '').split(',').filter(Boolean);
    const removedCity = firstChipLabel?.replace(/^Remove /, '');
    expect(requestedCities.length).toBe(Math.max(chipCountBefore - 1, 0));
    if (removedCity) {
      expect(requestedCities).not.toContain(removedCity);
    }
  });

  test('When the form is submitted again while a search is already in flight, then only one request is sent', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/data?**', async (route) => {
      requestCount += 1;
      // Hold the response open briefly so a second click lands while
      // MapDataState is still in its "loading" state.
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], nextCursor: null, hasMore: false }),
      });
    });

    const searchButton = page.getByRole('button', { name: 'Search' });
    await searchButton.click();
    await searchButton.click();

    await page.waitForTimeout(700);
    expect(requestCount).toBe(1);
  });

  test('When results are rendered, then there are no accessibility violations', async ({ page }) => {
    await mockIncidentData(page, [buildIncident()]);

    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator(MARKER_SELECTOR)).not.toHaveCount(0);

    await assertNoA11yViolations(page);
  });
});

test.describe('Given the incident type filter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
    await mockIncidentData(page, [
      buildIncident({ globalID: 'GLOBAL-0001', description: 'Motor Vehicle Collision', latitude: 43.4675, longitude: -79.6877 }),
      buildIncident({ globalID: 'GLOBAL-0002', description: 'Pedestrian Incident', latitude: 43.6, longitude: -80.0 }),
    ]);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator(MARKER_SELECTOR)).not.toHaveCount(0);
  });

  test('When the user deselects an incident type, then markers are filtered client-side without a new request', async ({ page }) => {
    const incidentTypeField = page.getByLabel('Incident Type');
    const removeButtons = incidentTypeField.locator('..').getByRole('button', { name: /^Remove / });
    const typeCountBefore = await removeButtons.count();
    test.skip(typeCountBefore < 2, 'Fewer than two incident types available from the database in this environment');

    let requestFired = false;
    await page.route('**/api/data?**', async (route) => {
      requestFired = true;
      await route.continue();
    });

    await removeButtons.first().click();

    expect(requestFired).toBe(false);
  });
});
