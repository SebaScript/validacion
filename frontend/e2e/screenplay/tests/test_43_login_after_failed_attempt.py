"""
Test 43 - Auth - Login Success After Failed Attempt
Verifies that user can login successfully after a failed attempt
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_login_page import VallmereLoginPage
from pages.vallmere_profile_page import VallmereProfilePage


def test_43_login_after_failed_attempt(actor):
    """
    Scenario: User logs in successfully after entering wrong credentials once
    Given the user is on the login page
    When the user enters wrong credentials first, then correct ones
    Then the user should be logged in successfully
    """
    # Given - Open login page
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/login"),
        VallmereLoginPage.wait_for_email_field()
    )
    
    # When - First attempt with wrong credentials
    actor.attempts_to(
        VallmereLoginPage.enter_email("wrong@email.com"),
        VallmereLoginPage.enter_password("wrongpass"),
        VallmereLoginPage.click_login_button()
    )
    
    time.sleep(1.5)
    
    # Error toast should appear
    actor.attempts_to(
        VallmereLoginPage.error_toast_is_visible()
    )
    
    time.sleep(1.0)
    
    # Clear fields and enter correct credentials
    browser = actor.ability_to(BrowseTheWeb).browser
    from selenium.webdriver.common.by import By
    email_field = browser.find_element(By.ID, "email")
    password_field = browser.find_element(By.ID, "password")
    
    email_field.clear()
    password_field.clear()
    
    actor.attempts_to(
        VallmereLoginPage.enter_email("cliente@vallmere.com"),
        VallmereLoginPage.enter_password("cliente123"),
        VallmereLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    # Then - Verify successful login
    assert "/profile" in browser.current_url, "Should be redirected to profile"
    actor.attempts_to(
        VallmereProfilePage.profile_container_is_visible()
    )

