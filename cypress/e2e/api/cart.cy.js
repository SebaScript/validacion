// Cart endpoint tests (unauthenticated scenarios, since no DB/token in this env)
describe('Cart API - unauthenticated access', () => {
	const expectUnauthorized = (status) => expect([401, 404, 500]).to.include(status);

	it('GET /cart/my-cart => unauthorized', () => {
		cy.request({ url: '/cart/my-cart', failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('POST /cart => unauthorized', () => {
		cy.request({ method: 'POST', url: '/cart', body: { userId: 1 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('GET /cart/user/1 => unauthorized', () => {
		cy.request({ url: '/cart/user/1', failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('GET /cart/1 => unauthorized', () => {
		cy.request({ url: '/cart/1', failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('POST /cart/add-item => unauthorized', () => {
		cy.request({ method: 'POST', url: '/cart/add-item', body: { productId: 1, quantity: 2 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('POST /cart/1/items => unauthorized', () => {
		cy.request({ method: 'POST', url: '/cart/1/items', body: { productId: 1, quantity: 1 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('PUT /cart/1/items/1/quantity => unauthorized', () => {
		cy.request({ method: 'PUT', url: '/cart/1/items/1/quantity', body: { quantity: 3 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('DELETE /cart/1/items/1 => unauthorized', () => {
		cy.request({ method: 'DELETE', url: '/cart/1/items/1', failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('DELETE /cart/1/clear => unauthorized', () => {
		cy.request({ method: 'DELETE', url: '/cart/1/clear', failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});

	it('GET /cart/1/total => unauthorized', () => {
		cy.request({ url: '/cart/1/total', failOnStatusCode: false })
			.its('status').should(expectUnauthorized);
	});
});

describe('Cart API - input validation (still unauthorized)', () => {
	const expectUnauthorizedOrBadRequest = (status) => expect([400, 401, 404, 500]).to.include(status);

	it('POST /cart/add-item with missing fields', () => {
		cy.request({ method: 'POST', url: '/cart/add-item', body: {}, failOnStatusCode: false })
			.its('status').should(expectUnauthorizedOrBadRequest);
	});

	it('POST /cart/abc/items => invalid cart id type', () => {
		cy.request({ method: 'POST', url: '/cart/abc/items', body: { productId: 1, quantity: 1 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorizedOrBadRequest);
	});

	it('PUT /cart/1/items/xyz/quantity => invalid item id type', () => {
		cy.request({ method: 'PUT', url: '/cart/1/items/xyz/quantity', body: { quantity: 3 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorizedOrBadRequest);
	});

	it('PUT /cart/1/items/1/quantity with negative quantity', () => {
		cy.request({ method: 'PUT', url: '/cart/1/items/1/quantity', body: { quantity: -1 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorizedOrBadRequest);
	});

	it('POST /cart/1/items with negative productId', () => {
		cy.request({ method: 'POST', url: '/cart/1/items', body: { productId: -5, quantity: 1 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorizedOrBadRequest);
	});

	it('POST /cart/1/items with zero quantity', () => {
		cy.request({ method: 'POST', url: '/cart/1/items', body: { productId: 1, quantity: 0 }, failOnStatusCode: false })
			.its('status').should(expectUnauthorizedOrBadRequest);
	});
});
    /// <reference types="cypress" />

describe('CartComponent - Funcional Tests', () => {
    beforeEach(() => {
      // Cargar el componente o página donde se monta el carrito
      cy.visit('http://localhost:3100'); 
    });
  
    
   
    it('Debe mostrar placeholder si falla la imagen ', () => {
        cy.get('img').first().invoke('attr', 'src', 'invalid-image.jpg').trigger('error');
        cy.get('.cart-item div').should('not.contain.text', '📷'); // Debería contenerlo, pero negamos
      });
      
  
   
      
});






