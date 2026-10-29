import { test, expect, Page } from "@playwright/test";
import { buildIncident, mockIncidentData } from "./support/mockIncidents";
import { assertNoA11yViolations } from "./support/a11y";

// Feature: Navigate the map by location (SSHD-4)
// As a visitor, I want a list of the locations in my search results, so that I
// can jump straight to a place on the map and see what happened there.

const WALKERS = {
  intersectionId: "dpk8x",
  intersectionLabel: "Walkers Line & Dundas St",
  intersectionLatitude: 43.4675,
  intersectionLongitude: -79.6877,
  city: "Oakville",
};

const incidents = [
  buildIncident({ ...WALKERS, globalID: "G-1", caseNo: "CASE-A" }),
  buildIncident({ ...WALKERS, globalID: "G-2", caseNo: "CASE-B" }),
  buildIncident({
    globalID: "G-3",
    caseNo: "CASE-C",
    location: "LAKESHORE RD W",
    latitude: 43.4,
    longitude: -79.7,
  }),
];

const search = async (page: Page, { phone = false } = {}) => {
  await page.goto("/en");
  await mockIncidentData(page, incidents);
  // On a phone the search form lives in the Filters sheet.
  if (phone) await page.getByRole("button", { name: "Filters" }).click();
  await page.getByRole("button", { name: "Search" }).click();
};

test.describe("Given a desktop search with results", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await search(page);
  });

  test("Then the Locations card lists intersections and unmatched spots, busiest first", async ({
    page,
  }) => {
    const list = page.getByRole("list", { name: "Locations" });
    const rows = list.getByRole("button");
    await expect(rows).toHaveCount(2);
    await expect(rows.nth(0)).toContainText("Walkers Line & Dundas St");
    await expect(rows.nth(0)).toContainText("2");
    await expect(rows.nth(1)).toContainText("LAKESHORE RD W");
    await expect(page.getByText("3 incidents")).toBeVisible();
  });

  test("When a row is selected, then it is highlighted and the incident list opens", async ({
    page,
  }) => {
    const row = page
      .getByRole("list", { name: "Locations" })
      .getByRole("button")
      .first();
    await row.click();

    await expect(row).toHaveAttribute("aria-pressed", "true");
    const panel = page.getByRole("region", {
      name: "Walkers Line & Dundas St",
    });
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("CASE-A");
    await expect(panel).toContainText("CASE-B");
    await expect(page.locator(".location-pin-selected")).toHaveCount(1);
    await assertNoA11yViolations(page);
  });

  test("When an incident is opened, then its detail replaces the list and can be closed", async ({
    page,
  }) => {
    await page
      .getByRole("list", { name: "Locations" })
      .getByRole("button")
      .first()
      .click();
    const panel = page.getByRole("region", {
      name: "Walkers Line & Dundas St",
    });

    // Clicking anywhere on the row (here the Case # cell) opens the detail.
    await panel.getByRole("cell", { name: "CASE-A" }).click();
    await expect(panel).toContainText("Incident 1 / 2");
    await expect(panel).toContainText("Locations are approximate");
    await panel.getByRole("button", { name: "Next incident" }).click();
    await expect(panel).toContainText("Incident 2 / 2");

    await panel.getByRole("button", { name: "All incidents" }).click();
    await expect(panel.getByRole("table")).toBeVisible();

    await panel.getByRole("button", { name: "Close location" }).click();
    await expect(panel).toBeHidden();
  });

  test("Then the zoom control is at the bottom left", async ({ page }) => {
    await expect(
      page.locator(".leaflet-bottom.leaflet-left .leaflet-control-zoom"),
    ).toBeVisible();
  });
});

test.describe("Given a phone search with results", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await search(page, { phone: true });
  });

  test("When a location is picked, then the sheet closes and a half-height sheet shows its incidents", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Locations" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /Walkers Line/ }).click();
    await expect(dialog).toBeHidden();

    const sheet = page.getByRole("region", {
      name: "Walkers Line & Dundas St",
    });
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText("CASE-A");

    await sheet.getByRole("button", { name: "All locations" }).click();
    await expect(sheet).toBeHidden();
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
