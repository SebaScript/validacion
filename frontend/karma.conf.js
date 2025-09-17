// Karma configuration file, see link for more information
// https://karma-runner.github.io/6.4/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution order
        // random: false
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly' }
      ],
      check: {
        global: {
          statements: 90,
          branches: 85,
          functions: 90,
          lines: 90
        }
      },
      // Exclude files from coverage
      exclude: [
        // Interfaces - No testable logic
        '**/interfaces/**/*.ts',

        // Validators - Simple validation logic, covered by service tests
        '**/validators/**/*.ts',

        // Environment files - Configuration only
        '**/environments/**/*.ts',

        // Constants and utilities - Simple exports
        '**/utils/constants.ts',

        // Test files themselves
        '**/*.spec.ts',
        '**/test/**/*.ts',

        // Main entry points
        '**/main.ts',
        '**/polyfills.ts',

        // Angular generated files
        '**/*.d.ts'
      ]
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['Chrome'],
    restartOnFileChange: true,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu']
      }
    }
  });
};
