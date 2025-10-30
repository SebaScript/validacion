"""
Vallmere Login Page - Client Login
Page Object following ScreenPlay pattern for the client login page
"""
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


class VallmereLoginPage:
    """Page Object for Vallmere Client Login Page"""
    
    # Locators - Using selectors from the Angular component
    EMAIL_FIELD = Target.the("email field").located_by((By.ID, "email"))
    PASSWORD_FIELD = Target.the("password field").located_by((By.ID, "password"))
    LOGIN_BUTTON = Target.the("login button").located_by((By.CSS_SELECTOR, "button.login-btn"))
    
    # Success and error messages
    SUCCESS_TOAST = Target.the("success toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-success"))
    ERROR_TOAST = Target.the("error toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-error"))
    ERROR_MESSAGE = Target.the("error message").located_by((By.CSS_SELECTOR, ".error-message"))
    ERROR_MESSAGE_SMALL = Target.the("error message text").located_by((By.CSS_SELECTOR, ".error-message small"))
    
    # After login elements
    PROFILE_CONTAINER = Target.the("profile container").located_by((By.CSS_SELECTOR, ".profile-container"))
    
    @staticmethod
    def enter_email(email: str):
        """Enter email in the email field"""
        return Enter.the_text(email).into(VallmereLoginPage.EMAIL_FIELD)
    
    @staticmethod
    def enter_password(password: str):
        """Enter password in the password field"""
        return Enter.the_text(password).into(VallmereLoginPage.PASSWORD_FIELD)
    
    @staticmethod
    def click_login_button():
        """Click the login button"""
        return Click.on(VallmereLoginPage.LOGIN_BUTTON)
    
    @staticmethod
    def wait_for_email_field():
        """Wait for the email field to be visible"""
        return Wait.for_the(VallmereLoginPage.EMAIL_FIELD).to_appear()
    
    @staticmethod
    def wait_for_success_toast():
        """Wait for success toast to appear"""
        return Wait.for_the(VallmereLoginPage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def wait_for_error_toast():
        """Wait for error toast to appear"""
        return Wait.for_the(VallmereLoginPage.ERROR_TOAST).to_appear()
    
    @staticmethod
    def success_toast_is_visible():
        """Assert that success toast is visible"""
        return Wait.for_the(VallmereLoginPage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def error_toast_is_visible():
        """Assert that error toast is visible"""
        return Wait.for_the(VallmereLoginPage.ERROR_TOAST).to_appear()
    
    @staticmethod
    def error_message_is_visible():
        """Assert that error message is visible"""
        return Wait.for_the(VallmereLoginPage.ERROR_MESSAGE).to_appear()
    
    @staticmethod
    def error_message_contains(text: str):
        """Assert that error message contains specific text"""
        return See.the(Text.of(VallmereLoginPage.ERROR_MESSAGE_SMALL), ContainsTheText(text))
    
    @staticmethod
    def profile_container_is_visible():
        """Assert that profile container is visible after login"""
        return Wait.for_the(VallmereLoginPage.PROFILE_CONTAINER).to_appear()

