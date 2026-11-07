#!/usr/bin/env node
// Asserts marketing homepage CTAs have real tap targets on ~390–430px phones.
// Collapsed panels must set display:none on their .btn children (not only the parent),
// otherwise getBoundingClientRect is 0×0 while computed display stays inline-flex.
'use strict';
const puppeteer = require('puppeteer-core');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.resolve(__dirname, '..');
const pageUrl = pathToFileURL(path.join(root, 'index.html')).href;
const widths = [390, 412, 430];
const chrome = process.env.CHROME || '/usr/bin/google-chrome';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({ executablePath: chrome, args: ['--no-sandbox', '--disable-gpu'] });
  let failed = 0;
  for (const w of widths) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: 844, isMobile: true, hasTouch: true });
    await page.goto(pageUrl, { waitUntil: 'networkidle0' });
    const top = await page.evaluate(() => {
      const critical = Array.from(document.querySelectorAll('button, a.btn, [role="button"], .btn, input[type="submit"]'));
      const zero = [];
      for (const el of critical) {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const text = (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40);
        if (text && (r.width === 0 || r.height === 0) && style.display !== 'none' && style.visibility !== 'hidden') zero.push(text);
      }
      const open = document.querySelector('.top-open');
      const or = open ? open.getBoundingClientRect() : null;
      const hero = [...document.querySelectorAll('.hero .btns a.btn')].map((a) => {
        const r = a.getBoundingClientRect();
        return { text: a.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) };
      });
      return { zero, topOpen: or ? { w: Math.round(or.width), h: Math.round(or.height) } : null, hero };
    });
    if (top.zero.length) { console.error('FAIL ' + w + 'px top zero-size: ' + top.zero.join(' | ')); failed++; }
    else if (!top.topOpen || top.topOpen.w < 40 || top.topOpen.h < 40) { console.error('FAIL ' + w + 'px top-open too small', top.topOpen); failed++; }
    else if (top.hero.some((h) => h.w < 40 || h.h < 40)) { console.error('FAIL ' + w + 'px hero CTA', top.hero); failed++; }
    else console.log('ok ' + w + 'px top: top-open ' + top.topOpen.w + 'x' + top.topOpen.h + ', hero ok, zero-size none');

    await page.evaluate(() => window.scrollTo(0, document.querySelector('.hero').offsetHeight + 150));
    await sleep(400);
    const scrolled = await page.evaluate(() => {
      const critical = Array.from(document.querySelectorAll('button, a.btn, [role="button"], .btn, input[type="submit"]'));
      const zero = [];
      for (const el of critical) {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        const text = (el.innerText || '').trim().slice(0, 40);
        if (text && (r.width === 0 || r.height === 0) && style.display !== 'none' && style.visibility !== 'hidden') zero.push(text);
      }
      const dock = [...document.querySelectorAll('#dock a.btn')].map((a) => {
        const r = a.getBoundingClientRect();
        return { text: a.textContent.trim(), w: Math.round(r.width), h: Math.round(r.height) };
      });
      return { zero, dock, dockHidden: document.getElementById('dock').hidden };
    });
    if (scrolled.zero.length) { console.error('FAIL ' + w + 'px scrolled zero-size: ' + scrolled.zero.join(' | ')); failed++; }
    else if (scrolled.dockHidden) { console.error('FAIL ' + w + 'px dock still hidden after scroll'); failed++; }
    else if (scrolled.dock.some((d) => d.w < 40 || d.h < 40)) { console.error('FAIL ' + w + 'px dock CTA', scrolled.dock); failed++; }
    else console.log('ok ' + w + 'px scrolled: dock ' + scrolled.dock.map((d) => d.text + ' ' + d.w + 'x' + d.h).join(', '));
    await page.close();
  }
  await browser.close();
  if (failed) { console.error('FAILED ' + failed); process.exit(1); }
  console.log('ALL phone CTA size checks passed');
})().catch((e) => { console.error(e); process.exit(1); });
