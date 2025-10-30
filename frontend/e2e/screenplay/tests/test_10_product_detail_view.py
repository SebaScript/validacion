"""
Test 10 - Product - Detail View & Carousel
Verifies that clicking a product shows the detailed product view with all information
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_landing_page import VallmereLandingPage
from pages.vallmere_product_page import VallmereProductPage


def test_10_product_detail_view(actor):
    """
    Scenario: User views product detail page
    Given the user is on the landing page
    When the user clicks on a product card
    Then the product detail view should be displayed
    And all product information should be visible (title, price, description)
    """
    # Given - Open the landing page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/"),
        VallmereLandingPage.wait_for_product_cards()
    )
    
    # When - Click on the first product card
    actor.attempts_to(
        VallmereLandingPage.click_first_product()
    )
    
    # Wait for product detail page to load
    actor.attempts_to(
        VallmereProductPage.wait_for_product_detail()
    )
    
    # Then - Verify product detail page displays all information
    actor.attempts_to(
        VallmereProductPage.product_detail_is_visible(),
        VallmereProductPage.product_title_is_visible(),
        VallmereProductPage.product_price_is_visible(),
        VallmereProductPage.product_description_is_visible()
    )
    
    # Brief pause to allow complete rendering
    time.sleep(0.5)

