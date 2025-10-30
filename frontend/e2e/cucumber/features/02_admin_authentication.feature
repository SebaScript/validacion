Feature: Autenticación de Administradores
  Como administrador del sistema
  Quiero poder iniciar sesión en el panel de administración
  Para gestionar productos, categorías y usuarios

  Scenario: Navegación directa a admin sin autenticación
    Given el usuario abre la aplicación en "/admin"
    And espera 1 segundos
    Then la URL debe contener "/admin"
