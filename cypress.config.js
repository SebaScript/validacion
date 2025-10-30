// Cypress config in plain JS to avoid TypeScript requirement
const { defineConfig } = require('cypress');

module.exports = defineConfig({
	video: false,
	retries: 0,
	e2e: {
		baseUrl: 'http://localhost:3100',
		specPattern: 'cypress/e2e/**/*.cy.js',
		supportFile: false,
	},
});





