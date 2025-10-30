"""
Test 33 - Admin - Logout
Verifies that admin can logout successfully
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_33_admin_logout(actor):
    """
    Scenario: Admin logs out
    Given the admin is on the admin panel
    When the admin clicks logout
    Then the admin should be redirected to admin login page
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
    
    # When - Logout
    actor.attempts_to(
        VallmereAdminPage.wait_for_admin_panel(),
        VallmereAdminPage.click_logout()
    )
    
    time.sleep(1.5)
    
    # Then - Verify redirected to admin login
    browser = actor.ability_to(BrowseTheWeb).browser
    assert "/admin-login" in browser.current_url, "Should be redirected to admin login page"

