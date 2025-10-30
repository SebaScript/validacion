Feature: Formulario Text Box (escenarios adicionales)

  # Escenario Solo verificar que el email está presente y visible
  Scenario: Verificar campo de email
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario verifica si el campo "userEmail" está presente
    Then el campo debe estar visible

  # Escenario Enviar únicamente con el nombre (la app muestra el nombre enviado)
  Scenario: Enviar solo nombre
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario escribe "Gabriel Ramírez" en el campo "userName"
    And hace clic en el botón de enviar
    Then debe ver los datos enviados en pantalla

  # Escenario Enviar nombre y una dirección (la verificación sigue siendo por el nombre)
  Scenario: Enviar nombre y una dirección
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario escribe "Gabriel Ramírez" en el campo "userName"
    And el usuario escribe "Av. Principal 789" en el campo "currentAddress"
    And hace clic en el botón de enviar
    Then debe ver los datos enviados en pantalla

  # Escenario Verificar visibilidad secuencial de varios campos
  Scenario: Verificar visibilidad de múltiples campos
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario verifica si el campo "userName" está presente
    Then el campo debe estar visible
    When el usuario verifica si el campo "currentAddress" está presente
    Then el campo debe estar visible
    When el usuario verifica si el campo "permanentAddress" está presente
    Then el campo debe estar visible

    # Este escenario FALLA intencionalmente porque tu verificación final
  # busca el texto "Gabriel Ramírez" y aquí enviamos otro nombre.
  Scenario: Enviar nombre incorrecto (debe fallar)
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario escribe "Nombre Incorrecto" en el campo "userName"
    And hace clic en el botón de enviar
    Then debe ver los datos enviados en pantalla

  # Este escenario se marcará como SKIPPED al ejecutar con --tags "not @skip".
  @skip
  Scenario: Escenario marcado para omitir
    Given el usuario abre la página "https://demoqa.com/text-box"
    When el usuario verifica si el campo "userName" está presente
    Then el campo debe estar visible
