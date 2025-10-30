const reporter = require('cucumber-html-reporter');
const path = require('path');

const options = {
  theme: 'bootstrap',
  jsonFile: path.join(__dirname, 'report/cucumber_report.json'),
  output: path.join(__dirname, 'report/cucumber_report.html'),
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  launchReport: true,
  metadata: {
    "App Version": "1.0.0",
    "Test Environment": "Development",
    "Browser": "Chromium",
    "Platform": "Windows 10",
    "Executed": "Local",
    "Project": "VALLMERE E-Commerce",
    "Sprint": "1.0"
  },
  brandTitle: "VALLMERE - Cucumber E2E Test Report",
  name: "Frontend E2E Tests"
};

try {
  reporter.generate(options);
  console.log('\n✅ Reporte HTML generado exitosamente en: report/cucumber_report.html');
  console.log('📊 El reporte se abrirá automáticamente en tu navegador\n');
} catch (error) {
  console.error('❌ Error al generar el reporte:', error.message);
  process.exit(1);
}

