const { Given, When, Then, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const assert = require('assert');

let browser, context, page;
setDefaultTimeout(60000); // un poco más generoso

Given('el usuario abre la página {string}', async function (url) {
  console.log('[STEP] Given abrir URL:', url);
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    console.log('[STEP] Navegador abrió página OK');
  } catch (e) {
    console.error('[ERROR] al abrir navegador/URL:', e);
    throw e;
  }
});

When('el usuario verifica si el campo {string} está presente', async function (fieldId) {
  console.log('[STEP] When verificar campo:', fieldId);
  this.element = await page.waitForSelector(`#${fieldId}`, { state: 'visible', timeout: 10000 });
});

Then('el campo debe estar visible', async function () {
  console.log('[STEP] Then visible');
  assert.ok(await this.element.isVisible());
});

When('el usuario escribe {string} en el campo {string}', async function (text, fieldId) {
  console.log('[STEP] When escribir en campo:', fieldId, 'texto:', text);
  await page.fill(`#${fieldId}`, text);
});

When('hace clic en el botón de enviar', async function () {
  console.log('[STEP] When clic enviar');
  await page.click('#submit');
});

Then('debe ver los datos enviados en pantalla', async function () {
  console.log('[STEP] Then verificar salida');
  const output = await page.textContent('#name');
  assert.ok(output.includes('Gabriel Ramírez'));
  console.log('[STEP] Verificación OK');
});

After(async function () {
  console.log('[HOOK] After: cerrando recursos');
  try { if (page && !page.isClosed()) await page.close(); } catch {}
  try { if (context) await context.close(); } catch {}
  try { if (browser) await browser.close(); } catch {}
  console.log('[HOOK] After: cerrado');
});
