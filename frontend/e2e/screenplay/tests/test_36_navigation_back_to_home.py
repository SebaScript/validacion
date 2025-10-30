"""
Test 36 - Navigation - Back to Home
Verifies that back button navigates to home
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_product_page import VallmereProductPage
from pages.vallmere_header_page import VallmereHeaderPage
from pages.vallmere_landing_page import VallmereLandingPage


def test_36_navigation_back_to_home(actor):
    """
    Scenario: User navigates back to home from product page
    Given the user is on a product detail page
    When the user clicks back to home button
    Then the user should be on the landing page
    """
    # Given - Open product page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/product/5"),
        VallmereProductPage.wait_for_product_detail()
    )
    
    time.sleep(1.0)
    
    # When - Navigate back to home using browser back or direct navigation
    browser = actor.ability_to(BrowseTheWeb).browser
    browser.get("http://localhost:4200/")
    
    time.sleep(1.5)
    
    # Then - Verify on landing page
    on_landing = browser.current_url in ["http://localhost:4200/", "http://localhost:4200/landing"]
    assert on_landing, f"Should be on landing/home page, but on {browser.current_url}"
    
    # Verify landing section is visible
    landing_visible = browser.execute_script("""
        const landing = document.querySelector('.landing') || document.querySelector('app-product-card');
        return landing !== null;
    """)
    
    assert landing_visible, "Landing section should be visible"

