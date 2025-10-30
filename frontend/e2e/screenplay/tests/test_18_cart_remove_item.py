"""
Test 18 - Cart - Remove Item
Verifies that items can be removed from cart
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_product_page import VallmereProductPage
from pages.vallmere_cart_page import VallmereCartPage
from pages.vallmere_login_page import VallmereLoginPage


def test_18_cart_remove_item(actor):
    """
    Scenario: User removes an item from cart
    Given the user has a product in cart
    When the user clicks remove button
    Then the item should be removed
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
    
    # When - Open cart and remove item
    actor.attempts_to(
        VallmereCartPage.click_cart_icon()
    )
    
    time.sleep(1.5)  # Wait for cart animation
    
    # Verify cart has items
    browser = actor.ability_to(BrowseTheWeb).browser
    initial_items = browser.execute_script("""
        return document.querySelectorAll('.cart-item').length;
    """)
    
    assert initial_items > 0, "Cart should have at least one item"
    
    # When - Click remove first item
    actor.attempts_to(
        VallmereCartPage.click_remove_first_item()
    )
    
    time.sleep(1.5)
    
    # Then - Verify item was removed
    final_items = browser.execute_script("""
        return document.querySelectorAll('.cart-item').length;
    """)
    
    assert final_items < initial_items, f"Item count should decrease. Initial: {initial_items}, Final: {final_items}"

