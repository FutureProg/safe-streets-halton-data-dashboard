import { test, expect } from "@playwright/test";
import { buildIncident, mockIncidentData } from "./support/mockIncidents";
import { assertNoA11yViolations } from "./support/a11y";

// Feature: Marker popup
// As a visitor, clicking a map marker shows the incident details, and I can
// page through incidents that share the same location.

const MARKER_SELECTOR = ".leaflet-marker-icon";

test.describe("Given a marker on the map", () => {
  test("When the user clicks it, then the incident details are shown", async ({
    page,
  }) => {
    await page.goto("/en");
    await mockIncidentData(page, [buildIncident({ caseNo: "HR-2024-0001" })]);
    await page.getByRole("button", { name: "Search" }).click();

    await page.locator(MARKER_SELECTOR).first().click();

    const popup = page.locator(".leaflet-popup");
    await expect(popup).toContainText("HR-2024-0001");
    await expect(popup.getByText("Municipality")).toBeVisible();
    await expect(
      popup.getByRole("button", { name: "Next incident" }),
    ).toHaveCount(0);
  });

  test("When several incidents share a location, then the user can page through them", async ({
    page,
  }) => {
    await page.goto("/en");
    await mockIncidentData(page, [
      buildIncident({ globalID: "G-1", caseNo: "CASE-A" }),
      buildIncident({ globalID: "G-2", caseNo: "CASE-B" }),
    ]);
    await page.getByRole("button", { name: "Search" }).click();

    await page.locator(MARKER_SELECTOR).first().click();

    const popup = page.locator(".leaflet-popup");
    await expect(popup).toContainText("Incident 1 / 2");
    await expect(popup).toContainText("CASE-A");

    await popup.getByRole("button", { name: "Next incident" }).click();
    await expect(popup).toContainText("Incident 2 / 2");
    await expect(popup).toContainText("CASE-B");

    await popup.getByRole("button", { name: "Next incident" }).click();
    await expect(popup).toContainText("Incident 1 / 2");
    await assertNoA11yViolations(page);
  });
});
