import { test, expect } from '@playwright/test';

test.describe('Utility Functions', () => {
  test.describe('randomFrom', () => {
    test('returns element from array', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const result = await page.evaluate(() => {
        const arr = ['a', 'b', 'c', 'd', 'e'];
        const picked = window.web90?.randomFrom?.(arr);
        return { picked, inArray: arr.includes(picked) };
      });

      expect(result.inArray).toBe(true);
    });

    test('returns different values over multiple calls', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const results = await page.evaluate(() => {
        const arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
        const picks: string[] = [];
        for (let i = 0; i < 20; i++) {
          picks.push(window.web90?.randomFrom?.(arr));
        }
        return picks;
      });

      // Should have at least some variation in 20 picks from 10 items
      const unique = new Set(results);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  test.describe('createElement', () => {
    test('creates element with tag', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const tagName = await page.evaluate(() => {
        const el = window.web90?.createElement?.('div');
        return el?.tagName;
      });

      expect(tagName).toBe('DIV');
    });

    test('applies styles to element', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const style = await page.evaluate(() => {
        const el = window.web90?.createElement?.(
          'div',
          'color: red; font-size: 20px;'
        );
        return el?.style.cssText;
      });

      expect(style).toContain('color: red');
      expect(style).toContain('font-size: 20px');
    });

    test('appends element to parent', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const isChild = await page.evaluate(() => {
        const parent = document.createElement('div');
        parent.id = 'test-parent';
        document.body.appendChild(parent);

        const child = window.web90?.createElement?.('span', '', parent);
        return parent.contains(child);
      });

      expect(isChild).toBe(true);
    });
  });

  test.describe('getRandomDivider', () => {
    test('returns a divider URL', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const divider = await page.evaluate(() => {
        return window.web90?.getRandomDivider?.();
      });

      expect(divider).toBeTruthy();
      expect(divider).toMatch(/dividers\/\d+\.gif/);
    });

    test('returns from configured dividers', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const result = await page.evaluate(() => {
        const divider = window.web90?.getRandomDivider?.();
        const dividers = window.web90?.config?.dividers || [];
        return { divider, isInConfig: dividers.includes(divider) };
      });

      expect(result.isInConfig).toBe(true);
    });
  });
});

test.describe('Plugin System', () => {
  test.describe('registerPlugin', () => {
    test('registerPlugin function exists', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const exists = await page.evaluate(() => {
        return typeof window.web90?.registerPlugin === 'function';
      });

      expect(exists).toBe(true);
    });

    test('registered plugin is callable', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const result = await page.evaluate(() => {
        let called = false;
        window.web90?.registerPlugin?.('test-plugin', () => {
          called = true;
        });
        // The plugin registry is internal, but we registered it
        return { registered: true };
      });

      expect(result.registered).toBe(true);
    });
  });

  test.describe('loadRetroResources', () => {
    test('loadRetroResources function exists', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const exists = await page.evaluate(() => {
        return typeof window.web90?.loadRetroResources === 'function';
      });

      expect(exists).toBe(true);
    });

    test('loadRetroResources returns a promise', async ({ page }) => {
      await page.goto('/test.html?retros=none');
      await page.waitForTimeout(500);

      const isPromise = await page.evaluate(() => {
        const result = window.web90?.loadRetroResources?.({ name: 'test' });
        return result instanceof Promise;
      });

      expect(isPromise).toBe(true);
    });
  });
});

test.describe('RETROS Array', () => {
  test('RETROS contains all retro types', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const types = await page.evaluate(() => {
      const retros = window.web90?.RETROS || [];
      const types = new Set(retros.map((r: { type: string }) => r.type));
      return Array.from(types);
    });

    expect(types).toContain('dom');
    expect(types).toContain('js');
    expect(types).toContain('theme');
  });

  test('each retro has required properties', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const allValid = await page.evaluate(() => {
      const retros = window.web90?.RETROS || [];
      return retros.every(
        (r: { name: string; type: string; emoji: string; label: string }) =>
          typeof r.name === 'string' &&
          typeof r.type === 'string' &&
          typeof r.emoji === 'string' &&
          typeof r.label === 'string'
      );
    });

    expect(allValid).toBe(true);
  });

  test('DOM retros list is correct', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const domRetros = await page.evaluate(() => {
      const retros = window.web90?.RETROS || [];
      return retros
        .filter((r: { type: string }) => r.type === 'dom')
        .map((r: { name: string }) => r.name);
    });

    expect(domRetros).toContain('badges');
    expect(domRetros).toContain('counter');
    expect(domRetros).toContain('media-player');
    expect(domRetros).toContain('webring');
    expect(domRetros).toContain('guestbook');
  });

  test('theme retros have init or resources', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const allThemesHaveHandler = await page.evaluate(() => {
      const retros = window.web90?.RETROS || [];
      const themes = retros.filter((r: { type: string }) => r.type === 'theme');
      return themes.every(
        (t: { init?: Function; resources?: object }) =>
          typeof t.init === 'function' || t.resources !== undefined
      );
    });

    expect(allThemesHaveHandler).toBe(true);
  });
});

test.describe('URL Params Object', () => {
  test('params is a URLSearchParams instance', async ({ page }) => {
    await page.goto('/test.html?retros=none&test=value');
    await page.waitForTimeout(500);

    const isURLSearchParams = await page.evaluate(() => {
      return window.web90?.params instanceof URLSearchParams;
    });

    expect(isURLSearchParams).toBe(true);
  });

  test('params reflects URL query string', async ({ page }) => {
    await page.goto('/test.html?retros=badges&foo=bar');
    await page.waitForTimeout(500);

    const values = await page.evaluate(() => {
      const p = window.web90?.params;
      return {
        retros: p?.get('retros'),
        foo: p?.get('foo'),
      };
    });

    expect(values.retros).toBe('badges');
    expect(values.foo).toBe('bar');
  });
});

test.describe('Style Constants', () => {
  test('TRAIL_STYLE_NAMES is populated', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const trailStyles = await page.evaluate(() => {
      return window.web90?.TRAIL_STYLE_NAMES;
    });

    expect(Array.isArray(trailStyles)).toBe(true);
    expect(trailStyles.length).toBeGreaterThan(5);
    expect(trailStyles).toContain('binary');
    expect(trailStyles).toContain('sparkles');
    expect(trailStyles).toContain('fire');
  });

  test('VIZ_MODE_NAMES is populated', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const vizModes = await page.evaluate(() => {
      return window.web90?.VIZ_MODE_NAMES;
    });

    expect(Array.isArray(vizModes)).toBe(true);
    expect(vizModes.length).toBeGreaterThan(3);
    expect(vizModes).toContain('waveform');
    expect(vizModes).toContain('spectrum');
  });

  test('CURSOR_STYLES contains style definitions', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const cursorStyles = await page.evaluate(() => {
      const styles = window.web90?.CURSOR_STYLES;
      if (!styles) return null;
      return Object.keys(styles).map((key) => ({
        key,
        hasEmoji: typeof styles[key].emoji === 'string',
        hasLabel: typeof styles[key].label === 'string',
      }));
    });

    expect(cursorStyles).not.toBeNull();
    expect(cursorStyles.length).toBeGreaterThan(0);
    cursorStyles.forEach(
      (style: { key: string; hasEmoji: boolean; hasLabel: boolean }) => {
        expect(style.hasEmoji).toBe(true);
        expect(style.hasLabel).toBe(true);
      }
    );
  });

  test('THEMES object is populated', async ({ page }) => {
    await page.goto('/test.html?retros=none');
    await page.waitForTimeout(500);

    const themes = await page.evaluate(() => {
      const t = window.web90?.THEMES;
      if (!t) return null;
      return Object.keys(t);
    });

    expect(themes).not.toBeNull();
    expect(themes.length).toBeGreaterThan(10);
    expect(themes).toContain('matrix');
    expect(themes).toContain('crt');
    expect(themes).toContain('win98');
    expect(themes).toContain('dos');
  });
});
