import { test, expect } from '@playwright/test';

test.describe('Clippy Retro', () => {
  test('clippy container is created', async ({ page }) => {
    await page.goto('/test.html?retros=clippy');

    // Wait for Clippy to appear
    const container = page.locator('#clippy-container');
    await expect(container).toBeVisible({ timeout: 5000 });
  });

  test('clippy shows intro message', async ({ page }) => {
    await page.goto('/test.html?retros=clippy');
    await page.waitForTimeout(1500);

    const message = page.locator('#clippy-message');
    await expect(message).toBeVisible();

    // Should contain one of the intro messages
    const text = await message.textContent();
    expect(text).toContain("It looks like you're");
  });

  test('clippy has chat and dismiss buttons', async ({ page }) => {
    await page.goto('/test.html?retros=clippy');
    await page.waitForTimeout(1500);

    const chatBtn = page.locator('#clippy-chat-btn');
    const dismissBtn = page.locator('#clippy-dismiss-btn');

    await expect(chatBtn).toBeVisible();
    await expect(dismissBtn).toBeVisible();
  });

  test('clippy dismiss button hides clippy', async ({ page }) => {
    await page.goto('/test.html?retros=clippy');
    await page.waitForTimeout(1500);

    const container = page.locator('#clippy-container');
    await expect(container).toBeVisible();

    // Click dismiss
    await page.click('#clippy-dismiss-btn');

    // Should hide after animation
    await expect(container).toBeHidden({ timeout: 1000 });
  });

  test('clippy chat button shows confirmation dialog', async ({ page }) => {
    await page.goto('/test.html?retros=clippy');
    await page.waitForTimeout(1500);

    // Set up dialog handler to cancel
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('download');
      await dialog.dismiss();
    });

    // Click chat button
    await page.click('#clippy-chat-btn');

    // Intro should still be visible since we cancelled
    const intro = page.locator('#clippy-intro');
    await expect(intro).toBeVisible();
  });

  test('clippy character image or emoji fallback is shown', async ({ page }) => {
    await page.goto('/test.html?retros=clippy');
    await page.waitForTimeout(1500);

    const character = page.locator('#clippy-character');
    await expect(character).toBeVisible();

    // Should have either the image or the emoji fallback
    const hasContent = await character.evaluate((el) => {
      return el.querySelector('img') !== null || el.textContent?.includes('📎');
    });
    expect(hasContent).toBe(true);
  });

  test('clippy loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/test.html?retros=clippy');
    await page.waitForTimeout(2000);

    expect(errors).toHaveLength(0);
  });

  test('clippy buttons section is visible initially', async ({ page }) => {
    await page.goto('/test.html?retros=clippy');
    await page.waitForTimeout(1500);

    const buttons = page.locator('#clippy-buttons');
    await expect(buttons).toBeVisible();
  });
});
