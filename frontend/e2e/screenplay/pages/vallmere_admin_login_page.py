"""
Vallmere Admin Login Page
Page Object following ScreenPlay pattern for the admin login page
"""
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.target import Target
from selenium.webdriver.common.by import By


class VallmereAdminLoginPage:
    """Page Object for Vallmere Admin Login Page"""
    
    # Locators - Using selectors from the Angular admin-login component
    EMAIL_FIELD = Target.the("email field").located_by((By.ID, "email"))
    PASSWORD_FIELD = Target.the("password field").located_by((By.ID, "password"))
    ADMIN_LOGIN_BUTTON = Target.the("admin login button").located_by((By.CSS_SELECTOR, "button.admin-login-btn"))
    
    # Admin panel elements (after successful login)
    ADMIN_PANEL = Target.the("admin panel").located_by((By.CSS_SELECTOR, ".admin-panel"))
    ADMIN_SIDEBAR = Target.the("admin sidebar").located_by((By.CSS_SELECTOR, ".admin-sidebar"))
    ADMIN_LOGIN_CONTAINER = Target.the("admin login container").located_by((By.CSS_SELECTOR, ".admin-login-container"))
    
    # Messages
    ERROR_TOAST = Target.the("error toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-error"))
    
    @staticmethod
    def enter_email(email: str):
        """Enter email in the email field"""
        return Enter.the_text(email).into(VallmereAdminLoginPage.EMAIL_FIELD)
    
    @staticmethod
    def enter_password(password: str):
        """Enter password in the password field"""
        return Enter.the_text(password).into(VallmereAdminLoginPage.PASSWORD_FIELD)
    
    @staticmethod
    def click_login_button():
        """Click the admin login button using JavaScript"""
        class ClickAdminLoginJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('button.admin-login-btn') || 
                                document.querySelector('button[type="submit"]');
                    if (btn) btn.click();
                """)
        return ClickAdminLoginJS()
    
    @staticmethod
    def click_admin_login_button():
        """Alias for click_login_button"""
        return VallmereAdminLoginPage.click_login_button()
    
    @staticmethod
    def wait_for_email_field():
        """Wait for the email field to be visible"""
        return Wait.for_the(VallmereAdminLoginPage.EMAIL_FIELD).to_appear()
    
    @staticmethod
    def wait_for_admin_panel():
        """Wait for admin panel to be visible (after login)"""
        return Wait.for_the(VallmereAdminLoginPage.ADMIN_PANEL).to_appear()
    
    @staticmethod
    def wait_for_error_toast():
        """Wait for error toast to appear"""
        return Wait.for_the(VallmereAdminLoginPage.ERROR_TOAST).to_appear()
    
    @staticmethod
    def admin_panel_is_visible():
        """Assert that admin panel is visible"""
        return Wait.for_the(VallmereAdminLoginPage.ADMIN_PANEL).to_appear()
    
    @staticmethod
    def admin_sidebar_is_visible():
        """Assert that admin sidebar is visible"""
        return Wait.for_the(VallmereAdminLoginPage.ADMIN_SIDEBAR).to_appear()
    
    @staticmethod
    def error_toast_is_visible():
        """Assert that error toast is visible"""
        return Wait.for_the(VallmereAdminLoginPage.ERROR_TOAST).to_appear()
    
    @staticmethod
    def admin_login_container_is_visible():
        """Assert that admin login container is visible"""
        return Wait.for_the(VallmereAdminLoginPage.ADMIN_LOGIN_CONTAINER).to_appear()

