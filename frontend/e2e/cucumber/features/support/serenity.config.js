import { configure } from '@serenity-js/core';
import { ConsoleReporter } from '@serenity-js/console-reporter';
import { SerenityBDDReporter } from '@serenity-js/serenity-bdd';
import { Actors } from './actors.js';

export default configure({
  actors: new Actors(),
  crew: [
    ConsoleReporter.forDarkTerminals(),
    new SerenityBDDReporter({
      specDirectory: 'report',
      specFileName: 'serenity-report.json',
      processors: [],
    }),
  ],
});

