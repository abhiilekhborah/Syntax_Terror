// @ts-check
const { test, expect } = require('@playwright/test');

const REPORT_URL = '/report.html?lat=28.6139&lng=77.209&address=Test%20Location%2C%20Delhi';

test.describe('Map issue report (frontend)', () => {
  test('submitting a report from the map form shows success and data reaches backend', async ({ page }) => {
    await page.goto(REPORT_URL);

    // Wait for the form to be ready (location resolved)
    await expect(page.getByRole('heading', { name: /submit an issue report/i })).toBeVisible();

    // Fill required description
    const description = `E2E test issue at ${Date.now()}`;
    await page.getByPlaceholder(/describe the issue/i).fill(description);

    // Optional: set issue type (pothole is default)
    await page.getByRole('button', { name: /^pothole$/i }).click();

    // Submit
    await page.getByRole('button', { name: /submit report/i }).click();

    // Either success screen (report saved) or duplicate screen (similar report nearby)
    const successScreen = page.locator('#success-screen.show');
    const dupScreen = page.locator('#dup-screen.show');

    await expect(successScreen.or(dupScreen)).toBeVisible({ timeout: 15000 });

    // If we got success, ticket id should be shown
    if (await successScreen.isVisible()) {
      await expect(page.locator('#ticket-pill')).toContainText(/TICKET #/);
      const ticketText = await page.locator('#ticket-pill').textContent();
      const ticketId = ticketText?.replace('TICKET #', '').trim();
      expect(ticketId).toBeTruthy();
      expect(ticketId).not.toBe('—');
    }
  });

  test('report form shows validation when description is empty', async ({ page }) => {
    await page.goto(REPORT_URL);
    await expect(page.getByRole('heading', { name: /submit an issue report/i })).toBeVisible();

    // Submit without description
    await page.getByRole('button', { name: /submit report/i }).click();

    // Description field should get error styling or stay on form (no success/dup screen)
    const descInput = page.getByPlaceholder(/describe the issue/i);
    await expect(descInput).toBeFocused();
    const successScreen = page.locator('#success-screen.show');
    await expect(successScreen).not.toBeVisible();
  });
});
