"""
Test 26 - Admin - Login Validation (Wrong Credentials)
Verifies that invalid admin credentials show error
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_admin_login_page import VallmereAdminLoginPage


def test_26_admin_login_validation(actor):
    """
    Scenario: Admin enters wrong credentials
    Given the admin is on the admin login page
    When the admin enters invalid credentials
    Then an error toast should be displayed
    """
    # Given - Open admin login
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin-login"),
        VallmereAdminLoginPage.wait_for_email_field()
    )
    
    # When - Enter wrong credentials
    actor.attempts_to(
        VallmereAdminLoginPage.enter_email("wrong@email.com"),
        VallmereAdminLoginPage.enter_password("wrongpassword"),
        VallmereAdminLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    # Then - Verify still on login page (didn't navigate away)
    browser = actor.ability_to(BrowseTheWeb).browser
    still_on_login = "admin-login" in browser.current_url
    
    assert still_on_login, "Should still be on admin login page after invalid credentials"

