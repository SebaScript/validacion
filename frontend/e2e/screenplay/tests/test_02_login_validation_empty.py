"""
Test 02 - Auth - Login Validation (Empty Fields)
Verifies that the login form shows validation errors when submitted with empty fields
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_login_page import VallmereLoginPage


def test_02_login_validation_empty(actor):
    """
    Scenario: Login form validation with empty fields
    Given the user is on the login page
    When the user clicks login without entering any credentials
    Then an error message should be displayed
    """
    # Given - Open the login page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/login"),
        VallmereLoginPage.wait_for_email_field()
    )
    
    # When - Click login button without entering any data
    actor.attempts_to(
        VallmereLoginPage.click_login_button()
    )
    
    # Brief pause to allow validation to display
    time.sleep(0.5)
    
    # Then - Verify error message appears
    actor.attempts_to(
        VallmereLoginPage.error_message_is_visible()
    )

