Feature: Productos y Catálogo
  Como usuario de la aplicación
  Quiero ver y buscar productos
  Para encontrar lo que necesito comprar

  Scenario: Visualizar la página de landing
    Given el usuario abre la aplicación en "/"
    Then el elemento ".hero-section, .main-content, .landing" debe estar visible

  Scenario: Verificar que hay productos en la página principal
    Given el usuario abre la aplicación en "/"
    And espera 1 segundos
    Then debe ver una lista de productos

  Scenario: Navegar a la página de productos
    Given el usuario abre la aplicación en "/product"
    And espera 1 segundos
    Then debe ver una lista de productos

  Scenario: Verificar elementos de una tarjeta de producto
    Given el usuario abre la aplicación en "/product"
    And espera 1 segundos
    Then el elemento ".product-card" debe estar visible

  Scenario: Verificar que el header está presente
    Given el usuario abre la aplicación en "/"
    Then el elemento "app-header, header, .header" debe estar visible
