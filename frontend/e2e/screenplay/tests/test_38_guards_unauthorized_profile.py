"""
Test 38 - Guards - Unauthorized Profile Access
Verifies that unauthorized users cannot access profile
"""
import time
from screenpy_selenium.actions import Open
from screenpy_selenium.abilities import BrowseTheWeb


def test_38_guards_unauthorized_profile(actor):
    """
    Scenario: Unauthenticated user tries to access profile
    Given the user is not logged in
    When the user tries to access profile directly
    Then the user should be redirected to login
    """
    # Given/When - Try to access profile without login
    actor.attempts_to(
        Open.browser_on("http://localhost:4200/profile")
    )
    
    time.sleep(1.5)
    
    # Then - Verify redirected to login
    browser = actor.ability_to(BrowseTheWeb).browser
    assert "/login" in browser.current_url, "Should be redirected to login page"

