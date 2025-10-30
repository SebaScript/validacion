Feature: Autenticación de Usuarios
  Como usuario del sistema
  Quiero poder iniciar sesión y registrarme
  Para acceder a las funcionalidades de la aplicación

  Scenario: Login exitoso con credenciales de cliente válidas
    Given el usuario abre la aplicación en "/login"
    When escribe "cliente@vallmere.com" en el campo "#email"
    And escribe "cliente123" en el campo "#password"
    And hace clic en el botón "button.login-btn"
    And espera 2 segundos
    Then debe estar en la página "/profile"
    And debe ver su información de perfil

  Scenario: Verificar elementos del formulario de login
    Given el usuario abre la aplicación en "/login"
    Then el elemento "#email" debe estar visible
    And el elemento "#password" debe estar visible
    And el elemento "button.login-btn" debe estar visible

  Scenario: Login con credenciales incorrectas
    Given el usuario abre la aplicación en "/login"
    When escribe "usuario@noexiste.com" en el campo "#email"
    And escribe "passwordincorrecto" en el campo "#password"
    And hace clic en el botón "button.login-btn"
    And espera 2 segundos
    Then debe estar en la página "/login"

  Scenario: Verificar que el formulario de registro está visible
    Given el usuario abre la aplicación en "/sign-up"
    Then el elemento "#name" debe estar visible
    And el elemento "#email" debe estar visible
    And el elemento "#password" debe estar visible
