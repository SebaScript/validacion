"""
Test 01 - Auth - Login Success (Client)
Verifies that a valid client can successfully log in to the Vallmere application
"""
import time
from screenpy_selenium.actions import Open, Wait
from pages.vallmere_login_page import VallmereLoginPage


def test_01_login_success_client(actor):
    """
    Scenario: Client successfully logs in with valid credentials
    Given the user is on the login page
    When the user enters valid credentials
    And clicks the login button
    Then the user should see a success toast message
    And the profile container should be visible
    """
    # Given - Open the login page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/login"),
        VallmereLoginPage.wait_for_email_field()
    )
    
    # When - Enter valid client credentials
    actor.attempts_to(
        VallmereLoginPage.enter_email("cliente@vallmere.com"),
        VallmereLoginPage.enter_password("cliente123"),
        VallmereLoginPage.click_login_button()
    )
    
    # Brief pause to allow processing
    time.sleep(1.5)
    
    # Then - Verify success toast appears and user is redirected to profile
    actor.attempts_to(
        VallmereLoginPage.success_toast_is_visible(),
        VallmereLoginPage.profile_container_is_visible()
    )

