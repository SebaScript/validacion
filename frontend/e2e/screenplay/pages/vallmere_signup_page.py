"""
Vallmere Sign Up Page
Page Object following ScreenPlay pattern for the signup/registration page
"""
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By

from questions.browser_url import BrowserURL


class VallmereSignUpPage:
    """Page Object for Vallmere Sign Up Page"""
    
    # Locators - Using selectors from the Angular sign-up component
    NAME_FIELD = Target.the("name field").located_by((By.ID, "name"))
    EMAIL_FIELD = Target.the("email field").located_by((By.ID, "email"))
    PASSWORD_FIELD = Target.the("password field").located_by((By.ID, "password"))
    RE_PASSWORD_FIELD = Target.the("confirm password field").located_by((By.ID, "rePassword"))
    SIGNUP_BUTTON = Target.the("signup button").located_by((By.CSS_SELECTOR, "button.signup-btn"))
    
    # Messages
    SUCCESS_TOAST = Target.the("success toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-success"))
    ERROR_MESSAGE = Target.the("error message").located_by((By.CSS_SELECTOR, ".error-message"))
    ERROR_MESSAGE_SMALL = Target.the("error message text").located_by((By.CSS_SELECTOR, ".error-message small"))
    
    @staticmethod
    def enter_name(name: str):
        """Enter name in the name field"""
        return Enter.the_text(name).into(VallmereSignUpPage.NAME_FIELD)
    
    @staticmethod
    def enter_email(email: str):
        """Enter email in the email field"""
        return Enter.the_text(email).into(VallmereSignUpPage.EMAIL_FIELD)
    
    @staticmethod
    def enter_password(password: str):
        """Enter password in the password field"""
        return Enter.the_text(password).into(VallmereSignUpPage.PASSWORD_FIELD)
    
    @staticmethod
    def enter_confirm_password(password: str):
        """Enter password in the confirm password field"""
        return Enter.the_text(password).into(VallmereSignUpPage.RE_PASSWORD_FIELD)
    
    @staticmethod
    def click_signup_button():
        """Click the signup button"""
        return Click.on(VallmereSignUpPage.SIGNUP_BUTTON)
    
    @staticmethod
    def wait_for_name_field():
        """Wait for the name field to be visible"""
        return Wait.for_the(VallmereSignUpPage.NAME_FIELD).to_appear()
    
    @staticmethod
    def wait_for_success_toast():
        """Wait for success toast to appear"""
        return Wait.for_the(VallmereSignUpPage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def success_toast_is_visible():
        """Assert that success toast is visible"""
        return Wait.for_the(VallmereSignUpPage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def error_message_contains(text: str):
        """Assert that error message contains specific text"""
        return See.the(Text.of(VallmereSignUpPage.ERROR_MESSAGE_SMALL), ContainsTheText(text))
    
    @staticmethod
    def click_email_field():
        """Click on email field (for triggering validation)"""
        return Click.on(VallmereSignUpPage.EMAIL_FIELD)

