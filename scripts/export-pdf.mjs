#!/usr/bin/env node
// Export a reveal.js deck to PDF using a locally installed Chrome, driven over
// the Chrome DevTools Protocol. Zero npm dependencies: Node 18+ ships a global
// `fetch` and `WebSocket`, so nothing is downloaded at runtime.
//
// Why CDP instead of decktape or `chrome --print-to-pdf`?
//   reveal.js builds its print layout asynchronously after the `ready` event
//   (it adds the `reveal-print` class, waits for fonts, then stacks one
//   `.pdf-page` per slide). A one-shot `--print-to-pdf` prints before that
//   finishes and yields a blank page. Here we connect to Chrome, poll until the
//   print layout *and* fonts are actually ready, and only then call printToPDF.
//
// Usage:
//   node scripts/export-pdf.mjs [input.html] [lang] [output.pdf]
//   node scripts/export-pdf.mjs                      # slides.html, ja  -> slides.pdf
//   node scripts/export-pdf.mjs slides.html en out.pdf
//   CHROME=/path/to/chrome node scripts/export-pdf.mjs   # override browser

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const input = resolve(process.argv[2] || 'slides.html');
const lang = (process.argv[3] || 'ja').toLowerCase();
const output = resolve(process.argv[4] || (lang === 'en' ? 'slides-en.pdf' : 'slides.pdf'));

const READY_TIMEOUT_MS = 30_000; // max wait for reveal's print layout + fonts
const PORT = Number(process.env.PORT_CDP || 9333);

// --- locate a Chrome/Chromium binary -----------------------------------------
const CHROME_CANDIDATES = [
  process.env.CHROME,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const chromePath = CHROME_CANDIDATES.find(p => existsSync(p));
if (!chromePath) {
  console.error('Error: no Chrome/Chromium binary found.');
  console.error('Set CHROME=<path-to-chrome> and retry. Looked in:');
  CHROME_CANDIDATES.forEach(p => console.error(`  ${p}`));
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`Error: input file not found: ${input}`);
  process.exit(1);
}

const url = `file://${realpathSync(input)}?print-pdf&lang=${lang}`;
const profile = mkdtempSync(join(tmpdir(), 'revealpdf-'));
const sleep = ms => new Promise(r => setTimeout(r, ms));

let chrome;
const cleanup = () => {
  try { chrome?.kill('SIGKILL'); } catch {}
  try { rmSync(profile, { recursive: true, force: true }); } catch {}
};
process.on('SIGINT', () => { cleanup(); process.exit(130); });
process.on('SIGTERM', () => { cleanup(); process.exit(143); });

// --- minimal CDP client -------------------------------------------------------
function cdpClient(ws) {
  let nextId = 0;
  const pending = new Map();
  ws.addEventListener('message', e => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    }
  });
  return (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function findPageTarget() {
  for (let i = 0; i < 100; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`);
      const targets = await res.json();
      const page = targets.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(100);
  }
  throw new Error('Chrome DevTools endpoint did not come up (is the port in use?).');
}

(async () => {
  chrome = spawn(chromePath, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check',
    `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    url,
  ], { stdio: 'ignore' });
  chrome.on('error', err => { console.error(`Failed to launch Chrome: ${err.message}`); cleanup(); process.exit(1); });

  const wsUrl = await findPageTarget();
  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', () => rej(new Error('CDP WebSocket failed'))); });
  const send = cdpClient(ws);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', { url });

  // reveal.js signals print readiness by adding `reveal-print` to <html> and
  // stacking `.pdf-page` elements; fonts must be loaded so KaTeX/text reflow.
  const readyExpr = `(document.documentElement.classList.contains('reveal-print')
    && document.fonts.status === 'loaded'
    && !!document.querySelector('.pdf-page'))`;
  let ready = false;
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const { result } = await send('Runtime.evaluate', { expression: readyExpr, returnByValue: true });
    if (result.value === true) { ready = true; break; }
    await sleep(100);
  }
  if (!ready) {
    console.error(`Error: reveal.js print layout was not ready within ${READY_TIMEOUT_MS / 1000}s.`);
    console.error('Check that the deck loads (network access to the reveal.js/KaTeX CDN is required).');
    ws.close(); cleanup(); process.exit(1);
  }
  await sleep(300); // let the final layout settle

  const { data } = await send('Page.printToPDF', {
    printBackground: true,
    preferCSSPageSize: true, // honor reveal's injected @page size (one slide per page)
    marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
  });
  writeFileSync(output, Buffer.from(data, 'base64'));
  ws.close();
  cleanup();
  console.log(`Wrote ${output}`);
  process.exit(0);
})().catch(err => {
  console.error(err.message || err);
  cleanup();
  process.exit(1);
});
