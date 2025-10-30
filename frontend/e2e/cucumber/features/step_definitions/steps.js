const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

Given('el usuario abre la aplicación en {string}', async function (path) {
  const url = `http://localhost:4200${path}`;
  await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await this.page.waitForTimeout(500);
});

Given('el usuario navega a {string}', async function (path) {
  const url = `http://localhost:4200${path}`;
  await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await this.page.waitForTimeout(500);
});

Then('la URL debe contener {string}', async function (texto) {
  const url = this.page.url();
  assert.ok(url.includes(texto), `URL "${url}" no contiene "${texto}"`);
});

Then('debe estar en la página {string}', async function (path) {
  const url = this.page.url();
  const expectedUrl = `http://localhost:4200${path}`;
  assert.ok(url.includes(path), `URL actual "${url}" no contiene "${path}"`);
});

/* === ELEMENTOS Y VISIBILIDAD === */
When('el usuario verifica si el campo {string} está presente', async function (selector) {
  this.element = await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
});

When('verifica si el elemento {string} está presente', async function (selector) {
  this.element = await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
});

Then('el campo debe estar visible', async function () {
  assert.ok(await this.element.isVisible(), 'El campo no está visible');
});

Then('el elemento debe estar visible', async function () {
  assert.ok(await this.element.isVisible(), 'El elemento no está visible');
});

Then('el elemento {string} debe estar visible', async function (selector) {
  const element = await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
  assert.ok(await element.isVisible(), `El elemento "${selector}" no está visible`);
});

Then('el elemento {string} no debe existir', async function (selector) {
  const el = await this.page.$(selector);
  assert.strictEqual(el, null, `No esperaba encontrar ${selector}`);
});

Then('debe ver el texto {string}', async function (texto) {
  const textVisible = await this.page.getByText(texto).first().isVisible().catch(() => false);
  assert.ok(textVisible, `No se encontró el texto "${texto}"`);
});

Then('el elemento con texto {string} debe ser visible', async function (texto) {
  await this.page.getByText(texto, { exact: false }).first().waitFor({ state: 'visible', timeout: 10000 });
});
When('escribe {string} en el campo {string}', async function (text, selector) {
  await this.page.fill(selector, text);
});

When('el usuario escribe {string} en el campo con id {string}', async function (text, fieldId) {
  await this.page.fill(`#${fieldId}`, text);
});

When('hace clic en el botón {string}', async function (selector) {
  await this.page.locator(selector).scrollIntoViewIfNeeded();
  await this.page.click(selector, { timeout: 10000 });
});

When('hace clic en el elemento {string}', async function (selector) {
  await this.page.locator(selector).scrollIntoViewIfNeeded();
  await this.page.click(selector, { timeout: 10000 });
});

When('hace clic en el texto {string}', async function (texto) {
  await this.page.getByText(texto, { exact: false }).first().click({ timeout: 10000 });
});

When('limpia el campo {string}', async function (selector) {
  await this.page.fill(selector, '');
});

When('espera {int} segundos', async function (segundos) {
  await this.page.waitForTimeout(segundos * 1000);
});

When('espera {int} milisegundos', async function (ms) {
  await this.page.waitForTimeout(ms);
});
When('inicia sesión con email {string} y contraseña {string}', async function (email, password) {
  await this.page.fill('#email', email);
  await this.page.fill('#password', password);
  await this.page.click('button.login-btn');
});

When('completa el registro con:', async function (dataTable) {
  const data = dataTable.rowsHash();
  for (const [field, value] of Object.entries(data)) {
    await this.page.fill(`#${field}`, value);
  }
});
Then('el texto de {string} debe contener {string}', async function (selector, texto) {
  await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
  const content = await this.page.textContent(selector);
  assert.ok(content.includes(texto), `Esperado que "${content}" contenga "${texto}"`);
});

Then('debe ver un mensaje de éxito', async function () {
  const successToast = await this.page.locator('.toast-success, .swal2-success').first().isVisible().catch(() => false);
  assert.ok(successToast, 'No se encontró mensaje de éxito');
});

Then('debe ver un mensaje de error', async function () {
  const errorToast = await this.page.locator('.toast-error, .swal2-error, .error-message').first().isVisible().catch(() => false);
  assert.ok(errorToast, 'No se encontró mensaje de error');
});
When('agrega un producto al carrito', async function () {
  const addButton = this.page.locator('button:has-text("Agregar al carrito"), button:has-text("Añadir"), .add-to-cart').first();
  await addButton.click({ timeout: 15000 });
});

Then('el contador del carrito debe ser {string}', async function (cantidad) {
  const cartBadge = await this.page.locator('.cart-badge, .cart-count, .badge').first().textContent();
  assert.ok(cartBadge.includes(cantidad), `Esperado ${cantidad}, obtenido ${cartBadge}`);
});
When('hace clic en el menú de navegación', async function () {
  await this.page.click('.navbar-toggler, .menu-toggle, button:has-text("☰")');
});

When('cierra sesión', async function () {
  const logoutButton = this.page.locator('button:has-text("Cerrar sesión"), a:has-text("Logout"), .logout-btn').first();
  await logoutButton.click({ timeout: 15000 });
});
Then('debe ver su información de perfil', async function () {
  const profileContainer = await this.page.locator('.profile-container, .user-profile, .profile-info').first().isVisible().catch(() => false);
  assert.ok(profileContainer, 'No se encontró el contenedor de perfil');
});

Then('el campo de nombre debe contener {string}', async function (nombre) {
  const nameField = await this.page.locator('#name, input[name="name"], #userName').first();
  const value = await nameField.inputValue();
  assert.ok(value.includes(nombre), `El campo nombre "${value}" no contiene "${nombre}"`);
});
Then('debe ver el panel de administración', async function () {
  const adminPanel = await this.page.locator('.admin-panel, .admin-container, h1:has-text("Admin")').first().isVisible().catch(() => false);
  assert.ok(adminPanel, 'No se encontró el panel de administración');
});

When('hace clic en la pestaña {string}', async function (tabName) {
  await this.page.getByText(tabName, { exact: false }).first().click({ timeout: 15000 });
});
When('llena los campos del formulario:', async function (dataTable) {
  const rows = dataTable.rows();
  for (const [field, value] of rows) {
    await this.page.fill(field, value);
  }
});
Then('el botón {string} debe estar deshabilitado', async function (selector) {
  const isDisabled = await this.page.locator(selector).isDisabled();
  assert.ok(isDisabled, `El botón "${selector}" no está deshabilitado`);
});

Then('el botón {string} debe estar habilitado', async function (selector) {
  const isEnabled = await this.page.locator(selector).isEnabled();
  assert.ok(isEnabled, `El botón "${selector}" no está habilitado`);
});
Then('debe ver el formulario de checkout', async function () {
  const checkoutForm = await this.page.locator('.checkout-form, form.checkout, .payment-form').first().isVisible().catch(() => false);
  assert.ok(checkoutForm, 'No se encontró el formulario de checkout');
});

When('completa la dirección de envío:', async function (dataTable) {
  const data = dataTable.rowsHash();
  for (const [field, value] of Object.entries(data)) {
    const selector = `input[name="${field}"], #${field}`;
    await this.page.fill(selector, value);
  }
});
Then('debe ver una lista de productos', async function () {
  const products = await this.page.locator('.product-card, .producto, .product-item').count();
  assert.ok(products > 0, 'No se encontraron productos');
});

When('filtra por categoría {string}', async function (categoria) {
  await this.page.getByText(categoria, { exact: false }).first().click({ timeout: 15000 });
});
When('busca el producto {string}', async function (termino) {
  const searchInput = this.page.locator('input[type="search"], input[placeholder*="Buscar"], .search-input').first();
  await searchInput.fill(termino);
  await searchInput.press('Enter');
});
Then('debe ver al menos {int} elementos con selector {string}', async function (cantidad, selector) {
  const count = await this.page.locator(selector).count();
  assert.ok(count >= cantidad, `Se esperaban al menos ${cantidad} elementos, pero se encontraron ${count}`);
});
When('hace scroll al final de la página', async function () {
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
});

When('hace scroll al inicio de la página', async function () {
  await this.page.evaluate(() => window.scrollTo(0, 0));
});
Then('el elemento {string} debe tener la clase {string}', async function (selector, className) {
  const element = await this.page.locator(selector).first();
  const classes = await element.getAttribute('class');
  assert.ok(classes.includes(className), `El elemento no tiene la clase "${className}"`);
});

