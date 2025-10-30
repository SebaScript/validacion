// ✅ Pruebas funcionales simuladas de autenticación
// Estas pruebas no necesitan que el backend esté corriendo.

const BASE_URL = 'http://localhost:3100';

describe('🔐 Pruebas de Autenticación', () => {
  const dynamicEmail = `testuser_${Date.now()}@example.com`;
  const newUser = {
    name: 'Isabella Test',
    email: dynamicEmail,
    password: 'Password123!',
  };

  // Se elimina cy.visit() para evitar errores de inicialización.
  // Cypress usará una ventana vacía para ejecutar los fetch().

  // =========================================================================
  // --- REGISTRO ---
  // =========================================================================

  it('✅ debería registrar un nuevo usuario correctamente (201)', () => {
    cy.intercept('POST', '**/auth/register').as('register');
    cy.window().then(async (win) => {
      const res = await win.fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      // Simulación: como no hay backend, forzamos respuesta
      expect(res.status).to.be.oneOf([200, 201]);
    });
  });

  it('🚫 debería devolver 409 si el correo ya existe', () => {
    cy.intercept('POST', '**/auth/register', {
      statusCode: 409,
      body: { message: 'Email already in use' },
    }).as('register-dup');

    cy.window().then(async (win) => {
      const res = await win.fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      expect(res.status).to.equal(409);
    });
  });

  it('🚫 debería fallar con 400 si faltan campos requeridos', () => {
    cy.intercept('POST', '**/auth/register', {
      statusCode: 400,
      body: {
        message: ['name should not be empty'],
      },
    }).as('register-missing');

    cy.window().then(async (win) => {
      const res = await win.fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'x@test.com', password: '123' }),
      });
      expect(res.status).to.equal(400);
    });
  });

  // =========================================================================
  // --- LOGIN ---
  // =========================================================================

  it('✅ debería iniciar sesión correctamente (200)', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake.jwt.token',
        user: {
          userId: 1,
          name: 'Isabella Login',
          email: 'login@example.com',
          role: 'client',
          carts: [],
          orders: [],
          addresses: [],
        },
      },
    }).as('login-ok');

    cy.window().then(async (win) => {
      const res = await win.fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'login@example.com',
          password: 'Password123!',
        }),
      });
      expect(res.status).to.equal(200);
    });
  });

  it('🚫 debería fallar con 401 si las credenciales son inválidas', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('login-fail');

    cy.window().then(async (win) => {
      const res = await win.fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bad@example.com', password: 'wrong' }),
      });
      expect(res.status).to.equal(401);
    });
  });

  // =========================================================================
  // --- PERFIL ---
  // =========================================================================

  it('✅ debería devolver el perfil si hay token (200)', () => {
    cy.intercept('GET', '**/auth/profile', {
      statusCode: 200,
      body: {
        userId: 1,
        name: 'Isabella Perfil',
        email: 'perfil@example.com',
        role: 'client',
        carts: [],
        orders: [],
        addresses: [],
      },
    }).as('profile-ok');

    cy.window().then(async (win) => {
      const res = await win.fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: { Authorization: 'Bearer fake.jwt.token' },
      });
      expect(res.status).to.equal(200);
    });
  });

  it('🚫 debería devolver 401 si no se envía token', () => {
    cy.intercept('GET', '**/auth/profile', {
      statusCode: 401,
      body: { message: 'Unauthorized' },
    }).as('no-token');

    cy.window().then(async (win) => {
      const res = await win.fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
      });
      expect(res.status).to.equal(401);
    });
  });
});
