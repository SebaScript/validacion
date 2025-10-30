/* module.exports = {
  default: {
    require: [
      'features/support/*.js',
      'features/step_definitions/*.js'
    ],
    timeout: 30000,
    publishQuiet: true,
    format: ['progress', 'json:report/cucumber_report.json'],
    parallel: 3
  }
}; */

module.exports = {
  default: {
    require: [
      'e2e/cucumber/features/step_definitions/**/*.js',
      'e2e/cucumber/features/support/**/*.js'
    ],
    format: [
      'progress',
      'json:e2e/cucumber/report/cucumber_report.json'
    ],
    publishQuiet: true,
    paths: ['e2e/cucumber/features/**/*.feature'],
    parallel: 1,
    timeout: 30000
  }
};



