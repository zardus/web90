import { test, expect } from '@playwright/test';

test.describe('URL Parameter Handling', () => {
  test.describe('retros parameter', () => {
    test('retros=none disables all retros', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(1000);

      // Elements should be hidden
      const retroBadges = page.locator('#retro-badges');
      const retroCounter = page.locator('#retro-counter');

      await expect(retroBadges).toBeHidden();
      await expect(retroCounter).toBeHidden();
    });

    test('retros=all loads all retros', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=all');
      await page.waitForTimeout(3000); // Heavy load

      // Should load without errors
      expect(errors).toHaveLength(0);

      // DOM retro elements should exist in DOM (may or may not be visible depending on slot)
      const badges = page.locator('#retro-badges');
      const counter = page.locator('#retro-counter');

      const badgesExists = (await badges.count()) > 0;
      const counterExists = (await counter.count()) > 0;

      // At least one DOM retro element should exist
      expect(badgesExists || counterExists).toBe(true);
    });

    test('single retro loads correctly', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1000);

      const badges = page.locator('#retro-badges');
      await expect(badges).toBeVisible();

      // Counter should NOT be visible
      const counter = page.locator('#retro-counter');
      await expect(counter).toBeHidden();
    });

    test('multiple retros load correctly', async ({ page }) => {
      await page.goto('/test.html?retros=badges,counter,blink');
      await page.waitForTimeout(1500);

      const badges = page.locator('#retro-badges');
      const counter = page.locator('#retro-counter');
      const blink = page.locator('blink');

      await expect(badges).toBeVisible();
      await expect(counter).toBeVisible();
      await expect(blink).toHaveCount(1);
    });

    test('retro parameter (singular) also works', async ({ page }) => {
      await page.goto('/test.html?retro=badges');
      await page.waitForTimeout(1000);

      const badges = page.locator('#retro-badges');
      await expect(badges).toBeVisible();
    });

    test('unknown retro name is ignored gracefully', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=nonexistent-retro,badges');
      await page.waitForTimeout(1000);

      expect(errors).toHaveLength(0);

      // Valid retro should still load
      const badges = page.locator('#retro-badges');
      await expect(badges).toBeVisible();
    });
  });

  test.describe('theme parameter', () => {
    test('theme parameter applies theme', async ({ page }) => {
      await page.goto('/test.html?theme=matrix');
      await page.waitForTimeout(2000);

      const canvas = page.locator('canvas');
      expect(await canvas.count()).toBeGreaterThanOrEqual(1);
    });

    test('theme parameter overrides retheme retro', async ({ page }) => {
      await page.goto('/test.html?retros=retheme&theme=crt');
      await page.waitForTimeout(1500);

      // CRT theme should be applied, not random
      const crtElements = page.locator('.crt-scanlines, .scanlines, [class*="crt"]');
      expect(await crtElements.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('trail-style parameter', () => {
    const trailStyles = ['binary', 'sparkles', 'fire', 'rainbow', 'stars', 'hearts'];

    for (const style of trailStyles) {
      test(`trail-style=${style} loads without error`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));

        await page.goto(`/test.html?retros=mouse-trail&trail-style=${style}`);
        await page.waitForTimeout(1500);

        expect(errors).toHaveLength(0);
      });
    }
  });

  test.describe('wordart-style parameter', () => {
    test('wordart-style applies specific style', async ({ page }) => {
      await page.goto('/test.html?retros=wordart&wordart-style=five');
      await page.waitForTimeout(1500);

      // Wordart should be applied
      const wordartElement = page.locator('.wordart, [class*="wordart"]');
      expect(await wordartElement.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('divider-style parameter', () => {
    test('divider-style selects specific divider', async ({ page }) => {
      await page.goto('/test.html?retros=dividers&divider-style=1');
      await page.waitForTimeout(1000);

      const dividerImg = page.locator('.divider .divider-img').first();
      const bgImage = await dividerImg.evaluate(el => el.style.backgroundImage);
      expect(bgImage).toContain('1.gif');
    });
  });

  test.describe('cursor-style parameter', () => {
    test('cursor-style applies custom cursor', async ({ page }) => {
      await page.goto('/test.html?retros=custom-cursor&cursor-style=hourglass');
      await page.waitForTimeout(1000);

      const cursorStyle = await page.evaluate(() => {
        return window.getComputedStyle(document.body).cursor;
      });

      expect(cursorStyle).not.toBe('auto');
    });
  });

  test.describe('viz parameter', () => {
    const vizModes = ['waveform', 'spectrogram', 'spectrum', 'psychedelic', 'radial'];

    for (const viz of vizModes) {
      test(`viz=${viz} loads without error`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));

        await page.goto(`/test.html?retros=media-player&viz=${viz}`);
        await page.waitForTimeout(1500);

        expect(errors).toHaveLength(0);
      });
    }
  });

  test.describe('Combined parameters', () => {
    test('multiple parameters work together', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(
        '/test.html?retros=badges,counter,dividers,blink&divider-style=2'
      );
      await page.waitForTimeout(2000);

      expect(errors).toHaveLength(0);

      // All retros should be loaded
      await expect(page.locator('#retro-badges')).toBeVisible();
      await expect(page.locator('#retro-counter')).toBeVisible();
      await expect(page.locator('blink')).toHaveCount(1);

      // Divider style should be applied
      const dividerImg = page.locator('.divider .divider-img').first();
      const bgImage = await dividerImg.evaluate(el => el.style.backgroundImage);
      expect(bgImage).toContain('2.gif');
    });

    test('theme with retros works together', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=badges,counter&theme=crt');
      await page.waitForTimeout(2000);

      expect(errors).toHaveLength(0);

      // CRT overlay should exist
      const crtElements = page.locator('.crt-scanlines, .scanlines, [class*="crt"]');
      expect(await crtElements.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Edge Cases', () => {
    test('duplicate retro names are deduplicated', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=badges,badges,badges');
      await page.waitForTimeout(1000);

      expect(errors).toHaveLength(0);

      // Badges should only appear once
      const badges = page.locator('#retro-badges');
      await expect(badges).toBeVisible();
    });

    test('case insensitive retro names work', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=BADGES,Counter,BLiNk');
      await page.waitForTimeout(1500);

      expect(errors).toHaveLength(0);

      // All should load despite mixed case
      await expect(page.locator('#retro-badges')).toBeVisible();
      await expect(page.locator('#retro-counter')).toBeVisible();
      await expect(page.locator('blink')).toHaveCount(1);
    });

    test('whitespace in retro list is trimmed', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=badges%20,%20counter%20,%20blink');
      await page.waitForTimeout(1500);

      expect(errors).toHaveLength(0);

      await expect(page.locator('#retro-badges')).toBeVisible();
      await expect(page.locator('#retro-counter')).toBeVisible();
    });

    test('empty retros parameter loads defaults', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=');
      await page.waitForTimeout(1000);

      expect(errors).toHaveLength(0);
    });

    test('invalid divider-style number falls back gracefully', async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=dividers&divider-style=999');
      await page.waitForTimeout(1000);

      expect(errors).toHaveLength(0);

      // Should still have dividers (falls back to first or random)
      const dividerImg = page.locator('.divider .divider-img').first();
      await expect(dividerImg).toBeVisible();
    });

    test('invalid theme name is handled gracefully', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?theme=nonexistent-theme');
      await page.waitForTimeout(1500);

      // Should not crash - may load random theme or no theme
      expect(errors).toHaveLength(0);
    });

    test('theme parameter auto-adds retheme retro', async ({ page }) => {
      await page.goto('/test.html?retros=badges&theme=crt');
      await page.waitForTimeout(2000);

      // CRT theme should be applied even without explicit retheme
      const crtElements = page.locator('.crt-overlay, .crt-curvature');
      expect(await crtElements.count()).toBeGreaterThanOrEqual(1);
    });

    test('retros=all expands to include all fun retros', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=all');
      await page.waitForTimeout(3000);

      expect(errors).toHaveLength(0);

      // Should have multiple retro elements visible (at least one)
      const badges = page.locator('#retro-badges');
      const counter = page.locator('#retro-counter');

      const badgesVisible = await badges.isVisible();
      const counterVisible = await counter.isVisible();

      // At least one DOM retro should be visible
      expect(badgesVisible || counterVisible).toBe(true);
    });

    test('combining all with specific retros works', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=all,control-panel');
      await page.waitForTimeout(3000);

      expect(errors).toHaveLength(0);

      // Control panel should be visible
      const panel = page.locator('#control-panel');
      await expect(panel).toBeVisible();
    });
  });

  test.describe('Multiple DOM Retros Distribution', () => {
    test('multiple DOM retros are distributed across slots', async ({
      page,
    }) => {
      await page.goto('/test.html?retros=badges,counter,media-player,webring');
      await page.waitForTimeout(2000);

      // At least some retros should be visible
      const badges = page.locator('#retro-badges');
      const counter = page.locator('#retro-counter');

      const badgesVisible = await badges.isVisible();
      const counterVisible = await counter.isVisible();

      expect(badgesVisible || counterVisible).toBe(true);
    });

    test('slot 0 receives first DOM retro', async ({ page }) => {
      await page.goto('/test.html?retros=badges,counter');
      await page.waitForTimeout(1500);

      // First slot should contain a retro element
      const slot0 = page.locator('[data-retro-slot="0"]');
      const hasRetro = await slot0.evaluate((el) => {
        return el.querySelector('#retro-badges, #retro-counter') !== null;
      });
      expect(hasRetro).toBe(true);
    });
  });
});
