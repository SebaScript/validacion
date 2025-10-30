"""
Test 25 - Admin - Login Success
Verifies that admin can login successfully
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_admin_login_page import VallmereAdminLoginPage
from pages.vallmere_admin_page import VallmereAdminPage


def test_25_admin_login_success(actor):
    """
    Scenario: Admin logs in successfully
    Given the admin is on the admin login page
    When the admin enters valid credentials
    Then the admin should be redirected to admin panel
    """
    # Given - Open admin login
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin-login"),
        VallmereAdminLoginPage.wait_for_email_field()
    )
    
    # When - Enter credentials and login
    actor.attempts_to(
        VallmereAdminLoginPage.enter_email("admin@vallmere.com"),
        VallmereAdminLoginPage.enter_password("admin123"),
        VallmereAdminLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    # Then - Verify admin panel is visible
    actor.attempts_to(
        VallmereAdminPage.wait_for_admin_panel(),
        VallmereAdminPage.admin_sidebar_is_visible()
    )

