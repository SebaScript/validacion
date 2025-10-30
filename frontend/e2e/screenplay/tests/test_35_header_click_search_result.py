"""
Test 35 - Header - Click Search Result
Verifies that clicking on search result navigates to product
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_header_page import VallmereHeaderPage
from pages.vallmere_product_page import VallmereProductPage


def test_35_header_click_search_result(actor):
    """
    Scenario: User clicks on a search result
    Given the user has search results displayed
    When the user clicks on first result
    Then the user should be navigated to product detail page
    """
    # Given - Open homepage and search
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/")
    )
    
    time.sleep(1.0)
    
    actor.attempts_to(
        VallmereHeaderPage.wait_for_header(),
        VallmereHeaderPage.enter_search_term("wallet")
    )
    
    time.sleep(1.0)
    
    # When - Click first search result
    actor.attempts_to(
        VallmereHeaderPage.search_results_item_is_visible(),
        VallmereHeaderPage.click_first_search_result()
    )
    
    time.sleep(1.5)
    
    # Then - Verify navigated to product page
    browser = actor.ability_to(BrowseTheWeb).browser
    assert "/product/" in browser.current_url, "Should navigate to product page"
    
    actor.attempts_to(
        VallmereProductPage.product_detail_is_visible()
    )

