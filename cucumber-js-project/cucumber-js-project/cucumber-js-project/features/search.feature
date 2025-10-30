Feature: Web interactions

# Escenario Buscar un objeto
  Scenario: Buscar un objeto en una web
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario verifica si el campo "userName" está presente
    Then el campo debe estar visible

# Escenario Escribir textos y enviar
  Scenario: Escribir y enviar texto
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario escribe "Gabriel Ramírez" en el campo "userName"
    And hace clic en el botón de enviar
    Then debe ver los datos enviados en pantalla

  # Escenario Verificar visibilidad de dos campos (userName y userEmail)
  Scenario: Verificar dos campos visibles
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario verifica si el campo "userName" está presente
    Then el campo debe estar visible
    When el usuario verifica si el campo "userEmail" está presente
    Then el campo debe estar visible

  # Escenario Enviar con nombre y email (la verificación sigue siendo del nombre)
  Scenario: Enviar con nombre y email
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario escribe "Gabriel Ramírez" en el campo "userName"
    And el usuario escribe "gabriel@test.com" en el campo "userEmail"
    And hace clic en el botón de enviar
    Then debe ver los datos enviados en pantalla

  # Escenario Completar más campos y enviar (la aserción sigue verificando el nombre)
  Scenario: Completar nombre, email y direcciones y enviar
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario escribe "Gabriel Ramírez" en el campo "userName"
    And el usuario escribe "gabriel@test.com" en el campo "userEmail"
    And el usuario escribe "Calle 123" en el campo "currentAddress"
    And el usuario escribe "Calle 456" en el campo "permanentAddress"
    And hace clic en el botón de enviar
    Then debe ver los datos enviados en pantalla
