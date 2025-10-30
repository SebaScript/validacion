Feature: Navegación General
  Como usuario de la aplicación
  Quiero navegar entre diferentes páginas
  Para acceder a todas las funcionalidades

  Scenario: Verificar logo en el header
    Given el usuario abre la aplicación en "/"
    Then el elemento ".logo, .brand, img[alt*='logo']" debe estar visible

  Scenario: Navegar al perfil sin autenticación redirige al login
    Given el usuario abre la aplicación en "/profile"
    And espera 2 segundos
    Then la URL debe contener "/login"

  Scenario: Hacer scroll al inicio de la página
    Given el usuario abre la aplicación en "/"
    When hace scroll al final de la página
    And espera 500 milisegundos
    And hace scroll al inicio de la página
    Then el elemento "header" debe estar visible

  Scenario: Verificar responsive design - header en varias páginas
    Given el usuario abre la aplicación en "/"
    Then el elemento "header" debe estar visible
    When el usuario navega a "/product"
    Then el elemento "header" debe estar visible

