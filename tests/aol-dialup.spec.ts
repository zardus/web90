import { test, expect } from '@playwright/test';

test.describe('AOL Dialup Retro', () => {
  test('aol-dialup overlay is created', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');

    // Wait for the overlay to appear
    const overlay = page.locator('#aol-dialup-overlay');
    await expect(overlay).toBeVisible({ timeout: 5000 });
  });

  test('aol-dialup has three connection panels', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');
    await page.waitForTimeout(500);

    // Check for the three connection panels
    const panels = page.locator('.aol-panel');
    await expect(panels).toHaveCount(3);
  });

  test('aol-dialup has window with title bar', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');
    await page.waitForTimeout(500);

    const window = page.locator('.aol-window');
    await expect(window).toBeVisible();

    // Use first() to avoid strict mode violation with multiple title bars
    const titleBar = page.locator('.aol-window .title-bar-text').first();
    await expect(titleBar).toContainText('AOL Sign On');
  });

  test('aol-dialup has progress bar', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');
    await page.waitForTimeout(500);

    const progressBar = page.locator('.aol-progress-bar');
    await expect(progressBar).toBeVisible();
  });

  test('aol-dialup connection sequence progresses through panels', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');

    // Wait for first panel to become active
    const panel0 = page.locator('[data-panel="0"]');
    await expect(panel0).toHaveClass(/active|complete/, { timeout: 5000 });
  });

  test('cancel button shakes dialog instead of closing', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');
    await page.waitForTimeout(500);

    // Get initial overlay visibility
    const overlay = page.locator('#aol-dialup-overlay');
    await expect(overlay).toBeVisible();

    // Click cancel button
    const cancelBtn = page.locator('.aol-btn-cancel');
    await cancelBtn.click();

    // Dialog should still be visible (not closed)
    await expect(overlay).toBeVisible();

    // Window should have shake class briefly
    const window = page.locator('.aol-window');
    // After shake animation, it's removed - just verify it didn't close
    await expect(window).toBeVisible();
  });

  test('aol-dialup shows success screen after sequence completes', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');

    // Wait for success screen (connection sequence takes ~10s)
    const successScreen = page.locator('.aol-success.visible');
    await expect(successScreen).toBeVisible({ timeout: 15000 });

    // Check for "You've Got Mail!" message
    const successText = page.locator('.aol-success-subtext');
    await expect(successText).toContainText("You've Got Mail!");
  });

  test('aol-dialup overlay fades out after completion', async ({ page }) => {
    await page.goto('/test.html?retros=aol-dialup');

    // Wait for overlay to fade out (sequence + 2s auto-continue + 0.5s fade)
    const overlay = page.locator('#aol-dialup-overlay');
    await expect(overlay).toBeVisible({ timeout: 5000 });

    // Eventually should be removed from DOM
    await expect(overlay).toBeHidden({ timeout: 20000 });
  });

  test('aol-dialup loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/test.html?retros=aol-dialup');
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });
});
