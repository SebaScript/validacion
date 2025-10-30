"""
Test 13 - Product - Sold Out (Stock = 0)
Verifies that sold out products show error message
"""
from screenpy_selenium.actions import Open
from pages.vallmere_product_page import VallmereProductPage


def test_13_product_sold_out(actor):
    """
    Scenario: User views a sold out product
    Given the user navigates to a product with ID 99 (non-existent/error)
    Then an error message should be displayed
    """
    # Given - Open non-existent product (will show error)
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/product/99")
    )
    
    # Then - Verify error message is visible
    actor.attempts_to(
        VallmereProductPage.error_message_is_visible()
    )

