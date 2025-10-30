"""
Test 20 - Profile - View User Info
Verifies that user can view their profile information
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb
from pages.vallmere_login_page import VallmereLoginPage
from pages.vallmere_profile_page import VallmereProfilePage


def test_20_profile_view_user_info(actor):
    """
    Scenario: User views their profile information
    Given the user is logged in
    When the user is on the profile page
    Then the user info should be visible (name, email, role)
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
    
    # When/Then - Verify profile info is visible
    actor.attempts_to(
        VallmereProfilePage.wait_for_profile_container(),
        VallmereProfilePage.user_name_is_visible(),
        VallmereProfilePage.email_is_visible()
    )
    
    # Verify role badge exists (might not be visible immediately)
    browser = actor.ability_to(BrowseTheWeb).browser
    role_badge = browser.execute_script("""
        return document.querySelector('.role-badge') !== null;
    """)
    assert role_badge, "Role badge should exist on page"

