import { test, expect } from '@playwright/test';

test.describe('DOM Retros', () => {
  test.describe('Badges', () => {
    test('badges are rendered in slot', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1000);

      const badges = page.locator('#retro-badges img');
      expect(await badges.count()).toBeGreaterThanOrEqual(1);
    });

    test('badge images load successfully', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1000);

      const badges = page.locator('#retro-badges img');
      const count = await badges.count();

      for (let i = 0; i < count; i++) {
        const badge = badges.nth(i);
        // Check naturalWidth > 0 means image loaded
        const loaded = await badge.evaluate(
          (img: HTMLImageElement) => img.naturalWidth > 0
        );
        expect(loaded).toBe(true);
      }
    });

    test('clickable badges have href', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1000);

      // The vim badge should be a link
      const vimBadge = page.locator('#retro-badges a[href*="neovim"]');
      await expect(vimBadge).toHaveCount(1);
    });
  });

  test.describe('Counter', () => {
    test('counter element is rendered', async ({ page }) => {
      await page.goto('/test.html?retros=counter');
      await page.waitForTimeout(1000);

      const counter = page.locator('#retro-counter');
      await expect(counter).toBeVisible();
    });

    test('counter displays digits', async ({ page }) => {
      await page.goto('/test.html?retros=counter');
      await page.waitForTimeout(1500); // Give counter time to animate

      const visitorCount = page.locator('#visitorCount');
      const text = await visitorCount.textContent();
      expect(text).toMatch(/^\d{6}$/); // Should be 6 digits
    });

    test('counter has label', async ({ page }) => {
      await page.goto('/test.html?retros=counter');
      await page.waitForTimeout(1000);

      const label = page.locator('#visitorLabel');
      await expect(label).toBeVisible();
    });
  });

  test.describe('Media Player', () => {
    test('media player element is rendered', async ({ page }) => {
      await page.goto('/test.html?retros=media-player');
      await page.waitForTimeout(1500);

      const player = page.locator('#retro-media-player');
      await expect(player).toBeVisible();
    });

    test('audio element exists', async ({ page }) => {
      await page.goto('/test.html?retros=media-player');
      await page.waitForTimeout(1500);

      const audio = page.locator('#audioPlayer');
      await expect(audio).toHaveCount(1);
    });

    test('waveform canvas exists', async ({ page }) => {
      await page.goto('/test.html?retros=media-player');
      await page.waitForTimeout(1500);

      const canvas = page.locator('#waveformCanvas');
      await expect(canvas).toHaveCount(1);
    });

    test('play button exists', async ({ page }) => {
      await page.goto('/test.html?retros=media-player');
      await page.waitForTimeout(1500);

      const playBtn = page.locator('.media-controls button');
      await expect(playBtn).toBeVisible();
    });
  });

  test.describe('Webring', () => {
    test('webring iframe is rendered when configured', async ({ page }) => {
      await page.goto('/test.html?retros=webring');
      await page.waitForTimeout(1000);

      const webring = page.locator('#webring');
      await expect(webring).toBeVisible();
    });

    test('webring iframe has src', async ({ page }) => {
      await page.goto('/test.html?retros=webring');
      await page.waitForTimeout(1000);

      const webring = page.locator('#webring');
      const src = await webring.getAttribute('src');
      expect(src).toBeTruthy();
    });
  });

  test.describe('Guestbook', () => {
    test('guestbook iframe is rendered when configured', async ({ page }) => {
      await page.goto('/test.html?retros=guestbook');
      await page.waitForTimeout(1000);

      const guestbook = page.locator('#guestbook');
      await expect(guestbook).toBeVisible();
    });
  });

  test.describe('Multiple DOM Retros', () => {
    test('badges and counter load together', async ({ page }) => {
      await page.goto('/test.html?retros=badges,counter');
      await page.waitForTimeout(1500);

      const badges = page.locator('#retro-badges');
      const counter = page.locator('#retro-counter');

      await expect(badges).toBeVisible();
      await expect(counter).toBeVisible();
    });
  });
});
