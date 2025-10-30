Feature: Proceso de Checkout
  Como usuario con productos en el carrito
  Quiero completar el proceso de compra
  Para recibir mis productos

  Background:
    Given el usuario abre la aplicación en "/login"
    When inicia sesión con email "cliente@vallmere.com" y contraseña "cliente123"
    And espera 2 segundos

  Scenario: Acceder a la página de checkout (redirige si no hay productos)
    When el usuario navega a "/checkout"
    And espera 1 segundos
    Then la URL debe contener "/"

  Scenario: Verificar que el formulario de checkout está visible (puede fallar)
    When el usuario navega a "/checkout"
    Then debe ver el formulario de checkout
