import { test, expect } from '@playwright/test';

test.describe('News Ticker', () => {
  test('ticker element is rendered at bottom of page', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const ticker = page.locator('#news-ticker');
    await expect(ticker).toBeVisible();
    
    // Check it's positioned at the bottom
    const box = await ticker.boundingBox();
    const viewportSize = page.viewportSize();
    expect(box).toBeTruthy();
    if (box && viewportSize) {
      expect(box.y + box.height).toBeCloseTo(viewportSize.height, 5);
    }
  });

  test('ticker has breaking news label', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const label = page.locator('.news-ticker-label');
    await expect(label).toBeVisible();
    await expect(label).toContainText('BREAKING NEWS');
  });

  test('ticker displays news items', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const newsItems = page.locator('.news-item');
    const count = await newsItems.count();
    
    // Should have at least one news item (actually will have many due to duplication)
    expect(count).toBeGreaterThan(0);
    
    // Check that at least one item has content
    const firstItem = newsItems.first();
    const text = await firstItem.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('ticker content is scrolling', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const content = page.locator('.news-ticker-content');
    await expect(content).toBeVisible();
    
    // Check that scrolling class is applied
    await expect(content).toHaveClass(/scrolling/);
    
    // Verify CSS animation is applied
    const animationName = await content.evaluate((el) => 
      window.getComputedStyle(el).animationName
    );
    expect(animationName).toContain('scroll-news');
  });

  test('ticker has separators between items', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const separators = page.locator('.news-separator');
    const count = await separators.count();
    
    // Should have separators
    expect(count).toBeGreaterThan(0);
    
    // Check separator content
    const firstSeparator = separators.first();
    const text = await firstSeparator.textContent();
    expect(text).toContain('•');
  });

  test('ticker CSS is loaded', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const content = page.locator('.news-ticker-content');
    
    // Verify the ticker content has proper styling
    const hasAnimation = await content.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.animationName !== 'none';
    });
    
    expect(hasAnimation).toBe(true);
  });

  test('ticker can accept custom config', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    // Verify that WEB90_CONFIG exists (from test.html)
    const hasConfig = await page.evaluate(() => {
      return typeof (window as any).WEB90_CONFIG === 'object';
    });
    
    expect(hasConfig).toBe(true);
    
    // Verify the ticker is working with some content
    const content = page.locator('.news-ticker-content');
    const text = await content.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  test('ticker displays default news when no config', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const content = page.locator('.news-ticker-content');
    const text = await content.textContent();
    
    // Should contain some default news items
    // Check for common patterns in the default news
    const hasDefaultContent = 
      text!.includes('Y2K') || 
      text!.includes('GeoCities') || 
      text!.includes('Flash') ||
      text!.includes('MIDI') ||
      text!.includes('BREAKING');
    
    expect(hasDefaultContent).toBe(true);
  });

  test('ticker is fixed at bottom with high z-index', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const ticker = page.locator('#news-ticker');
    
    // Check CSS properties
    const position = await ticker.evaluate((el) => 
      window.getComputedStyle(el).position
    );
    expect(position).toBe('fixed');
    
    const bottom = await ticker.evaluate((el) => 
      window.getComputedStyle(el).bottom
    );
    expect(bottom).toBe('0px');
    
    const zIndex = await ticker.evaluate((el) => 
      window.getComputedStyle(el).zIndex
    );
    expect(parseInt(zIndex)).toBeGreaterThan(999);
  });

  test('ticker has proper styling', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    const ticker = page.locator('.news-ticker-container');
    
    // Check background styling
    const background = await ticker.evaluate((el) => 
      window.getComputedStyle(el).background
    );
    expect(background).toBeTruthy();
    
    // Check height
    const height = await ticker.evaluate((el) => 
      window.getComputedStyle(el).height
    );
    expect(parseInt(height)).toBeGreaterThan(0);
  });

  test('ticker works without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(2000);
    
    // Filter out network errors which are expected (external CSS may fail)
    const jsErrors = errors.filter(e => !e.includes('Failed to fetch'));
    expect(jsErrors).toHaveLength(0);
  });

  test('ticker does not interfere with page content', async ({ page }) => {
    await page.goto('/test.html?retros=news-ticker');
    await page.waitForTimeout(1500);

    // Check that main page content is still visible
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    // Check that ticker doesn't cover main content
    const ticker = page.locator('#news-ticker');
    const tickerBox = await ticker.boundingBox();
    const headingBox = await heading.boundingBox();
    
    expect(tickerBox).toBeTruthy();
    expect(headingBox).toBeTruthy();
    
    if (tickerBox && headingBox) {
      // Ticker should be below the heading
      expect(tickerBox.y).toBeGreaterThan(headingBox.y + headingBox.height);
    }
  });
});
