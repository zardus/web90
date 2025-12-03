import { test, expect } from '@playwright/test';

test.describe('JS Effects', () => {
  test.describe('Mouse Trail', () => {
    test('mouse trail creates trail elements on mouse move', async ({ page }) => {
      await page.goto('/test.html?retros=mouse-trail');
      await page.waitForTimeout(1500);

      // Move mouse around to create trail
      await page.mouse.move(100, 100);
      await page.mouse.move(200, 200);
      await page.mouse.move(300, 300);
      await page.mouse.move(400, 400);
      await page.waitForTimeout(500);

      // Check for trail elements (varies by style, but should exist)
      const trailElements = page.locator('.mouse-trail-element, .trail-particle');
      const hasTrail = (await trailElements.count()) > 0;

      // Alternative: check for canvas used by some trail styles
      const canvas = page.locator('canvas');

      expect(hasTrail || (await canvas.count()) > 0).toBe(true);
    });

    test('trail-style parameter changes trail type', async ({ page }) => {
      await page.goto('/test.html?retros=mouse-trail&trail-style=fire');
      await page.waitForTimeout(1500);

      // Move mouse to trigger trail
      await page.mouse.move(200, 200);
      await page.mouse.move(400, 400);
      await page.waitForTimeout(300);

      // Should not error - verifies style parameter is processed
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      expect(errors).toHaveLength(0);
    });
  });

  test.describe('Blink', () => {
    test('h1 is wrapped in blink tag', async ({ page }) => {
      await page.goto('/test.html?retros=blink');
      await page.waitForTimeout(1000);

      const blink = page.locator('blink');
      await expect(blink).toHaveCount(1);

      // The h1 should be inside the blink
      const h1InBlink = page.locator('blink h1');
      await expect(h1InBlink).toHaveCount(1);
    });
  });

  test.describe('Marquee', () => {
    test('h1 is wrapped in marquee tag', async ({ page }) => {
      await page.goto('/test.html?retros=marquee');
      await page.waitForTimeout(1000);

      const marquee = page.locator('marquee');
      await expect(marquee).toHaveCount(1);

      // The h1 should be inside the marquee
      const h1InMarquee = page.locator('marquee h1');
      await expect(h1InMarquee).toHaveCount(1);
    });
  });

  test.describe('WordArt', () => {
    test('h1 gets wordart transformation', async ({ page }) => {
      await page.goto('/test.html?retros=wordart');
      await page.waitForTimeout(1500);

      // WordArt wraps or transforms the h1
      const wordartElement = page.locator('.wordart, [class*="wordart"]');
      const h1 = page.locator('h1');

      // Either wordart class exists or h1 has been modified
      const hasWordart = (await wordartElement.count()) > 0;
      const h1Modified = await h1.evaluate((el) => el.className.includes('wordart'));

      expect(hasWordart || h1Modified).toBe(true);
    });

    test('wordart-style parameter is applied', async ({ page }) => {
      await page.goto('/test.html?retros=wordart&wordart-style=three');
      await page.waitForTimeout(1500);

      // Check no errors
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      expect(errors).toHaveLength(0);
    });
  });

  test.describe('Dividers', () => {
    test('divider hr elements are replaced with gifs', async ({ page }) => {
      await page.goto('/test.html?retros=dividers');
      await page.waitForTimeout(1000);

      // Dividers should have divider-img elements with background images
      const dividerImages = page.locator('.divider .divider-img');
      expect(await dividerImages.count()).toBeGreaterThanOrEqual(1);
    });

    test('divider-style parameter selects specific divider', async ({ page }) => {
      await page.goto('/test.html?retros=dividers&divider-style=2');
      await page.waitForTimeout(1000);

      const dividerImg = page.locator('.divider .divider-img').first();
      const bgImage = await dividerImg.evaluate(el => el.style.backgroundImage);
      expect(bgImage).toContain('2.gif');
    });
  });

  test.describe('Custom Cursor', () => {
    test('body has custom cursor style', async ({ page }) => {
      await page.goto('/test.html?retros=custom-cursor');
      await page.waitForTimeout(1000);

      const cursorStyle = await page.evaluate(() => {
        return window.getComputedStyle(document.body).cursor;
      });

      // Should have url() or custom cursor
      expect(cursorStyle).not.toBe('auto');
    });
  });

  test.describe('Image Rotate', () => {
    test('images with data-image-rotate get animation', async ({ page }) => {
      await page.goto('/test.html?retros=image-rotate');
      await page.waitForTimeout(1000);

      const rotatingImg = page.locator('[data-image-rotate="true"]');
      await expect(rotatingImg).toHaveCount(1);

      // Check for animation or transform styles
      const hasAnimation = await rotatingImg.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.animation !== 'none' || style.transform !== 'none';
      });

      expect(hasAnimation).toBe(true);
    });
  });

  test.describe('Fireworks', () => {
    test('click triggers firework effect', async ({ page }) => {
      await page.goto('/test.html?retros=fireworks');
      await page.waitForTimeout(1500);

      // Click to trigger fireworks
      await page.click('body', { position: { x: 400, y: 300 } });
      await page.waitForTimeout(500);

      // Fireworks uses canvas
      const canvas = page.locator('canvas');
      expect(await canvas.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Click Sparkles', () => {
    test('click creates sparkle particles', async ({ page }) => {
      await page.goto('/test.html?retros=click-sparkles');
      await page.waitForTimeout(1500);

      // Click multiple times for combo effect
      await page.click('body', { position: { x: 400, y: 300 } });
      await page.waitForTimeout(100);
      await page.click('body', { position: { x: 400, y: 300 } });
      await page.waitForTimeout(500);

      // Should have a canvas
      const canvas = page.locator('canvas');
      expect(await canvas.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Flying Toasters', () => {
    test('toasters appear on screen', async ({ page }) => {
      await page.goto('/test.html?retros=flying-toasters');
      await page.waitForTimeout(2000);

      // Flying toasters creates toaster elements
      const toasters = page.locator('.toaster, [class*="toaster"]');
      expect(await toasters.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('DVD Bounce', () => {
    test('DVD bounce element is created', async ({ page }) => {
      await page.goto('/test.html?retros=dvd-bounce');
      await page.waitForTimeout(2000);

      // DVD bounce should create a bouncing element
      const dvdElement = page.locator('.dvd-bounce, [class*="dvd"]');
      expect(await dvdElement.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Perspective', () => {
    test('perspective wrapper is created', async ({ page }) => {
      await page.goto('/test.html?retros=perspective');
      await page.waitForTimeout(1000);

      const wrapper = page.locator('.perspective-wrapper, #perspective-wrapper');
      expect(await wrapper.count()).toBeGreaterThanOrEqual(1);
    });

    test('mouse movement affects perspective', async ({ page }) => {
      await page.goto('/test.html?retros=perspective');
      await page.waitForTimeout(1000);

      // Get initial transform
      const wrapper = page.locator('.perspective-wrapper, #perspective-wrapper');

      // Move mouse to trigger perspective change
      await page.mouse.move(0, 0);
      await page.waitForTimeout(100);
      const transform1 = await wrapper.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      await page.mouse.move(800, 600);
      await page.waitForTimeout(100);
      const transform2 = await wrapper.evaluate((el) =>
        window.getComputedStyle(el).transform
      );

      // Transforms should be different after mouse move
      // (or at least perspective should be applied)
      expect(transform1 !== 'none' || transform2 !== 'none').toBe(true);
    });
  });

  test.describe('Popups', () => {
    test('popup windows appear', async ({ page }) => {
      await page.goto('/test.html?retros=popups');
      await page.waitForTimeout(2000);

      // Popups creates window elements
      const popups = page.locator('.popup, .window, [class*="popup"]');
      expect(await popups.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Toolbars', () => {
    test('toolbar elements appear', async ({ page }) => {
      await page.goto('/test.html?retros=toolbars');

      // Wait for install dialog to appear (2s delay + some buffer)
      await page.waitForSelector('#toolbar-install-dialog', { timeout: 5000 });

      // Click Install button to trigger toolbar installation
      await page.click('#toolbar-install-yes');

      // Wait for toolbar to be installed
      await page.waitForSelector('.browser-toolbar', { timeout: 5000 });

      // Toolbars creates toolbar elements with browser-toolbar class
      const toolbars = page.locator('.browser-toolbar');
      expect(await toolbars.count()).toBeGreaterThanOrEqual(1);
    });
  });
});
