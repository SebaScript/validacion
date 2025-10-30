"""
Test 12 - Product - Open Shipping Policy Modal
Verifies that the shipping policy modal opens correctly
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_product_page import VallmereProductPage


def test_12_product_modal_shipping(actor):
    """
    Scenario: User opens shipping policy modal
    Given the user is on a product detail page
    When the user clicks on "SHIPPING POLICY" link
    Then the modal should open with shipping policy information
    """
    # Given - Open product page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/product/5"),
        VallmereProductPage.wait_for_product_detail()
    )
    
    # When - Click SHIPPING POLICY link
    actor.attempts_to(
        VallmereProductPage.click_shipping_policy()
    )
    
    time.sleep(0.5)
    
    # Then - Verify modal is visible with correct title
    actor.attempts_to(
        VallmereProductPage.modal_is_visible(),
        VallmereProductPage.modal_title_is("Shipping & Returns")
    )
    
    # Close modal
    actor.attempts_to(
        VallmereProductPage.close_modal()
    )

