"""
Test 09 - Products - Browse Landing Page
Verifies that the landing page displays product cards with all required information
"""
from screenpy_selenium.actions import Open
from pages.vallmere_landing_page import VallmereLandingPage


def test_09_browse_products_landing(actor):
    """
    Scenario: User browses products on the landing page
    Given the user is on the home/landing page
    Then product cards should be visible
    And each product card should display image, title, and price
    """
    # Given - Open the landing page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/"),
        VallmereLandingPage.wait_for_product_cards()
    )
    
    # Then - Verify product cards and their elements are visible
    actor.attempts_to(
        VallmereLandingPage.product_card_is_visible(),
        VallmereLandingPage.product_image_is_visible(),
        VallmereLandingPage.product_title_is_visible(),
        VallmereLandingPage.product_price_is_visible()
    )

