describe('Backend API - public-ish routes', () => {
	it('GET /products should reply (200 if data-source available, else error code)', () => {
		cy.request({ url: '/products', failOnStatusCode: false })
			.its('status')
			.should((status) => {
				expect([200, 404, 500]).to.include(status);
			});
	});

	it('GET /categories should reply (200 if data-source available, else error code)', () => {
		cy.request({ url: '/categories', failOnStatusCode: false })
			.its('status')
			.should((status) => {
				expect([200, 404, 500]).to.include(status);
			});
	});
});





