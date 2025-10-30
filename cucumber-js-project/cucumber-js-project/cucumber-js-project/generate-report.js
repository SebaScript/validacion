const reporter = require('cucumber-html-reporter');

const options = {
  theme: 'bootstrap',
  jsonFile: 'report/cucumber_report.json',
  output: 'report/cucumber_report.html',
  reportSuiteAsScenarios: true,
  launchReport: true,
  metadata: {
      "App Version":"1.0.0",
      "Test Environment": "Development",
      "Browser": "Chromium",
      "Platform": "Windows 10",
      "Executed": "Local"
  }
};

reporter.generate(options);
