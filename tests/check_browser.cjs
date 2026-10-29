/* Optional acceptance checks. Use the host's bundled Playwright via NODE_PATH.
   node tests/check_browser.cjs --browser-channel msedge [--out .qa/document-browser]
   Or pass --browser-executable with the installed browser's absolute path.
*/
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const out = path.resolve(option('--out', '.qa/document-browser'));
const channel = option('--browser-channel', undefined);
const executablePath = option('--browser-executable', undefined);
const reportPath = path.resolve('examples/report.html');

async function main() {
  await fs.mkdir(out, { recursive: true });
  const pages = new Map([['/report.html', await fs.readFile(reportPath, 'utf8')]]);
  const server = http.createServer((request, response) => {
    const document = pages.get(new URL(request.url, 'http://localhost').pathname);
    response.writeHead(document ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(document || 'Not found');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const report = `${origin}/report.html`;
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : channel ? { channel } : {}) });
  const checks = [], errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    let remoteRequests = 0;
    page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith(origin + '/')) remoteRequests++; });
    await page.goto(report);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.row').count(), 4);
    assert.equal(await page.locator('details[open]').count(), 0);
    assert.equal(await page.locator('.references a').isVisible(), true);
    assert.equal(remoteRequests, 0);
    assert.equal(await page.evaluate(() => document.fonts.check('16px "Fly Sans"', '合作拍摄')), true);
    checks.push('Self-contained report loads with four collapsed questions, reference entry, embedded Chinese fonts and no remote load requests');

    const projectUrl = 'https://github.com/flyl1u/fly-brief';
    const icon = await page.locator('link[rel="icon"]').getAttribute('href');
    assert.match(icon, /^data:image\/svg\+xml;base64,/);
    assert.equal(await page.locator('.brand-icon').getAttribute('src'), icon);
    assert.equal(await page.locator('.brand-icon').evaluate(node => node.complete && node.naturalWidth > 0), true);
    const headerRules = await page.locator('.brand-header, .page-header').evaluateAll(nodes => nodes.map(node => {
      const style = getComputedStyle(node);
      return { width: style.borderBottomWidth, color: style.borderBottomColor };
    }));
    assert.equal(headerRules.filter(rule => rule.width !== '0px').length, 1);
    assert.equal(headerRules.length, 1);
    assert.equal(headerRules[0].color, 'rgb(230, 230, 230)');
    assert.equal(await page.locator('.page-header').count(), 0);
    await context.route(projectUrl, route => route.fulfill({ contentType: 'text/plain', body: 'Local intercepted project navigation check.' }));
    for (const selector of ['.brand-link', '.star-link']) {
      const link = page.locator(selector);
      assert.equal(await link.getAttribute('href'), projectUrl);
      const opened = page.waitForEvent('popup');
      await link.click();
      const project = await opened;
      await project.waitForLoadState();
      assert.equal(project.url(), projectUrl);
      await project.close();
    }
    await page.locator('.star-link').hover();
    await page.locator('.star-icon').evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));
    assert.notEqual(await page.locator('.star-icon').evaluate(node => getComputedStyle(node).fill), 'rgba(0, 0, 0, 0)');
    await page.mouse.move(0, 0);
    await page.locator('.star-link').blur();
    await page.locator('.star-icon').evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));
    checks.push('Embedded favicon and masthead icon work offline; both project links navigate correctly; Star hover fills; questions follow the masthead directly without a cooperation title row');

    const videoTop = await page.locator('#video').evaluate(node => node.getBoundingClientRect().top);
    assert.ok(videoTop < 900, `Desktop overview must reach the fourth question; it starts at ${videoTop}`);
    const visibleOverview = await page.locator('#overview').innerText();
    assert.doesNotMatch(visibleOverview, /品牌信息|品牌要求|先看结论|点击「依据」/);
    assert.match(visibleOverview, /人工校对字幕/);
    assert.match(visibleOverview, /不露竞品/);
    assert.match(visibleOverview, /10\.28 18:00/);
    assert.doesNotMatch(visibleOverview, /2026 年 · 北京时间|未查看/);
    assert.equal(await page.locator('.schedule-zone, .ref-status').count(), 0);
    assert.equal(await page.locator('.schedule-item').count(), 2);
    assert.equal(await page.locator('time').first().getAttribute('datetime'), '2026-10-28T18:00:00+08:00');
    checks.push('Four questions remain visible; deadlines and mandatory shots stand out without a separate year/timezone line or unviewed badge');

    const weights = await page.locator('.summary').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).fontWeight));
    assert.equal(new Set(weights).size, 1);
    assert.equal(weights[0], '400');
    const summarySizes = await page.locator('.summary').evaluateAll(nodes => nodes.map(node => parseFloat(getComputedStyle(node).fontSize)));
    assert.ok(summarySizes[1] > summarySizes[0]);
    checks.push('Summaries retain regular weight while promotion uses a larger size');

    await page.screenshot({ path: path.join(out, 'desktop-overview.png'), fullPage: true });

    await page.locator('#details-product summary').click();
    assert.equal(await page.locator('details[open]').count(), 1);
    await page.locator('#details-product summary[aria-label^="收起"]').waitFor();
    assert.equal(await page.locator('#details-product .detail-body').isVisible(), true);
    assert.equal(await page.locator('.summary:visible').count(), 4);
    const capabilities = page.locator('#product .branch').first();
    assert.equal(await capabilities.locator('.field').count(), 4);
    assert.deepEqual(await capabilities.locator('dt').allTextContents(), ['导入什么', '工具处理', '你来决定', '最后得到']);
    const itemBoxes = await capabilities.locator('.field').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().toJSON()));
    assert.ok(itemBoxes.every((box, index) => index === 0 || box.top >= itemBoxes[index - 1].bottom));
    assert.equal(await capabilities.locator('.inline-source').allTextContents().then(texts => texts.every(text => text === '原文')), true);
    await page.screenshot({ path: path.join(out, 'desktop-product-expanded.png'), fullPage: true });
    checks.push('Product explanation separates input, processing, human judgment and output, with sourced fields');
    await page.locator('#details-product summary').press('Enter');
    assert.equal(await page.locator('details[open]').count(), 0);
    checks.push('Plus disclosure works by mouse and keyboard, changes its accessible action and preserves all conclusions');

    await page.locator('#details-product summary').click();
    await page.locator('#details-promotion summary').click();
    assert.equal(await page.locator('details[open]').count(), 2);
    await page.locator('#details-promotion summary').click();
    assert.equal(await page.locator('#details-product').getAttribute('open'), '');
    await page.locator('#details-product summary').click();
    checks.push('Each row expands independently; closing one preserves another row’s open state');

    await page.locator('#open-sources').click();
    assert.equal(await page.locator('dialog').isVisible(), true);
    assert.equal(await page.getByRole('dialog', { name: '来源摘录' }).count(), 1);
    assert.equal(await page.locator('dialog .dialog-header h2').count(), 0);
    assert.equal(await page.locator('dialog .evidence').count(), 6);
    await page.locator('#evidence-dialog').evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));
    await page.screenshot({ path: path.join(out, 'all-sources.png') });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog').isVisible(), false);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'open-sources');
    checks.push('One header source entry opens all passages; Escape closes the dialog and restores focus');

    await page.locator('#details-product summary').click();
    const citation = page.locator('#product .branch .source-button').first();
    await citation.click();
    assert.equal(await page.locator('dialog .evidence').count(), 1);
    assert.match(await page.locator('dialog blockquote').innerText(), /推荐片段和字幕仍需人工检查/);
    assert.match(await page.locator('dialog .location').innerText(), /第 1 节/);
    assert.match(await page.locator('dialog .original').getAttribute('href'), /^file:.*brief\.md$/);
    await page.locator('#evidence-dialog').evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));
    await page.screenshot({ path: path.join(out, 'source-dialog.png') });
    await page.locator('#close-dialog').click();
    assert.equal(await citation.evaluate(node => node === document.activeElement), true);
    await page.locator('#details-product summary').click();
    checks.push('Expanded detail cites the exact source excerpt, location and original file; close returns to the cited item');

    assert.equal(await page.locator('#video .topic').count(), 3);
    for (const direction of await page.locator('#video .topic').all()) {
      assert.equal(await direction.locator('.topic-material, .topic-output').count(), 2);
      assert.equal(await direction.locator('.field').count(), 4);
      assert.equal(await direction.locator('.case-steps li').count(), 3);
    }
    await page.locator('#topic-1 summary').click();
    assert.equal(await page.locator('#video details[open]').count(), 1);
    assert.equal(await page.locator('#topic-2 summary').isVisible(), true);
    await page.screenshot({ path: path.join(out, 'desktop-video-expanded.png'), fullPage: true });
    await page.locator('#topic-1 summary').click();
    checks.push('Three video topics compare materials and outputs before expansion; each opens its own four fields and steps');

    const referenceUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    await context.route(referenceUrl, route => route.fulfill({ contentType: 'text/plain', body: 'Local intercepted navigation check.' }));
    const popupEvent = page.waitForEvent('popup');
    await page.locator('.references a').click();
    const popup = await popupEvent;
    await popup.waitForLoadState();
    assert.equal(popup.url(), referenceUrl);
    await popup.close();
    checks.push('Reference opens its preserved URL in a new tab without fetching the external sample video');

    for (const width of [390, 320, 768, 901]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const toggles = await page.locator('.disclosure-toggle, .topic-summary').all();
      for (const toggle of toggles) {
        const box = await toggle.boundingBox();
        if (width <= 900) assert.ok(box.width >= 44 && box.height >= 44);
      }
      if (width !== 768) await page.screenshot({ path: path.join(out, `mobile-${width}.png`), fullPage: true });
      for (const toggle of toggles) await toggle.click();
      assert.equal(await page.locator('details[open]').count(), 6);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (width !== 768) await page.screenshot({ path: path.join(out, `mobile-${width}-expanded.png`), fullPage: true });
      if (width === 390) {
        await page.locator('#product').screenshot({ path: path.join(out, 'mobile-product-expanded.png') });
        await page.locator('#video').screenshot({ path: path.join(out, 'mobile-video-expanded.png') });
        await page.locator('#product .branch .source-button').first().click();
        assert.equal(await page.locator('dialog').isVisible(), true);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.locator('#evidence-dialog').evaluate(node => Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => {}))));
        await page.screenshot({ path: path.join(out, 'mobile-source-dialog.png') });
        await page.keyboard.press('Escape');
      }
    }
    checks.push('320, 390, 768 and 901 px layouts have no horizontal overflow; stacked disclosure targets are at least 44 px');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('.expand-icon').first().evaluate(node => getComputedStyle(node, '::after').transitionDuration), '0s');
    checks.push('Reduced-motion mode disables disclosure and dialog transitions');

    await page.reload();
    await page.locator('#details-product summary').click();
    await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
    assert.equal(await page.locator('details[open]').count(), 6);
    await page.evaluate(() => dispatchEvent(new Event('afterprint')));
    assert.equal(await page.locator('details[open]').count(), 1);
    assert.equal(await page.locator('#details-product').getAttribute('open'), '');
    checks.push('Printing exposes details and restores the original disclosure state afterwards');

    const rawHtml = await fs.readFile(reportPath, 'utf8');
    async function fixture(name, data) {
      const destination = path.join(out, `${name}.html`);
      const payload = JSON.stringify(data).replace(/</g, '\\u003c');
      await fs.writeFile(destination, rawHtml.replace(/(<script id="report-data" type="application\/json">)[\s\S]*?(<\/script>)/, (_, open, close) => open + payload + close));
      pages.set(`/${name}.html`, await fs.readFile(destination, 'utf8'));
      await page.goto(`${origin}/${name}.html`);
      await page.evaluate(() => document.fonts.ready);
    }
    const sparse = { schema_version: 1, title: '信息未齐的合作', sources: [], sections: {} };
    for (const key of ['product', 'promotion', 'requirements', 'video']) sparse.sections[key] = { summary: { text: '未提供，需确认。', kind: 'unknown' } };
    await fixture('sparse', sparse);
    assert.equal(await page.locator('.row').count(), 4);
    assert.equal(await page.locator('.disclosure-toggle').count(), 0);
    assert.equal(await page.locator('#open-sources').isVisible(), false);
    assert.equal(await page.locator('.references').count(), 0);
    assert.equal(await page.locator('.section-kind.unknown').count(), 4);
    checks.push('Sparse reports keep all four questions and explicit unknowns, with no dummy source or expansion controls');

    const legacy = structuredClone(sparse);
    legacy.sources = [{ id: 's1', title: '旧 brief', location: '第 1 段', excerpt: '真实要求' }];
    legacy.sections.product.details = [{ title: '能做什么', items: [{ text: '第一项能力', kind: 'fact', source_ids: ['s1'] }, { text: '第二项能力', kind: 'fact', source_ids: ['s1'] }] }];
    legacy.sections.requirements.highlights = [{ label: '时间', text: '2026.10.28 交脚本（北京时间）', kind: 'required', source_ids: ['s1'] }];
    legacy.sections.video.details = [{ title: '没有比较字段的旧选题', items: [{ text: '保留完整选题说明', kind: 'suggestion' }] }];
    await fixture('legacy', legacy);
    await page.locator('#details-product summary').click();
    assert.equal(await page.locator('#product .branch li').count(), 2);
    assert.match(await page.locator('.obligations').innerText(), /2026\.10\.28/);
    await page.locator('#topic-1 summary').click();
    assert.equal(await page.locator('#video .branch li').count(), 1);
    assert.equal(await page.locator('.topic-head').count(), 0);
    checks.push('Legacy reports keep unlabeled bullet branches, original deadline text and independently expandable topics without invented preview fields');

    const long = structuredClone(sparse);
    long.title = '龘與繁體字很長的合作名稱'.repeat(4);
    long.subtitle = '需要自然换行的产品合作'.repeat(3);
    long.sections.product.summary.text = '这是一条没有空格的很长的产品说明'.repeat(30);
    long.sections.video.summary = { kind: 'suggestion', text: '<img src=x onerror="window.reportInjected=true">请按真实任务演示。' };
    await fixture('long-text', long);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await page.locator('.summary img').count(), 0);
    assert.equal(await page.evaluate(() => window.reportInjected), undefined);
    checks.push('Long names and arbitrary Chinese wrap naturally; untrusted markup remains inert text');

    assert.deepEqual(errors, []);
    checks.push('No uncaught browser errors');
    await fs.writeFile(path.join(out, 'results.json'), JSON.stringify({ passed: checks.length, checks, errors }, null, 2));
    console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
