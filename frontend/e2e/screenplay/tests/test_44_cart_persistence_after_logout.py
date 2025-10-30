"""
Test 44 - Cart - Cart Persistence After Logout and Re-login
Verifies that cart items persist after logout and re-login
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_product_page import VallmereProductPage
from pages.vallmere_cart_page import VallmereCartPage
from pages.vallmere_login_page import VallmereLoginPage
from pages.vallmere_profile_page import VallmereProfilePage


def test_44_cart_persistence_after_logout(actor):
    """
    Scenario: User's cart persists after logout and re-login
    Given the user is logged in and has items in cart
    When the user logs out and logs back in
    Then the cart items should still be present
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
    
    # Get initial cart count
    initial_cart_count = browser.execute_script("""
        const cartItems = JSON.parse(localStorage.getItem('vallmere_cart_items') || '[]');
        return cartItems.length;
    """)
    
    assert initial_cart_count > 0, "Cart should have at least one item"
    
    # When - Logout
    browser.get("http://localhost:4200/profile")
    time.sleep(1.0)
    
    actor.attempts_to(
        VallmereProfilePage.wait_for_profile_container(),
        VallmereProfilePage.click_logout()
    )
    
    time.sleep(1.5)
    
    # Re-login
    actor.attempts_to(
        VallmereLoginPage.wait_for_email_field(),
        VallmereLoginPage.enter_email("cliente@vallmere.com"),
        VallmereLoginPage.enter_password("cliente123"),
        VallmereLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    # Then - Verify cart still has items
    final_cart_count = browser.execute_script("""
        const cartItems = JSON.parse(localStorage.getItem('vallmere_cart_items') || '[]');
        return cartItems.length;
    """)
    
    assert final_cart_count >= initial_cart_count, f"Cart should persist. Initial: {initial_cart_count}, Final: {final_cart_count}"
    
    # Just verify localStorage persisted
    # (Cart persistence is verified by localStorage check above)

