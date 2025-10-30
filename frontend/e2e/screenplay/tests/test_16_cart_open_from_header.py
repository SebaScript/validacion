"""
Test 16 - Cart - Open Cart from Header
Verifies that cart can be opened from header after adding items
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_product_page import VallmereProductPage
from pages.vallmere_cart_page import VallmereCartPage
from pages.vallmere_header_page import VallmereHeaderPage
from pages.vallmere_login_page import VallmereLoginPage


def test_16_cart_open_from_header(actor):
    """
    Scenario: User opens cart from header after adding product
    Given the user is logged in and adds a product to cart
    When the user navigates to home and clicks cart icon
    Then the cart should open showing the cart header
    """
    # Given - Login and add product to cart
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
    
    # When - Navigate to home and open cart
    browser.get("http://localhost:4200/")
    
    actor.attempts_to(
        VallmereHeaderPage.wait_for_header()
    )
    
    actor.attempts_to(
        VallmereCartPage.click_cart_icon()
    )
    
    time.sleep(1.5)  # Wait for cart animation
    
    # Then - Verify cart is visible with JavaScript
    browser = actor.ability_to(BrowseTheWeb).browser
    cart_open = browser.execute_script("""
        const cart = document.querySelector('.cart-container');
        return cart && cart.classList.contains('show');
    """)
    
    assert cart_open, "Cart should be open and visible"
    
    # Verify header text
    header_text = browser.execute_script("""
        const header = document.querySelector('.cart-header h3');
        return header ? header.textContent.trim() : null;
    """)
    
    assert header_text and "Shopping Cart" in header_text, f"Expected 'Shopping Cart', got: {header_text}"

