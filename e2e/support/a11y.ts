import { Page, expect } from '@playwright/test';
import { injectAxe, getViolations } from 'axe-playwright';

/**
 * Runs an axe-core scan against the current page state and fails the test
 * with a readable summary if any violations are found. Kept as a shared
 * "Then no accessibility violations" step rather than a dedicated
 * accessibility.spec.ts, so a11y is checked as part of the normal e2e flows
 * (initial load, after search results render, etc.) instead of only once.
 */
export const assertNoA11yViolations = async (page: Page) => {
  await injectAxe(page);
  const violations = await getViolations(page);

  const summary = violations
    .map((violation) => `${violation.id} (${violation.impact}): ${violation.help} - ${violation.nodes.length} node(s)`)
    .join('\n');

  expect(violations, summary).toHaveLength(0);
};
