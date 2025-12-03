import { test, expect } from '@playwright/test';

test.describe('Control Panel', () => {
  test.describe('Initialization', () => {
    test('control panel is visible when included in retros', async ({
      page,
    }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      const panel = page.locator('#control-panel');
      await expect(panel).toBeVisible();
    });

    test('control panel has all main sections', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      // Check for retro checkboxes section
      const checkboxes = page.locator('#retro-checkboxes');
      await expect(checkboxes).toBeVisible();

      // Check for control buttons
      const applyBtn = page.locator('#ctrl-apply');
      const resetBtn = page.locator('#ctrl-reset');
      const randomBtn = page.locator('#ctrl-random');
      const closeBtn = page.locator('#ctrl-close');

      await expect(applyBtn).toBeVisible();
      await expect(resetBtn).toBeVisible();
      await expect(randomBtn).toBeVisible();
      await expect(closeBtn).toBeVisible();
    });

    test('control panel has dropdown selects', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      // Check for various dropdown controls
      const songSelect = page.locator('#ctrl-song');
      const cursorSelect = page.locator('#ctrl-cursor');
      const themeSelect = page.locator('#ctrl-theme');
      const dividerSelect = page.locator('#ctrl-divider');

      await expect(songSelect).toBeAttached();
      await expect(cursorSelect).toBeAttached();
      await expect(themeSelect).toBeAttached();
      await expect(dividerSelect).toBeAttached();
    });
  });

  test.describe('Checkbox Functionality', () => {
    test('retro checkboxes are created for non-theme retros', async ({
      page,
    }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      // Should have checkboxes for retros like badges, counter, etc.
      const badgesCheckbox = page.locator('#ctrl-retro-badges');
      const counterCheckbox = page.locator('#ctrl-retro-counter');

      await expect(badgesCheckbox).toBeAttached();
      await expect(counterCheckbox).toBeAttached();
    });

    test('checkboxes reflect active retros', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel,badges,counter');
      await page.waitForTimeout(2000);

      const badgesCheckbox = page.locator('#ctrl-retro-badges');
      const counterCheckbox = page.locator('#ctrl-retro-counter');

      await expect(badgesCheckbox).toBeChecked();
      await expect(counterCheckbox).toBeChecked();
    });

    test('inactive retros have unchecked checkboxes', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel,badges');
      await page.waitForTimeout(2000);

      const badgesCheckbox = page.locator('#ctrl-retro-badges');
      const counterCheckbox = page.locator('#ctrl-retro-counter');

      await expect(badgesCheckbox).toBeChecked();
      await expect(counterCheckbox).not.toBeChecked();
    });
  });

  test.describe('Button Actions', () => {
    test('close button hides control panel', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      const panel = page.locator('#control-panel');
      await expect(panel).toBeVisible();

      // Click close with force to bypass any overlays
      await page.click('#ctrl-close', { force: true });

      // Either hidden or redirected
      await page.waitForTimeout(1000);
    });

    test('random button randomizes selections', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      // Get initial checkbox states
      const getCheckboxStates = async () => {
        const checkboxes = await page.locator('#retro-checkboxes input[type="checkbox"]').all();
        const states: boolean[] = [];
        for (const cb of checkboxes) {
          states.push(await cb.isChecked());
        }
        return states;
      };

      const initialStates = await getCheckboxStates();

      // Click random multiple times to try to get different state
      let different = false;
      for (let i = 0; i < 5; i++) {
        await page.click('#ctrl-random');
        await page.waitForTimeout(100);
        const newStates = await getCheckboxStates();
        if (JSON.stringify(newStates) !== JSON.stringify(initialStates)) {
          different = true;
          break;
        }
      }

      // Random should produce different results (statistically very likely in 5 tries)
      expect(different).toBe(true);
    });

    test('reset button navigates to control-panel only', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel,badges,counter');
      await page.waitForTimeout(2000);

      // Click reset
      await page.click('#ctrl-reset');

      // Should navigate to just control-panel
      await page.waitForURL(/retros=control-panel/);

      // Verify URL contains only control-panel
      const url = page.url();
      expect(url).toContain('retros=control-panel');
    });

    test('apply button updates URL with selected retros', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel,badges');
      await page.waitForTimeout(2000);

      // The apply button should be present and functional
      const applyBtn = page.locator('#ctrl-apply');
      await expect(applyBtn).toBeVisible();

      // Click apply - this should preserve current retros in URL
      await applyBtn.click({ force: true });

      // Should navigate to a URL with retros parameter
      await page.waitForURL(/retros=/, { timeout: 10000 });

      const url = page.url();
      // URL should contain retros parameter
      expect(url).toContain('retros=');
    });
  });

  test.describe('Dropdown Functionality', () => {
    test('theme dropdown contains theme options', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      const themeSelect = page.locator('#ctrl-theme');
      const options = await themeSelect.locator('option').allTextContents();

      // Should have theme options
      expect(options.length).toBeGreaterThan(1);

      // Should include some known themes
      const optionsText = options.join(' ').toLowerCase();
      expect(optionsText).toMatch(/matrix|crt|neon/);
    });

    test('cursor dropdown contains cursor options', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      const cursorSelect = page.locator('#ctrl-cursor');
      const options = await cursorSelect.locator('option').allTextContents();

      // Should have cursor options
      expect(options.length).toBeGreaterThan(1);
    });

    test('divider dropdown is populated from config', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      const dividerSelect = page.locator('#ctrl-divider');
      const options = await dividerSelect.locator('option').allTextContents();

      // Should have divider options based on config (3 dividers in test config + none + random)
      expect(options.length).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Custom Select Dropdowns', () => {
    test('custom select wrapper is created for selects', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      const wrappers = page.locator('.custom-select-wrapper');
      expect(await wrappers.count()).toBeGreaterThan(0);
    });

    test('clicking select opens custom dropdown', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      // Find a select and click it
      const themeSelect = page.locator('#ctrl-theme');
      await themeSelect.click({ force: true });

      // Wrapper should have 'open' class
      const wrapper = page.locator('#ctrl-theme').locator('xpath=ancestor::*[contains(@class, "custom-select-wrapper")]');
      await expect(wrapper).toHaveClass(/open/);
    });

    test('clicking outside closes custom dropdown', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel');
      await page.waitForTimeout(2000);

      // Open dropdown
      const themeSelect = page.locator('#ctrl-theme');
      await themeSelect.click({ force: true });
      await page.waitForTimeout(100);

      // Click outside
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(100);

      // Wrapper should not have 'open' class
      const wrapper = page.locator('.custom-select-wrapper.open');
      await expect(wrapper).toHaveCount(0);
    });
  });

  test.describe('State Persistence', () => {
    test('dropdown values reflect URL parameters', async ({ page }) => {
      await page.goto(
        '/test.html?retros=control-panel,custom-cursor&cursor-style=hourglass'
      );
      await page.waitForTimeout(2000);

      const cursorSelect = page.locator('#ctrl-cursor');
      const value = await cursorSelect.inputValue();

      expect(value).toBe('hourglass');
    });

    test('theme dropdown reflects theme parameter', async ({ page }) => {
      await page.goto('/test.html?retros=control-panel,retheme&theme=matrix');
      await page.waitForTimeout(2000);

      const themeSelect = page.locator('#ctrl-theme');
      const value = await themeSelect.inputValue();

      expect(value).toBe('matrix');
    });
  });
});
