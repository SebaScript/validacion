Feature: Web interactions

  Scenario: Buscar un objeto en una web
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario verifica si el campo "userName" está presente
    Then el campo debe estar visible

  Scenario: Escribir y enviar texto
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario escribe "Gabriel Ramírez" en el campo "userName"
    And hace clic en el botón de enviar
    Then debe ver los datos enviados en pantalla
