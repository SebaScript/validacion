Feature: Validaciones y Manejo de Errores
  Como usuario de la aplicación
  Quiero ver mensajes de error apropiados
  Para corregir mis errores en los formularios

  Scenario: Navegación a ruta inexistente redirige a home
    Given el usuario abre la aplicación en "/pagina-que-no-existe"
    And espera 1 segundos
    Then la URL debe contener "/"

  @skip
  Scenario: Este escenario será omitido
    Given el usuario abre la aplicación en "/"
    Then el elemento ".elemento-inexistente" debe estar visible

