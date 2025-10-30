const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const path = require('path');

/* === Navegación básica === */
Given('el usuario abre la página {string}', async function (url) {
  await this.page.goto(url, { waitUntil: 'load', timeout: 15000 });
});

When('navega a {string}', async function (url) {
  await this.page.goto(url, { waitUntil: 'load', timeout: 15000 });
});

Then('la URL debe contener {string}', async function (parte) {
  const url = this.page.url();
  assert.ok(url.includes(parte), `URL "${url}" no contiene "${parte}"`);
});

/* === Elementos / visibilidad === */
When('el usuario verifica si el campo {string} está presente', async function (fieldId) {
  this.element = await this.page.waitForSelector(`#${fieldId}`, { state: 'visible', timeout: 10000 });
});

Then('el campo debe estar visible', async function () {
  assert.ok(await this.element.isVisible());
});

Then('el elemento {string} no debe existir', async function (selector) {
  const el = await this.page.$(selector);
  assert.strictEqual(el, null, `No esperaba encontrar ${selector}`);
});

Then('el elemento con texto {string} debe ser visible', async function (texto) {
  await this.page.getByText(texto, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
});

/* === Interacción de formularios === */
When('el usuario escribe {string} en el campo {string}', async function (text, fieldId) {
  await this.page.fill(`#${fieldId}`, text);
});

When('hace clic en el botón de enviar', async function () {
  await this.page.locator('#submit').scrollIntoViewIfNeeded();
  await this.page.click('#submit');
});

Then('debe ver los datos enviados en pantalla', async function () {
  await this.page.waitForSelector('#name', { state: 'visible', timeout: 10000 });
  const output = await this.page.textContent('#name');
  assert.ok(output.includes('Gabriel Ramírez'), `No se encontró el nombre en: "${output}"`);
});

Then('el texto de {string} debe contener {string}', async function (selector, texto) {
  await this.page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
  const content = await this.page.textContent(selector);
  assert.ok(content.includes(texto), `Esperado que "${content}" contenga "${texto}"`);
});

When('llena los campos:', async function (dataTable) {
  for (const [fieldId, value] of dataTable.raw()) {
    await this.page.fill(`#${fieldId}`, value);
  }
});

/* === Click por texto === */
When('hace clic en el elemento con texto {string}', async function (texto) {
  await this.page.getByText(texto, { exact: true }).click();
});

/* === Select (dropdown nativo) === */
When('selecciona {string} en el select {string}', async function (optionLabel, selector) {
  await this.page.selectOption(selector, { label: optionLabel });
});

Then('el valor del select {string} debe ser {string}', async function (selector, esperado) {
  const value = await this.page.$eval(selector, el => el.options[el.selectedIndex].text);
  assert.strictEqual(value, esperado, `Valor del select es "${value}", esperado "${esperado}"`);
});

/* === Upload de archivos === */
When('sube el archivo {string} en {string}', async function (ruta, selector) {
  // Si la ruta no es absoluta, resolver respecto al directorio del proyecto
  const abs = path.isAbsolute(ruta) ? ruta : path.resolve(process.cwd(), ruta);
  await this.page.setInputFiles(selector, abs);
});
