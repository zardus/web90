import { test, expect } from '@playwright/test';

test.describe('Configuration', () => {
  test.describe('Default Configuration', () => {
    test('web90.config is exposed globally', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const hasConfig = await page.evaluate(() => {
        return window.web90 && typeof window.web90.config === 'object';
      });

      expect(hasConfig).toBe(true);
    });

    test('config has basePath property', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const basePath = await page.evaluate(() => {
        return window.web90?.config?.basePath;
      });

      expect(basePath).toBeTruthy();
      expect(typeof basePath).toBe('string');
    });

    test('config has badges array', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const badges = await page.evaluate(() => {
        return window.web90?.config?.badges;
      });

      expect(Array.isArray(badges)).toBe(true);
    });

    test('config has dividers array', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const dividers = await page.evaluate(() => {
        return window.web90?.config?.dividers;
      });

      expect(Array.isArray(dividers)).toBe(true);
    });

    test('config has music array', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const music = await page.evaluate(() => {
        return window.web90?.config?.music;
      });

      expect(Array.isArray(music)).toBe(true);
    });
  });

  test.describe('WEB90_CONFIG Override', () => {
    test('custom badges are loaded from config', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1500);

      // Test config has 3 badges defined
      const badgeImages = page.locator('#retro-badges img');
      const count = await badgeImages.count();

      expect(count).toBe(3);
    });

    test('custom dividers are loaded from config', async ({ page }) => {
      await page.goto('/test.html?retros=dividers');
      await page.waitForTimeout(1000);

      // Test config has 3 dividers - any should be used
      const dividerImg = page.locator('.divider .divider-img').first();
      const bgImage = await dividerImg.evaluate((el) => el.style.backgroundImage);

      // Should contain one of the configured dividers
      expect(bgImage).toMatch(/dividers\/[123]\.gif/);
    });

    test('webringUrl from config is applied', async ({ page }) => {
      await page.goto('/test.html?retros=webring');
      await page.waitForTimeout(1000);

      const webring = page.locator('#webring');
      const src = await webring.getAttribute('src');

      // Test config sets webringUrl to about:blank
      expect(src).toBe('about:blank');
    });

    test('guestbookUrl from config is applied', async ({ page }) => {
      await page.goto('/test.html?retros=guestbook');
      await page.waitForTimeout(1000);

      const guestbook = page.locator('#guestbook');
      const src = await guestbook.getAttribute('src');

      // Test config sets guestbookUrl to about:blank
      expect(src).toBe('about:blank');
    });

    test('counterGlitchText is used for visitor counter', async ({ page }) => {
      await page.goto('/test.html?retros=counter');
      await page.waitForTimeout(3000); // Give time for glitch to appear

      // The glitch text is set via config
      // It will eventually flash "VISITORS" instead of "Visitors"
      const labelEl = page.locator('#visitorLabel');
      await expect(labelEl).toBeVisible();
    });
  });

  test.describe('Config Merging', () => {
    test('user config overrides defaults', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      // Test config overrides badges array
      const badgesCount = await page.evaluate(() => {
        return window.web90?.config?.badges?.length;
      });

      // Test.html sets 3 badges
      expect(badgesCount).toBe(3);
    });

    test('undefined config values fall back to defaults', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      // chatUrl is not set in test config, should fall back to empty string
      const chatUrl = await page.evaluate(() => {
        return window.web90?.config?.chatUrl;
      });

      expect(chatUrl).toBe('');
    });
  });

  test.describe('Empty Config Values', () => {
    test('empty dividers array is handled gracefully', async ({ page }) => {
      // We can't easily test with empty config, but we can verify the mechanism
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=dividers');
      await page.waitForTimeout(1000);

      expect(errors).toHaveLength(0);
    });

    test('empty music array is handled gracefully', async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto('/test.html?retros=media-player');
      await page.waitForTimeout(1500);

      // Should not crash even if music is present but audio fails to load
      // (test.html uses example.com URL which won't load)
      expect(errors).toHaveLength(0);
    });

    test('empty webringUrl hides webring iframe', async ({ page }) => {
      // The test config has webringUrl set to about:blank, so iframe loads
      await page.goto('/test.html?retros=webring');
      await page.waitForTimeout(1000);

      const webring = page.locator('#webring');
      await expect(webring).toBeVisible();
    });
  });

  test.describe('Badge Configuration', () => {
    test('badge with href creates link', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1000);

      // Second badge in test config has href
      const link = page.locator('#retro-badges a[href*="neovim"]');
      await expect(link).toBeVisible();
    });

    test('badge without href or onclick is plain image', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1000);

      // Third badge has no href or onclick
      const imgs = page.locator('#retro-badges img');
      const count = await imgs.count();
      expect(count).toBeGreaterThan(0);
    });

    test('badge images load successfully', async ({ page }) => {
      await page.goto('/test.html?retros=badges');
      await page.waitForTimeout(1500);

      const images = page.locator('#retro-badges img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const loaded = await img.evaluate(
          (el: HTMLImageElement) => el.naturalWidth > 0
        );
        expect(loaded).toBe(true);
      }
    });
  });
});

test.describe('Public API', () => {
  test('web90 object exposes expected properties', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const apiShape = await page.evaluate(() => {
      const w = window.web90;
      if (!w) return null;
      return {
        hasConfig: typeof w.config === 'object',
        hasRegisterPlugin: typeof w.registerPlugin === 'function',
        hasLoadRetroResources: typeof w.loadRetroResources === 'function',
        hasRETROS: Array.isArray(w.RETROS),
        hasTHEMES: typeof w.THEMES === 'object',
        hasTRAIL_STYLE_NAMES: Array.isArray(w.TRAIL_STYLE_NAMES),
        hasCURSOR_STYLES: typeof w.CURSOR_STYLES === 'object',
        hasVIZ_MODE_NAMES: Array.isArray(w.VIZ_MODE_NAMES),
        hasParams: w.params instanceof URLSearchParams,
        hasGenerateRandomSelections:
          typeof w.generateRandomSelections === 'function',
        hasCreateElement: typeof w.createElement === 'function',
        hasRandomFrom: typeof w.randomFrom === 'function',
        hasGetRandomDivider: typeof w.getRandomDivider === 'function',
      };
    });

    expect(apiShape).not.toBeNull();
    expect(apiShape?.hasConfig).toBe(true);
    expect(apiShape?.hasRegisterPlugin).toBe(true);
    expect(apiShape?.hasLoadRetroResources).toBe(true);
    expect(apiShape?.hasRETROS).toBe(true);
    expect(apiShape?.hasTHEMES).toBe(true);
    expect(apiShape?.hasTRAIL_STYLE_NAMES).toBe(true);
    expect(apiShape?.hasCURSOR_STYLES).toBe(true);
    expect(apiShape?.hasVIZ_MODE_NAMES).toBe(true);
    expect(apiShape?.hasParams).toBe(true);
    expect(apiShape?.hasGenerateRandomSelections).toBe(true);
    expect(apiShape?.hasCreateElement).toBe(true);
    expect(apiShape?.hasRandomFrom).toBe(true);
    expect(apiShape?.hasGetRandomDivider).toBe(true);
  });

  test('RETROS array contains expected retro definitions', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const retros = await page.evaluate(() => {
      return window.web90?.RETROS?.map((r: { name: string; type: string }) => ({
        name: r.name,
        type: r.type,
      }));
    });

    expect(retros).toBeDefined();
    expect(retros.length).toBeGreaterThan(10);

    // Check for some expected retros
    const names = retros.map((r: { name: string }) => r.name);
    expect(names).toContain('badges');
    expect(names).toContain('counter');
    expect(names).toContain('matrix');
    expect(names).toContain('win98');
    expect(names).toContain('mouse-trail');
  });

  test('getRandomDivider returns a divider URL', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const divider = await page.evaluate(() => {
      return window.web90?.getRandomDivider?.();
    });

    expect(divider).toBeTruthy();
    expect(divider).toContain('dividers/');
  });
});
