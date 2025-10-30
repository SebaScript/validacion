"""
Test 14 - Cart - Empty Cart State (Initial)
Verifies that empty cart shows appropriate message
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_cart_page import VallmereCartPage
from pages.vallmere_header_page import VallmereHeaderPage


def test_14_cart_empty_state(actor):
    """
    Scenario: User opens cart when it's empty
    Given the cart is empty (clear localStorage)
    When the user clicks on the cart icon
    Then the empty cart message should be displayed
    """
    # Given - Clear localStorage and open homepage
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/")
    )
    
    browser = actor.ability_to(BrowseTheWeb).browser
    browser.execute_script("localStorage.clear();")
    browser.refresh()
    
    # Wait for header
    time.sleep(1.0)
    actor.attempts_to(
        VallmereHeaderPage.wait_for_header()
    )
    
    # When - Click cart icon
    actor.attempts_to(
        VallmereCartPage.click_cart_icon()
    )
    
    time.sleep(1.5)  # Wait for cart animation
    
    # Then - Verify empty cart message with JavaScript check
    browser = actor.ability_to(BrowseTheWeb).browser
    empty_cart_visible = browser.execute_script("""
        const emptyCart = document.querySelector('.empty-cart');
        return emptyCart && window.getComputedStyle(emptyCart).display !== 'none';
    """)
    
    assert empty_cart_visible, "Empty cart message should be visible"

