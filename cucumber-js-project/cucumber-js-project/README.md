# Proyecto Cucumber.js con Playwright

Este proyecto es una demostración básica del uso de **Cucumber.js** (Gherkin) con **Playwright** para automatizar pruebas de interacción en una página web.

## Estructura

```
cucumber-js-project/
│
├── features/
│   ├── search.feature              # Archivo Gherkin con los escenarios
│   └── step_definitions/
│       └── steps.js                # Pasos definidos para los escenarios
│
├── tests/
│   └── support/
│       └── hooks.js                # (opcional, para setup/teardown)
│
├── package.json                    # Configuración del proyecto Node.js
└── README.md                       # Instrucciones
```

## Escenarios implementados

1. Buscar si un campo está presente en una web (`#userName` en demoqa.com).
2. Escribir un nombre y enviarlo, verificando la salida.

## Instalación y uso

1. Descomprime el proyecto.
2. Abre la terminal y navega a la carpeta del proyecto:

```bash
cd cucumber-js-project
```

3. Instala las dependencias:

```bash
npm install
```

4. Ejecuta las pruebas:

```bash
npm test
```

## Requisitos

- Node.js >= 16
- Navegador Chromium (instalado automáticamente por Playwright)

## Referencias

- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [Playwright](https://playwright.dev/)
- [Demo QA Text Box](https://demoqa.com/text-box)
