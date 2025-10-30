"""
Test 03 - Auth - Login Validation (Invalid Email)
Verifies that the login form shows validation error for invalid email format
"""
import time
from screenpy_selenium.actions import Open, Click
from pages.vallmere_login_page import VallmereLoginPage


def test_03_login_validation_invalid_email(actor):
    """
    Scenario: Login form validation with invalid email format
    Given the user is on the login page
    When the user enters an invalid email format
    And moves focus to trigger validation
    Then an error message should indicate invalid email
    """
    # Given - Open the login page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/login"),
        VallmereLoginPage.wait_for_email_field()
    )
    
    # When - Enter invalid email format and trigger validation by moving focus
    actor.attempts_to(
        VallmereLoginPage.enter_email("notanemail"),
        VallmereLoginPage.enter_password("test123"),
        Click.on(VallmereLoginPage.EMAIL_FIELD),  # Click email field
        Click.on(VallmereLoginPage.PASSWORD_FIELD)  # Then click password to trigger validation
    )
    
    # Brief pause to allow validation to display
    time.sleep(0.3)
    
    # Then - Verify error message contains "valid email"
    actor.attempts_to(
        VallmereLoginPage.error_message_contains("Please enter a valid email")
    )

