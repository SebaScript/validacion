Feature: Carrito de Compras
  Como usuario de la aplicación
  Quiero agregar productos al carrito
  Para poder comprarlos posteriormente

  Scenario: Verificar que el icono del carrito está visible
    Given el usuario abre la aplicación en "/"
    Then el elemento ".cart-icon, .cart, app-cart" debe estar visible

  Scenario: Abrir el modal del carrito
    Given el usuario abre la aplicación en "/"
    When hace clic en el elemento ".cart-icon, .cart"
    And espera 1 segundos
    Then el elemento ".cart-modal, .cart-sidebar, app-cart" debe estar visible

  Scenario: Carrito vacío muestra mensaje apropiado (puede fallar)
    Given el usuario abre la aplicación en "/"
    When hace clic en el elemento ".cart-icon"
    And espera 1 segundos
    Then debe ver el texto "vacío"
