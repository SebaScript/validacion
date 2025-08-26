
// Configuración Karma para pruebas reales
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-headless-launcher'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    files: ['real-unit-tests.spec.ts'],
    client: {
      jasmine: {
        random: false,
        seed: '4321',
        timeoutInterval: 10000
      },
      clearContext: false
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'json-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    singleRun: true,
    restartOnFileChange: false,
    browserNoActivityTimeout: 60000
  });
};