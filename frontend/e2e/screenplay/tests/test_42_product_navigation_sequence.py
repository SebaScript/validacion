"""
Test 42 - Navigation - Browse Multiple Products Sequence
Verifies that user can browse multiple products in sequence
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_landing_page import VallmereLandingPage
from pages.vallmere_product_page import VallmereProductPage


def test_42_product_navigation_sequence(actor):
    """
    Scenario: User browses through multiple products
    Given the user is on the landing page
    When the user clicks on first product, then navigates back, then clicks second product
    Then all navigation should work correctly
    """
    # Given - Open landing page
    browser = actor.ability_to(BrowseTheWeb).browser
    browser.get("http://localhost:4200/")
    
    time.sleep(1.5)
    
    # Wait for landing products
    products_visible = browser.execute_script("""
        return document.querySelector('app-product-card') !== null;
    """)
    
    assert products_visible, "Products should be visible on landing"
    
    time.sleep(1.0)
    
    # When - Click first product
    actor.attempts_to(
        VallmereLandingPage.click_first_product()
    )
    
    time.sleep(1.5)
    
    browser = actor.ability_to(BrowseTheWeb).browser
    assert "/product/" in browser.current_url, "Should be on product page"
    
    actor.attempts_to(
        VallmereProductPage.product_detail_is_visible()
    )
    
    # Navigate back to home
    browser.get("http://localhost:4200/")
    
    time.sleep(1.5)
    
    # Click second product (different method - scroll and click)
    browser.execute_script("window.scrollTo(0, 500);")
    time.sleep(0.5)
    
    browser.execute_script("""
        const products = document.querySelectorAll('.product-card');
        if (products.length > 1) {
            products[1].click();
        }
    """)
    
    time.sleep(1.5)
    
    # Then - Verify on another product page
    assert "/product/" in browser.current_url, "Should be on product page"
    actor.attempts_to(
        VallmereProductPage.product_detail_is_visible()
    )

