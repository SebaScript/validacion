"""
Test 34 - Header - Search Products
Verifies that products can be searched from header
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_header_page import VallmereHeaderPage


def test_34_header_search_products(actor):
    """
    Scenario: User searches for products in header
    Given the user is on the homepage
    When the user types a search term in the header
    Then search results should appear
    """
    # Given - Open homepage
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/")
    )
    
    time.sleep(1.0)
    
    # When - Enter search term
    actor.attempts_to(
        VallmereHeaderPage.wait_for_header(),
        VallmereHeaderPage.enter_search_term("wallet")
    )
    
    time.sleep(1.0)
    
    # Then - Verify search results are visible
    actor.attempts_to(
        VallmereHeaderPage.search_results_are_visible(),
        VallmereHeaderPage.search_results_item_is_visible()
    )

