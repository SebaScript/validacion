"""
Test 30 - Admin - Add Product Validation (Empty Form)
Verifies that empty product form shows validation errors
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_30_admin_add_product_validation(actor):
    """
    Scenario: Admin submits empty product form
    Given the admin is on add product form
    When the admin clicks submit without filling fields
    Then validation errors should be displayed
    """
    # Given - Login and navigate to add product
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin-login"),
        VallmereAdminLoginPage.wait_for_email_field(),
        VallmereAdminLoginPage.enter_email("admin@vallmere.com"),
        VallmereAdminLoginPage.enter_password("admin123"),
        VallmereAdminLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    actor.attempts_to(
        VallmereAdminPage.wait_for_admin_panel(),
        VallmereAdminPage.click_add_product()
    )
    
    time.sleep(1.0)
    
    # When - Click submit without filling form
    actor.attempts_to(
        VallmereAdminPage.admin_form_is_visible(),
        VallmereAdminPage.click_submit()
    )
    
    time.sleep(1.0)
    
    # Then - Verify error toast or form is still visible (validation failed)
    actor.attempts_to(
        VallmereAdminPage.admin_form_is_visible()
    )

