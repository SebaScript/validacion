Feature: Perfil de Usuario
  Como usuario autenticado
  Quiero ver y editar mi perfil
  Para mantener mi información actualizada

  Background:
    Given el usuario abre la aplicación en "/login"
    When inicia sesión con email "cliente@vallmere.com" y contraseña "cliente123"
    And espera 2 segundos

  Scenario: Ver información del perfil después del login
    Then debe estar en la página "/profile"
    And debe ver su información de perfil

  Scenario: Verificar que el contenedor de perfil está visible
    When el usuario navega a "/profile"
    Then el elemento ".profile-container" debe estar visible
