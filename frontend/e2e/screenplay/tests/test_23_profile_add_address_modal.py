"""
Test 23 - Profile - Add Address Modal
Verifies that add address modal can be opened
"""
import time
from screenpy_selenium.actions import Open
from pages.vallmere_login_page import VallmereLoginPage
from pages.vallmere_profile_page import VallmereProfilePage


def test_23_profile_add_address_modal(actor):
    """
    Scenario: User opens add address modal
    Given the user is on the profile page
    When the user clicks add address button
    Then the address form modal should appear
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
    
    # When - Click add address
    actor.attempts_to(
        VallmereProfilePage.wait_for_profile_container(),
        VallmereProfilePage.click_add_address()
    )
    
    time.sleep(0.5)
    
    # Then - Verify address form is visible
    actor.attempts_to(
        VallmereProfilePage.address_form_is_visible()
    )

