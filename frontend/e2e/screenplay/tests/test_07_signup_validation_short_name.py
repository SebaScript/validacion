"""
Test 07 - Auth - Signup Validation (Short Name)
Verifies that the signup form validates minimum name length
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_signup_page import VallmereSignUpPage


def test_07_signup_validation_short_name(actor):
    """
    Scenario: Signup form validation with name too short
    Given the user is on the signup page
    When the user enters a name shorter than minimum required length
    And moves focus to trigger validation
    Then an error message should indicate name must be at least 3 characters
    """
    # Given - Open the signup page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/sign-up"),
        VallmereSignUpPage.wait_for_name_field()
    )
    
    # When - Enter a name that's too short (only 2 characters)
    actor.attempts_to(
        VallmereSignUpPage.enter_name("AB"),
        VallmereSignUpPage.click_email_field()  # Move focus to trigger validation
    )
    
    # Brief pause to allow validation to display
    time.sleep(0.3)
    
    # Then - Verify error message about minimum name length
    actor.attempts_to(
        VallmereSignUpPage.error_message_contains("NAME MUST BE AT LEAST 3 CHARACTERS")
    )

