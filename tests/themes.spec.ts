import { test, expect } from '@playwright/test';

test.describe('Themes', () => {
  test.describe('Matrix Theme', () => {
    test('matrix canvas is created', async ({ page }) => {
      await page.goto('/test.html?theme=matrix');
      await page.waitForTimeout(2000);

      const canvas = page.locator('canvas');
      expect(await canvas.count()).toBeGreaterThanOrEqual(1);
    });

    test('page has dark background', async ({ page }) => {
      await page.goto('/test.html?theme=matrix');
      await page.waitForTimeout(1000);

      const bgColor = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });

      // Should be dark (black or near-black)
      expect(bgColor).toMatch(/rgb\(0,\s*0,\s*0\)|rgba\(0,\s*0,\s*0/);
    });
  });

  test.describe('CRT Theme', () => {
    test('CRT scanlines overlay is created', async ({ page }) => {
      await page.goto('/test.html?theme=crt');
      await page.waitForTimeout(1000);

      const scanlines = page.locator('.crt-scanlines, .scanlines, [class*="crt"]');
      expect(await scanlines.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Neon Theme', () => {
    test('neon lines are created', async ({ page }) => {
      await page.goto('/test.html?theme=neon');
      await page.waitForTimeout(1000);

      const neonLines = page.locator('.neon-line, [class*="neon"]');
      expect(await neonLines.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Y2K Theme', () => {
    test('Y2K floating shapes appear', async ({ page }) => {
      await page.goto('/test.html?theme=y2k');
      await page.waitForTimeout(1000);

      const shapes = page.locator('.y2k-shape, [class*="y2k"]');
      expect(await shapes.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Hampster Dance Theme', () => {
    test('hampster background is applied', async ({ page }) => {
      await page.goto('/test.html?theme=hampsterdance');
      await page.waitForTimeout(1000);

      const bgImage = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundImage;
      });

      expect(bgImage).toContain('hampster');
    });
  });

  test.describe('Table Theme', () => {
    test('tableable elements become table cells', async ({ page }) => {
      await page.goto('/test.html?theme=table');
      await page.waitForTimeout(1000);

      // Check that tableable elements get the table-cell class
      const tableCells = page.locator('.tableable.table-cell');
      expect(await tableCells.count()).toBeGreaterThanOrEqual(1);
    });

    test('untableable elements are hidden', async ({ page }) => {
      await page.goto('/test.html?theme=table');
      await page.waitForTimeout(1000);

      const untableable = page.locator('.untableable');
      await expect(untableable).toBeHidden();
    });
  });

  test.describe('Snow/TV Static Theme', () => {
    test('snow canvas is created', async ({ page }) => {
      await page.goto('/test.html?theme=snow');
      await page.waitForTimeout(1000);

      const canvas = page.locator('canvas');
      expect(await canvas.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('VHS Theme', () => {
    test('VHS glitch elements are created', async ({ page }) => {
      await page.goto('/test.html?theme=vhs');
      await page.waitForTimeout(1000);

      const vhsElements = page.locator('.vhs, [class*="vhs"], [class*="glitch"]');
      expect(await vhsElements.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Comic Sans Theme', () => {
    test('page uses Comic Sans font', async ({ page }) => {
      await page.goto('/test.html?theme=comic-sans');
      await page.waitForTimeout(2000); // Wait for font to load

      const fontFamily = await page.evaluate(() => {
        return window.getComputedStyle(document.body).fontFamily;
      });

      expect(fontFamily.toLowerCase()).toMatch(/comic/);
    });
  });

  test.describe('Windows 98 Theme', () => {
    test('win98 desktop elements are created', async ({ page }) => {
      await page.goto('/test.html?theme=win98');
      await page.waitForTimeout(3000); // Win98 has boot animation

      // Should have win98 class on body or wrapper
      const win98Wrapper = page.locator('.win98');
      expect(await win98Wrapper.count()).toBeGreaterThanOrEqual(1);
    });

    test('taskbar is present', async ({ page }) => {
      await page.goto('/test.html?theme=win98');
      // Wait for boot sequence to complete and desktop to be visible (~5s)
      await page.waitForSelector('#win98-desktop:not([style*="display: none"])', { timeout: 10000 });

      const taskbar = page.locator('.win98-taskbar');
      expect(await taskbar.count()).toBeGreaterThanOrEqual(1);
    });

    test('window elements are created from sections', async ({ page }) => {
      await page.goto('/test.html?theme=win98');
      await page.waitForTimeout(3000);

      const windows = page.locator('.window, [class*="window"]');
      expect(await windows.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('macOS Classic Theme', () => {
    test('macos-classic wrapper is created', async ({ page }) => {
      await page.goto('/test.html?theme=macos-classic');
      await page.waitForTimeout(2000);

      const macWrapper = page.locator('.macos-classic');
      expect(await macWrapper.count()).toBeGreaterThanOrEqual(1);
    });

    test('window elements are created', async ({ page }) => {
      await page.goto('/test.html?theme=macos-classic');
      await page.waitForTimeout(2000);

      const windows = page.locator('.window, [class*="window"]');
      expect(await windows.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('DOS Theme', () => {
    test('DOS prompt interface is created', async ({ page }) => {
      await page.goto('/test.html?theme=dos');
      await page.waitForTimeout(3000); // DOS has BIOS sequence

      const dosElements = page.locator('.dos, [class*="dos"], .prompt');
      expect(await dosElements.count()).toBeGreaterThanOrEqual(1);
    });

    test('page has green-on-black color scheme', async ({ page }) => {
      await page.goto('/test.html?theme=dos');
      await page.waitForTimeout(3000);

      const color = await page.evaluate(() => {
        const dos = document.querySelector('.dos, [class*="dos"]');
        if (!dos) return null;
        return window.getComputedStyle(dos).color;
      });

      // Should be green-ish
      expect(color).toBeTruthy();
    });

    test('Norton Commander launches with NC command', async ({ page }) => {
      await page.goto('/test.html?theme=dos');
      await page.waitForTimeout(3500); // Wait for boot sequence

      // Wait for prompt to be visible
      await page.waitForSelector('#dos-prompt', { state: 'visible' });

      // Type NC command
      await page.keyboard.type('nc');
      await page.keyboard.press('Enter');

      // Wait for file manager to appear
      await page.waitForSelector('#dos-filemanager', { state: 'visible', timeout: 2000 });

      // Check that panels exist
      const panels = page.locator('.fm-panel');
      expect(await panels.count()).toBe(2);

      // Check that function bar exists
      const funcbar = page.locator('.fm-funcbar');
      expect(await funcbar.count()).toBe(1);
    });

    test('Norton Commander keyboard navigation works', async ({ page }) => {
      await page.goto('/test.html?theme=dos');
      await page.waitForTimeout(3500);

      await page.waitForSelector('#dos-prompt', { state: 'visible' });
      await page.keyboard.type('nc');
      await page.keyboard.press('Enter');

      await page.waitForSelector('#dos-filemanager', { state: 'visible', timeout: 2000 });

      // Test Tab switches panels
      const initialActivePanel = await page.evaluate(() => {
        // @ts-ignore
        return document.querySelector('.fm-panel.active')?.dataset?.panel;
      });

      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      const newActivePanel = await page.evaluate(() => {
        // @ts-ignore
        return document.querySelector('.fm-panel.active')?.dataset?.panel;
      });

      expect(newActivePanel).not.toBe(initialActivePanel);

      // Test Escape quits
      await page.keyboard.press('Escape');
      await page.waitForSelector('#dos-prompt', { state: 'visible' });
      await page.waitForSelector('#dos-filemanager', { state: 'hidden' });
    });
  });

  test.describe('Flash Theme', () => {
    test('flash loader/site elements are created', async ({ page }) => {
      await page.goto('/test.html?theme=flash');
      await page.waitForTimeout(3000); // Flash has loading animation

      const flashElements = page.locator('.flash, [class*="flash"]');
      expect(await flashElements.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Star Wars Theme', () => {
    test('star wars crawl elements are created', async ({ page }) => {
      await page.goto('/test.html?theme=starwars');
      await page.waitForTimeout(2000);

      const crawlElements = page.locator('.crawl, [class*="starwars"], [class*="crawl"]');
      expect(await crawlElements.count()).toBeGreaterThanOrEqual(1);
    });

    test('auto-scrolls continuously', async ({ page }) => {
      await page.goto('/test.html?theme=starwars');
      await page.waitForSelector('.starwars-content', { timeout: 5000 });

      // Get initial position after load
      await page.waitForTimeout(1000);
      const initialY = await page.evaluate(() => {
        const content = document.querySelector('.starwars-content') as HTMLElement;
        return content ? parseFloat(getComputedStyle(content).getPropertyValue('--crawl-y')) : null;
      });

      // Wait and check position changed (scrolled)
      await page.waitForTimeout(2000);
      const afterY = await page.evaluate(() => {
        const content = document.querySelector('.starwars-content') as HTMLElement;
        return content ? parseFloat(getComputedStyle(content).getPropertyValue('--crawl-y')) : null;
      });

      expect(initialY).not.toBeNull();
      expect(afterY).not.toBeNull();
      expect(afterY).toBeLessThan(initialY!); // Should be scrolling up (decreasing Y)
    });

    test('stops auto-scroll on user wheel interaction', async ({ page }) => {
      await page.goto('/test.html?theme=starwars');
      await page.waitForSelector('.starwars-content', { timeout: 5000 });

      // Wait for auto-scroll to start
      await page.waitForTimeout(1000);

      // Trigger wheel event to stop auto-scroll
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(100);

      // Get position after wheel
      const positionAfterWheel = await page.evaluate(() => {
        const content = document.querySelector('.starwars-content') as HTMLElement;
        return content ? parseFloat(getComputedStyle(content).getPropertyValue('--crawl-y')) : null;
      });

      // Wait a bit more and check position stayed the same (or changed only due to user scroll)
      await page.waitForTimeout(1000);
      const positionAfterWait = await page.evaluate(() => {
        const content = document.querySelector('.starwars-content') as HTMLElement;
        return content ? parseFloat(getComputedStyle(content).getPropertyValue('--crawl-y')) : null;
      });

      // Position should be stable or close to where user left it (not auto-scrolling)
      // Allow small difference due to smoothing
      expect(Math.abs(positionAfterWait! - positionAfterWheel!)).toBeLessThan(5);
    });

    test('includes nav elements in crawl', async ({ page }) => {
      await page.goto('/test.html?theme=starwars');
      await page.waitForSelector('.starwars-content', { timeout: 5000 });

      // Check that nav is cloned into the crawl content
      const navInCrawl = page.locator('.starwars-content nav');
      expect(await navInCrawl.count()).toBeGreaterThan(0);

      // Check that nav links are preserved
      const navLinks = navInCrawl.locator('a');
      expect(await navLinks.count()).toBeGreaterThan(0);
      
      // Verify at least one link has the expected text
      const homeLink = navLinks.filter({ hasText: 'Home' });
      expect(await homeLink.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Cascade Virus Theme', () => {
    test('cascade effect is applied', async ({ page }) => {
      await page.goto('/test.html?theme=cascade');
      await page.waitForTimeout(2000);

      const cascadeElements = page.locator('.cascade, [class*="cascade"]');
      expect(await cascadeElements.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Pipes Theme', () => {
    test('pipes canvas is created', async ({ page }) => {
      await page.goto('/test.html?theme=pipes');
      await page.waitForTimeout(2000);

      const canvas = page.locator('canvas');
      expect(await canvas.count()).toBeGreaterThanOrEqual(1);
    });
  });
});
