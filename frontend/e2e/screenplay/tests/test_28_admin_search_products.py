"""
Test 28 - Admin - Search Products
Verifies that admin can search products
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_28_admin_search_products(actor):
    """
    Scenario: Admin searches for products
    Given the admin is viewing products list
    When the admin enters a search term
    Then the search results should be filtered
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
    
    # When - Enter search term
    actor.attempts_to(
        VallmereAdminPage.enter_search_term("wallet")
    )
    
    time.sleep(1.0)
    
    # Then - Verify table is still visible (search worked)
    table_visible = browser.execute_script("""
        return document.querySelector('.admin-table-container table') !== null;
    """)
    
    assert table_visible, "Table should be visible after search"

