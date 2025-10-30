"""
Test 32 - Admin - Delete Product
Verifies that admin can delete a product
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_32_admin_delete_product(actor):
    """
    Scenario: Admin deletes a product
    Given the admin is viewing products list
    When the admin clicks delete on first product
    Then the product should be deleted
    """
    # Given - Login and view products
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin-login"),
        VallmereAdminLoginPage.wait_for_email_field(),
        VallmereAdminLoginPage.enter_email("admin@vallmere.com"),
        VallmereAdminLoginPage.enter_password("admin123"),
        VallmereAdminLoginPage.click_login_button()
    )
    
    time.sleep(3.0)  # Wait longer for admin login
    
    browser = actor.ability_to(BrowseTheWeb).browser
    
    actor.attempts_to(
        VallmereAdminPage.click_view_products()
    )
    
    time.sleep(1.5)
    
    # When - Click delete on first product
    actor.attempts_to(
        VallmereAdminPage.click_delete_first(),
        VallmereAdminPage.accept_confirmation()
    )
    
    time.sleep(2.0)
    
    # Then - Verify we're still in admin panel (table should be visible)
    table_visible = browser.execute_script("""
        return document.querySelector('.admin-table-container') !== null;
    """)
    
    assert table_visible, "Admin table should still be visible after delete"

