import { test, expect } from '@playwright/test';
import { assertNoA11yViolations } from './support/a11y';

// Feature: Dashboard shell
// As a visitor, when I open the dashboard, I should see the map and the
// controls needed to search and filter incidents, before any search has
// been performed.

test.describe('Given a user visits the dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('When the page loads, then the map and its controls are visible', async ({ page }) => {
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Menu button' })).toBeVisible();
    await expect(page.getByLabel('Case Number')).toBeVisible();
    await expect(page.getByLabel('Start Date')).toBeVisible();
    await expect(page.getByLabel('End Date')).toBeVisible();
    await expect(page.getByLabel('Municipality')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
  });

  test('When the page loads, then no incidents are shown until a search is submitted', async ({ page }) => {
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await expect(page.locator('.leaflet-marker-icon, .marker-cluster')).toHaveCount(0);
  });

  test('When the page loads, then there are no accessibility violations', async ({ page }) => {
    await expect(page.locator('.leaflet-container')).toBeVisible();
    await assertNoA11yViolations(page);
  });
});

test.describe('Given a user visits a locale-specific URL', () => {
  // NOTE: most of the dashboard's copy ("Search", "Start Date", "Case
  // Number", etc.) is currently hardcoded English in JSX rather than routed
  // through react-i18next, and src/locales/fr/translations.json only has an
  // "AppTitle" key. So this deliberately checks locale routing/<html lang>
  // and that the route renders, not that copy differs between locales -
  // there isn't real fr copy to assert on yet.
  test('When the URL is /en, then <html lang="en"> and the dashboard renders', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });

  test('When the URL is /fr, then <html lang="fr"> and the dashboard renders', async ({ page }) => {
    await page.goto('/fr');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('.leaflet-container')).toBeVisible();
  });
});

test.describe('Given the navigation menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en');
  });

  test('When the user opens the menu toggle, then the menu popup appears', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Menu button' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await expect(page.getByRole('menuitem')).toHaveCount(3);
  });

  test('When the user closes an open menu, then the menu popup is hidden', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Menu button' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Given the case number lookup field', () => {
  test('When the viewport is desktop-sized, then the field is visible and editable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/en');

    const caseNumberInput = page.getByLabel('Case Number');
    await expect(caseNumberInput).toBeVisible();

    await caseNumberInput.fill('HR-2024-0042');
    await expect(caseNumberInput).toHaveValue('HR-2024-0042');
  });

  test('When the viewport is mobile-sized, then the field is hidden', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/en');

    await expect(page.getByLabel('Case Number')).toBeHidden();
  });
});
