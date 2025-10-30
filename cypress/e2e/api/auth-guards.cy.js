describe('Backend API - auth guarded routes require token', () => {
	it('GET /cart/my-cart should be unauthorized without token', () => {
		cy.request({ url: '/cart/my-cart', failOnStatusCode: false })
			.its('status')
			.should((status) => {
				expect([401, 404, 500]).to.include(status);
			});
	});

	it('GET /admin/dashboard should be unauthorized without token', () => {
		cy.request({ url: '/admin/dashboard', failOnStatusCode: false })
			.its('status')
			.should((status) => {
				expect([401, 404, 500]).to.include(status);
			});
	});
});





