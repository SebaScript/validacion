"""
Test 21 - Profile - Edit Mode Toggle
Verifies that edit profile mode can be toggled
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_login_page import VallmereLoginPage
from pages.vallmere_profile_page import VallmereProfilePage


def test_21_profile_edit_mode_toggle(actor):
    """
    Scenario: User toggles edit profile mode
    Given the user is on the profile page
    When the user clicks edit profile button
    Then the profile form should appear
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
    
    # When - Click edit profile
    actor.attempts_to(
        VallmereProfilePage.wait_for_profile_container(),
        VallmereProfilePage.click_edit_profile()
    )
    
    time.sleep(0.5)
    
    # Then - Verify form is visible
    actor.attempts_to(
        VallmereProfilePage.profile_form_is_visible(),
        VallmereProfilePage.name_field_is_visible()
    )

