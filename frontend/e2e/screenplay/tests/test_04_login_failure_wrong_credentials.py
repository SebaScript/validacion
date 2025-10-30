"""
Test 04 - Auth - Login Failure (Wrong Credentials)
Verifies that login fails with incorrect credentials and shows error toast
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_login_page import VallmereLoginPage


def test_04_login_failure_wrong_credentials(actor):
    """
    Scenario: Login fails with wrong credentials
    Given the user is on the login page
    When the user enters invalid credentials
    And clicks the login button
    Then an error toast should be displayed
    """
    # Given - Open the login page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/login"),
        VallmereLoginPage.wait_for_email_field()
    )
    
    # When - Enter invalid credentials
    actor.attempts_to(
        VallmereLoginPage.enter_email("wrong@vallmere.com"),
        VallmereLoginPage.enter_password("wrongpass"),
        VallmereLoginPage.click_login_button()
    )
    
    # Brief pause to allow server response
    time.sleep(1.0)
    
    # Then - Verify error toast appears
    actor.attempts_to(
        VallmereLoginPage.error_toast_is_visible()
    )

