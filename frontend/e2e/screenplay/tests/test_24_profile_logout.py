"""
Test 24 - Profile - Logout
Verifies that user can logout successfully
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_login_page import VallmereLoginPage
from pages.vallmere_profile_page import VallmereProfilePage


def test_24_profile_logout(actor):
    """
    Scenario: User logs out
    Given the user is on the profile page
    When the user clicks logout button
    Then the user should be redirected to login page
    """
    # Given - Login
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/login"),
        VallmereLoginPage.wait_for_email_field(),
        VallmereLoginPage.enter_email("cliente@vallmere.com"),
        VallmereLoginPage.enter_password("cliente123"),
        VallmereLoginPage.click_login_button()
    )
    
    time.sleep(2.0)
    
    # When - Logout
    actor.attempts_to(
        VallmereProfilePage.wait_for_profile_container(),
        VallmereProfilePage.click_logout()
    )
    
    time.sleep(1.5)
    
    # Then - Verify redirected to login
    browser = actor.ability_to(BrowseTheWeb).browser
    assert "/login" in browser.current_url, "Should be redirected to login page"

