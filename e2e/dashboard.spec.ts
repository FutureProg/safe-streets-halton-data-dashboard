import { test, expect } from "@playwright/test";
import { assertNoA11yViolations } from "./support/a11y";

// Feature: Dashboard shell
// As a visitor, when I open the dashboard, I should see the map and the
// controls needed to search and filter incidents, before any search has
// been performed.

test.describe("Given a user visits the dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("When the page loads, then the map and its controls are visible", async ({
    page,
  }) => {
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Menu button" }),
    ).toBeVisible();
    await expect(page.getByLabel("Case Number")).toBeVisible();
    await expect(page.getByRole("group", { name: "Start Date" })).toBeVisible();
    await expect(page.getByRole("group", { name: "End Date" })).toBeVisible();
    await expect(page.getByLabel("Municipality")).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeVisible();
  });

  test("When the page loads, then no incidents are shown until a search is submitted", async ({
    page,
  }) => {
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await expect(
      page.locator(".leaflet-marker-icon, .marker-cluster"),
    ).toHaveCount(0);
  });

  test("When the page loads, then there are no accessibility violations", async ({
    page,
  }) => {
    await expect(page.locator(".leaflet-container")).toBeVisible();
    await assertNoA11yViolations(page);
  });
});

test.describe("Given a user visits a locale-specific URL", () => {
  test('When the URL is /en, then <html lang="en"> and the dashboard renders', async ({
    page,
  }) => {
    await page.goto("/en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test('When the URL is /fr, then <html lang="fr"> and the dashboard renders', async ({
    page,
  }) => {
    await page.goto("/fr");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("When the URL is /fr, then the controls are shown in French", async ({
    page,
  }) => {
    await page.goto("/fr");

    await expect(
      page.getByRole("group", { name: "Date de début" }),
    ).toBeVisible();
    await expect(
      page.getByRole("group", { name: "Date de fin" }),
    ).toBeVisible();
    await expect(page.getByLabel("Municipalité")).toBeVisible();
    await expect(page.getByLabel("Numéro de dossier")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Rechercher" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Bouton du menu" }),
    ).toBeVisible();
  });
});

test.describe("Given the navigation menu", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en");
  });

  test("When the user opens the menu toggle, then the menu popup appears", async ({
    page,
  }) => {
    const toggle = page.getByRole("button", { name: "Menu button" });
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await toggle.click();

    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    await expect(page.getByRole("menuitem")).toHaveCount(3);
  });

  test("When the user presses Escape on an open menu, then the menu popup is hidden", async ({
    page,
  }) => {
    const toggle = page.getByRole("button", { name: "Menu button" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Escape");

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("Given the case number lookup field", () => {
  test("When the viewport is desktop-sized, then the field is visible and editable", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/en");

    const caseNumberInput = page.getByLabel("Case Number");
    await expect(caseNumberInput).toBeVisible();

    await caseNumberInput.fill("HR-2024-0042");
    await expect(caseNumberInput).toHaveValue("HR-2024-0042");
  });

  test("When the viewport is mobile-sized, then the field is hidden", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");

    await expect(page.getByLabel("Case Number")).toBeHidden();
  });
});

test.describe("Given the mobile filter sheet", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en");
  });

  test("When the viewport is mobile-sized, then the filters are behind a Filters button", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: "Filters" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Search" })).toBeHidden();
  });

  test("When the user opens the Filters button, then the filter form is shown in a dialog", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Filters" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("group", { name: "Start Date" }),
    ).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Search" })).toBeVisible();
    // Let the enter transition finish so axe sees the final colours.
    await expect(page.locator('[data-slot="sheet-overlay"]')).toHaveCSS(
      "opacity",
      "1",
    );
    await expect(page.locator('[data-slot="sheet-content"]')).toHaveCSS(
      "opacity",
      "1",
    );
    await assertNoA11yViolations(page);
  });

  test("When the user searches from the sheet, then the sheet closes", async ({
    page,
  }) => {
    await page.route("**/api/data?**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [], nextCursor: null, hasMore: false }),
      }),
    );
    await page.getByRole("button", { name: "Filters" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Search" })
      .click();

    await expect(page.getByRole("dialog")).toBeHidden();
  });
});
