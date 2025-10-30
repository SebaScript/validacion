"""
Test 11 - Product - Open Size Guide Modal
Verifies that the size guide modal opens correctly
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_product_page import VallmereProductPage


def test_11_product_modal_size_guide(actor):
    """
    Scenario: User opens size guide modal
    Given the user is on a product detail page
    When the user clicks on "SIZE GUIDE" link
    Then the modal should open with the size guide information
    """
    # Given - Open product page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/product/5"),
        VallmereProductPage.wait_for_product_detail()
    )
    
    # When - Click SIZE GUIDE link
    actor.attempts_to(
        VallmereProductPage.click_size_guide()
    )
    
    time.sleep(0.5)
    
    # Then - Verify modal is visible with correct title
    actor.attempts_to(
        VallmereProductPage.modal_is_visible(),
        VallmereProductPage.modal_title_is("Size Guide")
    )
    
    # Close modal
    actor.attempts_to(
        VallmereProductPage.close_modal()
    )

