import { test, expect } from "@playwright/test";
import { buildIncident, mockCaseLookup } from "./support/mockIncidents";
import { assertNoA11yViolations } from "./support/a11y";

// Feature: Find by case #
// As a visitor with a specific case number, I want to open it from the menu
// and see that incident's details without searching the map.

const incidents = [
  buildIncident({
    globalID: "G-1",
    caseNo: "HR-2024-0042",
    description: "Motor Vehicle Collision",
    intersectionId: "dpk8x",
    intersectionLabel: "Walkers Line & Dundas St",
    intersectionLatitude: 43.4675,
    intersectionLongitude: -79.6877,
  }),
  buildIncident({
    globalID: "G-2",
    caseNo: "HR-2024-0099",
    location: "LAKESHORE RD W",
  }),
];

const openDialog = async (page: import("@playwright/test").Page) => {
  await page.goto("/en");
  await mockCaseLookup(page, incidents);
  await page.getByRole("button", { name: "Menu button" }).click();
  await page.getByRole("menuitem", { name: "Find by case #" }).click();
  return page.getByRole("dialog", { name: "Case lookup" });
};

test.describe("Given the dashboard", () => {
  test("Then the filters no longer include a case number field", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");
    await expect(page.getByLabel("Case Number")).toBeHidden();
  });

  test("When the menu opens, then it offers Find by case #", async ({
    page,
  }) => {
    await page.goto("/en");
    await page.getByRole("button", { name: "Menu button" }).click();
    await expect(
      page.getByRole("menuitem", { name: "Find by case #" }),
    ).toBeVisible();
  });
});

test.describe("Given the Case lookup dialog", () => {
  test("When a known case number is submitted, then its details show below the search field", async ({
    page,
  }) => {
    const dialog = await openDialog(page);
    await dialog.getByLabel("Case Number").fill("HR-2024-0042");
    await dialog.getByRole("button", { name: "Submit" }).click();

    await expect(dialog.getByText("Walkers Line & Dundas St")).toBeVisible();
    await expect(dialog.getByText("HR-2024-0042")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Next incident" }),
    ).toBeHidden();
    await assertNoA11yViolations(page);
  });

  test("When the search is edited and submitted again, then the details update", async ({
    page,
  }) => {
    const dialog = await openDialog(page);
    const input = dialog.getByLabel("Case Number");
    await input.fill("HR-2024-0042");
    await dialog.getByRole("button", { name: "Submit" }).click();
    await expect(dialog.getByText("Walkers Line & Dundas St")).toBeVisible();

    await input.fill("HR-2024-0099");
    await dialog.getByRole("button", { name: "Submit" }).click();
    await expect(dialog.getByText("LAKESHORE RD W")).toBeVisible();
    await expect(dialog.getByText("Walkers Line & Dundas St")).toBeHidden();
  });

  test("When the case number is unknown, then the dialog says nothing was found", async ({
    page,
  }) => {
    const dialog = await openDialog(page);
    await dialog.getByLabel("Case Number").fill("NOPE");
    await dialog.getByRole("button", { name: "Submit" }).click();
    await expect(
      dialog.getByText("No incident found for case NOPE"),
    ).toBeVisible();
  });

  test("When Escape is pressed, then the dialog closes", async ({ page }) => {
    const dialog = await openDialog(page);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });
});
