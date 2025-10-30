"""
Test 27 - Admin - View Products List
Verifies that admin can view products list
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_27_admin_view_products(actor):
    """
    Scenario: Admin views products list
    Given the admin is logged in
    When the admin clicks on view products
    Then the products table should be displayed
    """
    # Given - Login as admin
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin-login"),
        VallmereAdminLoginPage.wait_for_email_field(),
        VallmereAdminLoginPage.enter_email("admin@vallmere.com"),
        VallmereAdminLoginPage.enter_password("admin123"),
        VallmereAdminLoginPage.click_login_button()
    )
    
    time.sleep(3.0)  # Wait longer for admin panel to load
    
    # When - Click view products (should be selected by default)
    browser = actor.ability_to(BrowseTheWeb).browser
    admin_panel_visible = browser.execute_script("""
        return document.querySelector('.admin-panel') !== null;
    """)
    
    assert admin_panel_visible, "Admin panel should be visible after login"
    
    actor.attempts_to(
        VallmereAdminPage.click_view_products()
    )
    
    time.sleep(1.5)
    
    # Then - Verify table is visible with JS
    table_visible = browser.execute_script("""
        const table = document.querySelector('.admin-table-container table');
        return table !== null;
    """)
    
    assert table_visible, "Admin products table should be visible"

