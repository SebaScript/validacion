"""
Test 37 - Guards - Unauthorized Admin Access
Verifies that unauthorized users cannot access admin panel
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb


def test_37_guards_unauthorized_admin(actor):
    """
    Scenario: Non-admin user tries to access admin panel
    Given the user is not logged in as admin
    When the user tries to access admin panel directly
    Then the user should be redirected to admin login
    """
    # Given/When - Try to access admin panel without login
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/admin")
    )
    
    time.sleep(1.5)
    
    # Then - Verify redirected to admin login
    browser = actor.ability_to(BrowseTheWeb).browser
    assert "/admin-login" in browser.current_url, "Should be redirected to admin login"

