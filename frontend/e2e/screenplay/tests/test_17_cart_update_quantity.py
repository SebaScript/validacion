"""
Test 17 - Cart - Update Item Quantity
Verifies that item quantity can be updated in cart
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_product_page import VallmereProductPage
from pages.vallmere_cart_page import VallmereCartPage
from pages.vallmere_login_page import VallmereLoginPage


def test_17_cart_update_quantity(actor):
    """
    Scenario: User increases quantity of cart item
    Given the user has a product in cart
    When the user increases the quantity
    Then the quantity should be updated
    """
    # Given - Login and add product
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/login"),
        VallmereLoginPage.wait_for_email_field(),
        VallmereLoginPage.enter_email("cliente@vallmere.com"),
        VallmereLoginPage.enter_password("cliente123"),
        VallmereLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    browser = actor.ability_to(BrowseTheWeb).browser
    browser.get("http://localhost:4200/product/5")
    
    actor.attempts_to(
        VallmereProductPage.wait_for_add_to_cart_button(),
        VallmereProductPage.click_add_to_cart()
    )
    
    time.sleep(1.5)
    
    # When - Open cart and increase quantity
    actor.attempts_to(
        VallmereCartPage.click_cart_icon()
    )
    
    time.sleep(1.5)  # Wait for cart animation
    
    # Verify cart item exists
    browser = actor.ability_to(BrowseTheWeb).browser
    initial_quantity = browser.execute_script("""
        const quantityEl = document.querySelector('.cart-item .quantity');
        return quantityEl ? parseInt(quantityEl.textContent) : 0;
    """)
    
    # When - Click increase quantity
    actor.attempts_to(
        VallmereCartPage.click_increase_quantity()
    )
    
    time.sleep(1.5)
    
    # Then - Verify quantity increased
    final_quantity = browser.execute_script("""
        const quantityEl = document.querySelector('.cart-item .quantity');
        return quantityEl ? parseInt(quantityEl.textContent) : 0;
    """)
    
    assert final_quantity > initial_quantity, f"Quantity should increase. Initial: {initial_quantity}, Final: {final_quantity}"

