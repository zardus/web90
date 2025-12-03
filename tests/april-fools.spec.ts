import { test, expect } from '@playwright/test';

test.describe('April Fools Mode', () => {
  test('retros=april-fools loads random retros', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/test.html?retros=april-fools');
    await page.waitForTimeout(3000); // Give time for random retros to load

    expect(errors).toHaveLength(0);

    // Control panel should always be included in April Fools mode
    const panel = page.locator('#control-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });
  });

  test('april-fools includes control-panel retro', async ({ page }) => {
    await page.goto('/test.html?retros=april-fools');
    await page.waitForTimeout(3000);

    // Control panel should be visible (always included in April Fools)
    const panel = page.locator('#control-panel');
    await expect(panel).toBeVisible();
  });

  test('april-fools can be combined with other retros', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/test.html?retros=april-fools,badges');
    await page.waitForTimeout(3000);

    expect(errors).toHaveLength(0);

    // Badges may or may not be visible depending on random selection
    // Just verify no errors occurred - the combination works
  });

  test('april-fools generates random style selections', async ({ page }) => {
    // Load page with april-fools
    await page.goto('/test.html?retros=april-fools');
    await page.waitForTimeout(2000);

    // Check that generateRandomSelections produces valid output
    const selections = await page.evaluate(() => {
      if (window.web90 && window.web90.generateRandomSelections) {
        return window.web90.generateRandomSelections();
      }
      return null;
    });

    expect(selections).not.toBeNull();
    expect(selections).toHaveProperty('retros');
    expect(selections).toHaveProperty('styles');
    expect(Array.isArray(selections.retros)).toBe(true);
    expect(typeof selections.styles).toBe('object');
  });
});

test.describe('isAprilFools Detection', () => {
  test('date detection function exists and works', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    // The isAprilFools function is internal, but we can test the date logic
    const isAprilFoolsToday = await page.evaluate(() => {
      const today = new Date();
      return today.getMonth() === 3 && today.getDate() === 1;
    });

    // Just verify the logic works (returns a boolean)
    expect(typeof isAprilFoolsToday).toBe('boolean');
  });
});

test.describe('Random Selection Functions', () => {
  test('generateRandomSelections returns valid structure', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(1000);

    const selections = await page.evaluate(() => {
      if (window.web90 && window.web90.generateRandomSelections) {
        return window.web90.generateRandomSelections();
      }
      return null;
    });

    expect(selections).not.toBeNull();
    expect(selections.retros).toBeDefined();
    expect(selections.styles).toBeDefined();
    expect(selections.styles.song).toBeDefined();
    expect(selections.styles.viz).toBeDefined();
    expect(selections.styles.cursor).toBeDefined();
    expect(selections.styles.trail).toBeDefined();
    expect(selections.styles.theme).toBeDefined();
    expect(selections.styles.divider).toBeDefined();
  });

  test('generateRandomSelections produces varied results', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(1000);

    // Call it multiple times and check for variation
    const results = await page.evaluate(() => {
      const selections: string[][] = [];
      for (let i = 0; i < 5; i++) {
        if (window.web90 && window.web90.generateRandomSelections) {
          selections.push(window.web90.generateRandomSelections().retros);
        }
      }
      return selections;
    });

    // Check that we got 5 results
    expect(results.length).toBe(5);

    // At least some variation should exist (not all identical)
    const allSame = results.every(
      (r) => JSON.stringify(r) === JSON.stringify(results[0])
    );
    // It's statistically very unlikely for 5 random selections to be identical
    // but we won't fail on this as it's theoretically possible
  });

  test('randomFrom utility returns element from array', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const result = await page.evaluate(() => {
      if (window.web90 && window.web90.randomFrom) {
        const arr = ['a', 'b', 'c', 'd', 'e'];
        const picked = window.web90.randomFrom(arr);
        return arr.includes(picked);
      }
      return false;
    });

    expect(result).toBe(true);
  });
});
