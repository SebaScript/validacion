"""
Test 29 - Admin - Navigate to Add Product
Verifies that admin can navigate to add product form
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_29_admin_navigate_add_product(actor):
    """
    Scenario: Admin navigates to add product form
    Given the admin is logged in
    When the admin clicks on add product
    Then the product form should be displayed
    """
    # Given - Login as admin
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin-login"),
        VallmereAdminLoginPage.wait_for_email_field(),
        VallmereAdminLoginPage.enter_email("admin@vallmere.com"),
        VallmereAdminLoginPage.enter_password("admin123"),
        VallmereAdminLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    # When - Click add product
    actor.attempts_to(
        VallmereAdminPage.wait_for_admin_panel(),
        VallmereAdminPage.click_add_product()
    )
    
    time.sleep(1.0)
    
    # Then - Verify form is visible
    actor.attempts_to(
        VallmereAdminPage.admin_form_is_visible(),
        VallmereAdminPage.name_field_is_visible()
    )

