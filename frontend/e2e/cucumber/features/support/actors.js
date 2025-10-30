import { BrowseTheWebWithPlaywright } from '@serenity-js/playwright';
import { Cast } from '@serenity-js/core';
import { chromium } from 'playwright';

export class Actors extends Cast {
  prepare(actor) {
    return actor.whoCan(
      BrowseTheWebWithPlaywright.using(async () => {
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();
        return page;
      })
    );
  }
}

