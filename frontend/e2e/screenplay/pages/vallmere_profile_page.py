"""
Vallmere Profile Page
Page Object following ScreenPlay pattern for user profile
"""
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By


class VallmereProfilePage:
    """Page Object for Vallmere User Profile"""
    
    # Profile container
    PROFILE_CONTAINER = Target.the("profile container").located_by((By.CSS_SELECTOR, ".profile-container"))
    USER_DETAILS = Target.the("user details").located_by((By.CSS_SELECTOR, ".user-details"))
    USER_NAME = Target.the("user name").located_by((By.CSS_SELECTOR, ".user-details h1"))
    EMAIL = Target.the("email").located_by((By.CSS_SELECTOR, ".email"))
    ROLE_BADGE = Target.the("role badge").located_by((By.CSS_SELECTOR, ".role-badge"))
    
    # Edit profile
    EDIT_PROFILE_BTN = Target.the("edit profile button").located_by((By.XPATH, "//button[contains(.,'Edit Profile')]"))
    PROFILE_FORM = Target.the("profile form").located_by((By.CSS_SELECTOR, ".profile-form"))
    NAME_FIELD = Target.the("name field").located_by((By.ID, "name"))
    
    # Address
    ADD_ADDRESS_BTN = Target.the("add address button").located_by((By.XPATH, "//button[contains(.,'Add Address')]"))
    ADDRESS_MODAL = Target.the("address modal").located_by((By.CSS_SELECTOR, ".modal-overlay"))
    ADDRESS_FORM = Target.the("address form").located_by((By.CSS_SELECTOR, ".address-form"))
    
    # Logout
    LOGOUT_BTN = Target.the("logout button").located_by((By.CSS_SELECTOR, ".logout-btn"))
    
    # Success toast
    SUCCESS_TOAST = Target.the("success toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-success"))
    
    @staticmethod
    def wait_for_profile_container():
        """Wait for profile container to be visible"""
        return Wait.for_the(VallmereProfilePage.PROFILE_CONTAINER).to_appear()
    
    @staticmethod
    def profile_container_is_visible():
        """Assert that profile container is visible"""
        return Wait.for_the(VallmereProfilePage.PROFILE_CONTAINER).to_appear()
    
    @staticmethod
    def user_name_is_visible():
        """Assert that user name is visible"""
        return Wait.for_the(VallmereProfilePage.USER_NAME).to_appear()
    
    @staticmethod
    def email_is_visible():
        """Assert that email is visible"""
        return Wait.for_the(VallmereProfilePage.EMAIL).to_appear()
    
    @staticmethod
    def role_badge_is_visible():
        """Assert that role badge is visible"""
        return Wait.for_the(VallmereProfilePage.ROLE_BADGE).to_appear()
    
    @staticmethod
    def click_edit_profile():
        """Click edit profile button using JavaScript"""
        class ClickEditProfileJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Edit Profile'));
                    if (btn) btn.click();
                """)
        return ClickEditProfileJS()
    
    @staticmethod
    def profile_form_is_visible():
        """Assert that profile form is visible"""
        return Wait.for_the(VallmereProfilePage.PROFILE_FORM).to_appear()
    
    @staticmethod
    def name_field_is_visible():
        """Assert that name field is visible"""
        return Wait.for_the(VallmereProfilePage.NAME_FIELD).to_appear()
    
    @staticmethod
    def enter_name(name: str):
        """Enter name in the name field"""
        return Enter.the_text(name).into(VallmereProfilePage.NAME_FIELD)
    
    @staticmethod
    def clear_and_enter_name(name: str):
        """Clear and enter name in the name field"""
        class ClearAndEnterName:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                name_field = browser.find_element(By.ID, "name")
                name_field.click()
                browser.execute_script("arguments[0].select();", name_field)
                name_field.send_keys(name)
        return ClearAndEnterName()
    
    @staticmethod
    def submit_profile_form():
        """Submit the profile form"""
        class SubmitForm:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                from selenium.webdriver.common.keys import Keys
                browser = actor.ability_to(BrowseTheWeb).browser
                form = browser.find_element(By.CSS_SELECTOR, ".profile-form")
                form.submit()
        return SubmitForm()
    
    @staticmethod
    def success_toast_is_visible():
        """Assert that success toast is visible"""
        return Wait.for_the(VallmereProfilePage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def click_add_address():
        """Click add address button using JavaScript"""
        class ClickAddAddressJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Add Address'));
                    if (btn) btn.click();
                """)
        return ClickAddAddressJS()
    
    @staticmethod
    def address_form_is_visible():
        """Assert that address form is visible"""
        return Wait.for_the(VallmereProfilePage.ADDRESS_MODAL).to_appear()
    
    @staticmethod
    def click_logout():
        """Click logout button"""
        class ClickLogoutJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('.logout-btn');
                    if (btn) btn.click();
                """)
        return ClickLogoutJS()

