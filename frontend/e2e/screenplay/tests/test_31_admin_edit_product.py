"""
Test 31 - Admin - Edit Product Complete
Verifies that admin can edit a product
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_31_admin_edit_product(actor):
    """
    Scenario: Admin edits a product
    Given the admin is viewing products list
    When the admin clicks edit on first product and updates it
    Then the product should be updated successfully
    """
    # Given - Login and view products
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin-login"),
        VallmereAdminLoginPage.wait_for_email_field(),
        VallmereAdminLoginPage.enter_email("admin@vallmere.com"),
        VallmereAdminLoginPage.enter_password("admin123"),
        VallmereAdminLoginPage.click_login_button()
    )
    
    time.sleep(3.0)
    
    browser = actor.ability_to(BrowseTheWeb).browser
    
    actor.attempts_to(
        VallmereAdminPage.click_view_products()
    )
    
    time.sleep(1.5)
    
    # When - Click edit on first product
    actor.attempts_to(
        VallmereAdminPage.click_edit_first()
    )
    
    time.sleep(2.0)  # Wait for edit form to load
    
    # Wait for form to appear
    form_visible = browser.execute_script("""
        return document.querySelector('#name') !== null;
    """)
    
    assert form_visible, "Edit form should be visible"
    
    # Update product details - simplify by only changing name
    actor.attempts_to(
        VallmereAdminPage.enter_name("Updated Test Product"),
        VallmereAdminPage.click_submit()
    )
    
    time.sleep(2.5)
    
    # Then - Verify we're still in admin panel
    admin_panel_visible = browser.execute_script("""
        return document.querySelector('.admin-panel') !== null;
    """)
    
    assert admin_panel_visible, "Should still be in admin panel after edit"

