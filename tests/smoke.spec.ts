import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('page loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/test.html');
    await page.waitForTimeout(1000); // Let scripts initialize

    expect(errors).toHaveLength(0);
  });

  test('page loads without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/test.html');
    await page.waitForTimeout(1000);

    // Filter out expected/benign errors (like 404s for test audio files, CDN errors, etc.)
    const realErrors = consoleErrors.filter(
      (e) =>
        !e.includes('example.com') &&
        !e.includes('net::ERR') &&
        !e.includes('Failed to load resource') &&
        !e.includes('unpkg.com') &&
        !e.includes('fonts.googleapis.com')
    );
    expect(realErrors).toHaveLength(0);
  });

  test('web90 object is exposed globally', async ({ page }) => {
    await page.goto('/test.html');
    await page.waitForTimeout(500);

    const hasWeb90 = await page.evaluate(() => typeof window.web90 === 'object');
    expect(hasWeb90).toBe(true);
  });

  test('retro slots are present', async ({ page }) => {
    await page.goto('/test.html');

    const slot0 = page.locator('[data-retro-slot="0"]');
    const slot1 = page.locator('[data-retro-slot="1"]');

    await expect(slot0).toBeVisible();
    await expect(slot1).toBeVisible();
  });

  test('retros=none loads page without retros', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    // Badges element should be hidden (not populated/visible)
    const badges = page.locator('#retro-badges');
    await expect(badges).toBeHidden();

    // No fullscreen canvas elements created by JS retros (mouse-trail, fireworks, etc.)
    // The waveformCanvas in the media player template exists but should be hidden
    const fullscreenCanvases = page.locator('canvas:not(#waveformCanvas)');
    await expect(fullscreenCanvases).toHaveCount(0);
  });

  test('retros=all loads without crashing', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    await page.goto('/test.html?retros=all');
    // Give it time - loading all retros is heavy
    await page.waitForTimeout(3000);

    expect(errors).toHaveLength(0);
  });

  test('main heading is present', async ({ page }) => {
    await page.goto('/test.html');
    await expect(page.locator('h1')).toContainText('Web90 Test Page');
  });

  test('divider elements are present', async ({ page }) => {
    await page.goto('/test.html');
    const dividers = page.locator('.divider');
    expect(await dividers.count()).toBeGreaterThanOrEqual(3);
  });

  test('tableable sections are present', async ({ page }) => {
    await page.goto('/test.html');
    const tableables = page.locator('.tableable');
    expect(await tableables.count()).toBeGreaterThanOrEqual(3);
  });
});
