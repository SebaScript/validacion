module.exports = {
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
};

