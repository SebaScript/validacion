"""
Test 05 - Auth - Signup Success
Verifies that a new user can successfully register with valid information
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_signup_page import VallmereSignUpPage


def test_05_signup_success(actor):
    """
    Scenario: User successfully signs up with valid data
    Given the user is on the signup page
    When the user enters all required information with a unique email
    And clicks the signup button
    Then a success toast should be displayed
    """
    # Generate unique email using timestamp
    unique_email = f"newuser{int(time.time())}@vallmere.com"
    
    # Given - Open the signup page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/sign-up"),
        VallmereSignUpPage.wait_for_name_field()
    )
    
    # When - Enter valid signup information with unique email
    actor.attempts_to(
        VallmereSignUpPage.enter_name("New User E2E"),
        VallmereSignUpPage.enter_email(unique_email),
        VallmereSignUpPage.enter_password("password123"),
        VallmereSignUpPage.enter_confirm_password("password123"),
        VallmereSignUpPage.click_signup_button()
    )
    
    # Brief pause to allow registration processing
    time.sleep(1.5)
    
    # Then - Verify success toast appears
    actor.attempts_to(
        VallmereSignUpPage.success_toast_is_visible()
    )

