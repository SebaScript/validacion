const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

setDefaultTimeout(30_000);

Before(async function () {
  this.browser = await chromium.launch({ 
    headless: true,
    args: [
      '--disable-dev-shm-usage', 
      '--no-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions'
    ]
  });
  this.context = await this.browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  this.page = await this.context.newPage();
  await this.page.route('**/*.{png,jpg,jpeg,gif,svg,webp}', route => route.abort());
  await this.page.route('**/*.{woff,woff2,ttf,eot}', route => route.abort());
});

Before({ tags: '@skip' }, function () {
  return 'skipped';
});

After(async function () {
  try { 
    if (this.page && !this.page.isClosed()) {
      await this.page.close(); 
    } 
  } catch {}
  try { 
    if (this.context) {
      await this.context.close(); 
    } 
  } catch {}
  try { 
    if (this.browser) {
      await this.browser.close(); 
    } 
  } catch {}
});

