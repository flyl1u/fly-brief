/* Optional browser acceptance check. Requires Playwright and a local Chromium browser.
   NODE_PATH may point at the host's bundled node_modules; no npm install is needed.
   node tests/check_browser.cjs [--browser-channel msedge] [--out .qa/browser]
*/
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const out = path.resolve(option('--out', '.qa/browser'));
const report = pathToFileURL(path.resolve('examples/report.html')).href;
const channel = option('--browser-channel', undefined);

async function main() {
  await fs.mkdir(out, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(channel ? { channel } : {}) });
  const checks = [];
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    let remoteRequests = 0;
    page.on('request', request => { if (/^https?:/.test(request.url())) remoteRequests++; });
    await page.goto(report);
    assert.equal(await page.locator('.panel').count(), 4);
    assert.equal(await page.locator('details[open]').count(), 0);
    assert.equal(await page.locator('.references a').isVisible(), true);
    assert.equal(remoteRequests, 0, 'A local report must not fetch remote resources');
    checks.push('Local file opens with four collapsed sections and a visible reference, without network requests');

    await page.locator('#details-product summary').click();
    assert.equal(await page.locator('details[open]').count(), 1);
    assert.equal(await page.locator('#details-product .detail-body').isVisible(), true);
    assert.equal(await page.locator('.summary:visible').count(), 4);
    await page.locator('#details-product summary').press('Enter');
    assert.equal(await page.locator('details[open]').count(), 0);
    checks.push('An individual branch opens and closes with mouse and keyboard; other summaries stay visible');

    await page.locator('#toggle-all').click();
    assert.equal(await page.locator('details[open]').count(), 4);
    await page.locator('#toggle-all').click();
    assert.equal(await page.locator('details[open]').count(), 0);
    checks.push('Expand all and collapse all update every section');

    await page.locator('#product .summary .source-button').click();
    assert.equal(await page.locator('dialog').isVisible(), true);
    assert.match(await page.locator('dialog blockquote').innerText(), /推荐片段和字幕仍需人工检查/);
    assert.match(await page.locator('dialog .location').innerText(), /第 1 节/);
    assert.match(await page.locator('dialog .original').getAttribute('href'), /^file:.*brief\.md$/);
    await page.screenshot({ path: path.join(out, 'source-dialog.png') });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').isVisible(), false);
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('source-button')), true);
    checks.push('Source dialog shows the actual excerpt and location; Escape closes it and restores focus');

    await page.locator('#copy-summary').click();
    await page.locator('#feedback').filter({ hasText: '已复制' }).waitFor();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    assert.match(clipboard, /\[品牌要求\].*真人出镜/);
    assert.match(clipboard, /必拍：导入、推荐片段、人工校对字幕、导出/);
    assert.match(clipboard, /我可以怎么做这条视频/);
    checks.push('Clipboard copy includes all four conclusions, critical requirements and source labels');

    // Confirm the preserved link actually opens, with no request sent to its external host.
    const suppliedReference = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    await context.route(suppliedReference, route => route.fulfill({ contentType: 'text/plain', body: 'Reference navigation verified by a local test response.' }));
    const popupEvent = page.waitForEvent('popup');
    await page.locator('.references a').click();
    const popup = await popupEvent;
    await popup.waitForLoadState();
    assert.equal(popup.url(), suppliedReference);
    await popup.close();
    checks.push('Reference opens its preserved URL in a new tab; external request is intercepted by the test');

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: path.join(out, `mobile-${width}.png`), fullPage: true });
      await page.locator('#toggle-all').click();
      assert.equal(await page.locator('details[open]').count(), 4);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      await page.screenshot({ path: path.join(out, `mobile-${width}-expanded.png`), fullPage: true });
    }
    checks.push('320 px and 390 px widths have no horizontal overflow, both collapsed and expanded');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.disclosure-arrow').first().evaluate(node => getComputedStyle(node).transitionDuration), '0s');
    checks.push('Reduced-motion mode disables transition effects');

    const fallbackContext = await browser.newContext();
    await fallbackContext.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: () => Promise.reject(new Error('Denied for fallback testing')),
      } });
    });
    const fallback = await fallbackContext.newPage();
    fallback.on('pageerror', error => errors.push(error.message));
    await fallback.goto(report);
    await fallback.locator('#copy-summary').click();
    await fallback.locator('.copy-fallback').waitFor();
    assert.equal(await fallback.locator('.copy-fallback').getAttribute('readonly'), '');
    assert.match(await fallback.locator('.copy-fallback').inputValue(), /我可以怎么做这条视频/);
    checks.push('Denied clipboard access offers selectable text for manual copying');

    const rawHtml = await fs.readFile(path.resolve('examples/report.html'), 'utf8');
    const sparse = { schema_version: 1, title: '信息未齐的合作', sources: [], sections: {} };
    for (const key of ['product', 'promotion', 'requirements', 'video']) {
      sparse.sections[key] = { summary: { text: '未提供，需确认。', kind: 'unknown' } };
    }
    const sparseFile = path.join(out, 'sparse.html');
    await fs.writeFile(sparseFile, rawHtml.replace(/(<script id="report-data" type="application\/json">)[\s\S]*?(<\/script>)/, (_, open, close) => open + JSON.stringify(sparse) + close));
    await fallback.goto(pathToFileURL(sparseFile).href);
    assert.equal(await fallback.locator('.panel').count(), 4);
    assert.equal(await fallback.locator('#toggle-all').isVisible(), false);
    assert.equal(await fallback.locator('.references').count(), 0);
    checks.push('Sparse report keeps four questions and omits unavailable detail and reference controls');

    assert.deepEqual(errors, []);
    checks.push('No uncaught browser errors');
    await fs.writeFile(path.join(out, 'results.json'), JSON.stringify({ passed: checks.length, checks, errors }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally {
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
