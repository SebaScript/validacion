"""
Test 06 - Auth - Signup Validation (Password Mismatch)
Verifies that the signup form shows validation error when passwords don't match
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_signup_page import VallmereSignUpPage


def test_06_signup_validation_password_mismatch(actor):
    """
    Scenario: Signup form validation with mismatched passwords
    Given the user is on the signup page
    When the user enters different passwords in password and confirm password fields
    And clicks the signup button
    Then an error message should indicate passwords don't match
    """
    # Given - Open the signup page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/sign-up"),
        VallmereSignUpPage.wait_for_name_field()
    )
    
    # When - Enter data with mismatched passwords
    actor.attempts_to(
        VallmereSignUpPage.enter_name("Test User"),
        VallmereSignUpPage.enter_email("test@vallmere.com"),
        VallmereSignUpPage.enter_password("password123"),
        VallmereSignUpPage.enter_confirm_password("different123"),  # Different password
        VallmereSignUpPage.click_signup_button()
    )
    
    # Brief pause to allow validation to display
    time.sleep(0.8)
    
    # Then - Verify error message about password mismatch
    actor.attempts_to(
        VallmereSignUpPage.error_message_contains("Passwords do not match")
    )

