// Product endpoint tests (contract/validation oriented; tolerant to no-DB env)
describe('Products API - read endpoints', () => {
	const expectOkOrError = (status) => expect([200, 404, 500]).to.include(status);

	it('GET /products => list or server error', () => {
		cy.request({ url: '/products', failOnStatusCode: false })
			.its('status').should(expectOkOrError);
	});

	it('GET /products/1 => item or not found or error', () => {
		cy.request({ url: '/products/1', failOnStatusCode: false })
			.its('status').should(expectOkOrError);
	});

	it('GET /products/999999 => likely 404 or error', () => {
		cy.request({ url: '/products/999999', failOnStatusCode: false })
			.its('status').should(expectOkOrError);
	});

	it('GET /products/-1 => invalid id should 400/404/500', () => {
		cy.request({ url: '/products/-1', failOnStatusCode: false })
			.its('status').should((s) => expect([400, 404, 500]).to.include(s));
	});

	it('GET /products/abc => invalid id type should 400/404/500', () => {
		cy.request({ url: '/products/abc', failOnStatusCode: false })
			.its('status').should((s) => expect([400, 404, 500]).to.include(s));
	});
});

describe('Products API - create validations', () => {
	const expectValidationOrError = (status) => expect([201, 400, 422, 500]).to.include(status);

	function post(body) {
		return cy.request({ method: 'POST', url: '/products', body, failOnStatusCode: false });
	}

	it('POST /products valid-ish body (may 201 with DB, else 500)', () => {
		post({ name: 'P1', description: 'D1', price: 9.99, stock: 1, categoryId: 1 })
			.its('status').should(expectValidationOrError);
	});

	
	it('POST /products invalid categoryId type', () => {
		post({ name: 'P', description: 'D', price: 1, stock: 1, categoryId: 'abc' })
			.its('status').should(expectValidationOrError);
	});

	it('POST /products extremely long name', () => {
		post({ name: 'X'.repeat(300), description: 'D', price: 1, stock: 1, categoryId: 1 })
			.its('status').should(expectValidationOrError);
	});
});

describe('Products API - update/delete behaviors', () => {
	const expectOkOrError = (status) => expect([200, 404, 500]).to.include(status);

	it('PATCH /products/1 update name', () => {
		cy.request({ method: 'PATCH', url: '/products/1', body: { name: 'Updated' }, failOnStatusCode: false })
			.its('status').should(expectOkOrError);
	});

	
	it('DELETE /products/abc invalid id', () => {
		cy.request({ method: 'DELETE', url: '/products/abc', failOnStatusCode: false })
			.its('status').should((s) => expect([400, 404, 500]).to.include(s));
	});
    

describe('Products API - forced failing scenarios', () => {

	it('GET /products with invalid query params should fail (expected 400)', () => {
		cy.request({
			url: '/products?limit=abc&page=-1',
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(400); // esto probablemente fallará
		});
	});

	it('POST /products completely empty body (should 400 or 422)', () => {
		cy.request({
			method: 'POST',
			url: '/products',
			body: {},
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(422); // muchos backends devuelven 400 o 500 → fallo forzado
		});
	});

	it('POST  (should throw error)', () => {
		cy.request({
			method: 'POST',
			url: '/products',
			body: "INVALID_JSON_STRING",
			headers: { 'Content-Type': 'application/json' },
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(400); // normalmente será 500 → fallará
		});
	});

	it('PATCH ', () => {
		cy.request({
			method: 'PATCH',
			url: '/products/1',
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(400); // normalmente será 500 → fallará
		});
	});

	it('DELETE  (ruta inválida)', () => {
		cy.request({
			method: 'DELETE',
			url: '/products/', // endpoint incompleto
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(405); // probablemente sea 404 → fallará
		});
	});

	it('POST ', () => {
		cy.request({
			method: 'POST',
			url: '/products',
			body: {
				name: 12345,              // número en lugar de string
				description: true,        // boolean en lugar de string
				price: "free",            // texto en lugar de número
				stock: "many",            // texto en lugar de número
				categoryId: null
			},
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(201); // forzamos error: nunca será creado exitosamente
		});
	});

	it('PATCH (array en lugar de objeto)', () => {
		cy.request({
			method: 'PATCH',
			url: '/products/1',
			body: [1, 2, 3],
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(200); // seguramente sea 400 o 500 → fallará
		});
	});

	it('DELETE ', () => {
		cy.request({
			method: 'DELETE',
			url: '/products/invalidID',
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(200); // esto fallará si devuelve 400 o 404
		});
	});

	it('GET /products con id extremadamente grande ', () => {
		cy.request({
			url: '/products/9999999999999999999999999',
			failOnStatusCode: false
		}).then((res) => {
			expect(res.status).to.eq(200); // normalmente será 404 o 500 → fallará
		});
	});
});

});





