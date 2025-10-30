const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(30_000);

Before(async function () {
  this.browser = await chromium.launch({ headless: true });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

// 👇 añade este bloque para los escenarios @skip
Before({ tags: '@skip' }, function () {
  this.skip();
});

After(async function () {
  try { if (this.page && !this.page.isClosed()) await this.page.close(); } catch {}
  try { if (this.context) await this.context.close(); } catch {}
  try { if (this.browser) await this.browser.close(); } catch {}
});
