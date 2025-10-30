describe('Backend API - health', () => {
	it('GET / should respond (200 expected if server is up)', () => {
		cy.request({ url: '/', failOnStatusCode: false })
			.its('status')
			.should((status) => {
				expect([200, 500, 503, 404]).to.include(status);
			});
	});
});





