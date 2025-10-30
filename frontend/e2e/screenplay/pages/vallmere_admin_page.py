"""
Vallmere Admin Page
Page Object following ScreenPlay pattern for admin panel
"""
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By


class VallmereAdminPage:
    """Page Object for Vallmere Admin Panel"""
    
    # Admin panel elements
    ADMIN_PANEL = Target.the("admin panel").located_by((By.CSS_SELECTOR, ".admin-panel"))
    ADMIN_SIDEBAR = Target.the("admin sidebar").located_by((By.CSS_SELECTOR, ".admin-sidebar"))
    
    # Navigation buttons
    VIEW_PRODUCTS_BTN = Target.the("view products button").located_by((By.XPATH, "//button[contains(.,'View Products')]"))
    ADD_PRODUCT_BTN = Target.the("add product button").located_by((By.XPATH, "//button[contains(.,'Add Product')]"))
    
    # Table and search
    ADMIN_TABLE = Target.the("admin table").located_by((By.CSS_SELECTOR, ".admin-table-container table"))
    TABLE_THEAD = Target.the("table header").located_by((By.CSS_SELECTOR, "table thead"))
    SEARCH_INPUT = Target.the("search input").located_by((By.CSS_SELECTOR, ".search-input"))
    SEARCH_RESULTS_INFO = Target.the("search results info").located_by((By.CSS_SELECTOR, ".search-results-info"))
    
    # Form
    ADMIN_FORM = Target.the("admin form").located_by((By.CSS_SELECTOR, ".admin-form"))
    NAME_FIELD = Target.the("name field").located_by((By.ID, "name"))
    PRICE_FIELD = Target.the("price field").located_by((By.ID, "price"))
    DESCRIPTION_FIELD = Target.the("description field").located_by((By.ID, "description"))
    STOCK_FIELD = Target.the("stock field").located_by((By.ID, "stock"))
    CATEGORY_SELECT = Target.the("category select").located_by((By.ID, "categoryId"))
    IMAGE_URL_FIELD = Target.the("image url field").located_by((By.ID, "imageUrl"))
    SUBMIT_BTN = Target.the("submit button").located_by((By.CSS_SELECTOR, "button[type='submit']"))
    CONTENT_TITLE = Target.the("content title").located_by((By.CSS_SELECTOR, ".content-title"))
    
    # Edit/Delete buttons (cambiar selectores para que sean más específicos)
    EDIT_BTN_FIRST = Target.the("first edit button").located_by((By.XPATH, "(//button[contains(@class,'btn-icon') and contains(@class,'edit')])[1]"))
    DELETE_BTN_FIRST = Target.the("first delete button").located_by((By.XPATH, "(//button[contains(@class,'btn-icon') and contains(@class,'delete') and contains(@title,'Delete Product')])[1]"))
    DELETE_IMAGE_BTN = Target.the("delete image button").located_by((By.CSS_SELECTOR, ".delete"))
    
    # Table data
    FIRST_ROW_NAME = Target.the("first row name").located_by((By.XPATH, "//table//tbody//tr[1]//td[2]"))
    
    # Logout
    LOGOUT_BTN = Target.the("logout button").located_by((By.CSS_SELECTOR, ".logout-btn"))
    
    # Success/Error toast
    SUCCESS_TOAST = Target.the("success toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-success"))
    ERROR_TOAST = Target.the("error toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-error"))
    
    @staticmethod
    def wait_for_admin_panel():
        """Wait for admin panel to be visible"""
        return Wait.for_the(VallmereAdminPage.ADMIN_PANEL).to_appear()
    
    @staticmethod
    def admin_panel_is_visible():
        """Assert that admin panel is visible"""
        return Wait.for_the(VallmereAdminPage.ADMIN_PANEL).to_appear()
    
    @staticmethod
    def admin_sidebar_is_visible():
        """Assert that admin sidebar is visible"""
        return Wait.for_the(VallmereAdminPage.ADMIN_SIDEBAR).to_appear()
    
    @staticmethod
    def click_view_products():
        """Click view products button using JavaScript"""
        class ClickViewProductsJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('.nav-item[class*="active"]') || 
                                document.querySelector('button.nav-item');
                    if (btn && btn.textContent.includes('View Products')) btn.click();
                """)
        return ClickViewProductsJS()
    
    @staticmethod
    def click_add_product():
        """Click add product button using JavaScript"""
        class ClickAddProductJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const buttons = document.querySelectorAll('button.nav-item');
                    const btn = Array.from(buttons).find(b => b.textContent.includes('Add Product'));
                    if (btn) btn.click();
                """)
        return ClickAddProductJS()
    
    @staticmethod
    def admin_table_is_visible():
        """Assert that admin table is visible"""
        return Wait.for_the(VallmereAdminPage.ADMIN_TABLE).to_appear()
    
    @staticmethod
    def table_header_is_visible():
        """Assert that table header is visible"""
        return Wait.for_the(VallmereAdminPage.TABLE_THEAD).to_appear()
    
    @staticmethod
    def enter_search_term(term: str):
        """Enter search term in search input"""
        return Enter.the_text(term).into(VallmereAdminPage.SEARCH_INPUT)
    
    @staticmethod
    def search_results_info_is_visible():
        """Assert that search results info is visible"""
        return Wait.for_the(VallmereAdminPage.SEARCH_RESULTS_INFO).to_appear()
    
    @staticmethod
    def admin_form_is_visible():
        """Assert that admin form is visible"""
        return Wait.for_the(VallmereAdminPage.ADMIN_FORM).to_appear()
    
    @staticmethod
    def name_field_is_visible():
        """Assert that name field is visible"""
        return Wait.for_the(VallmereAdminPage.NAME_FIELD).to_appear()
    
    @staticmethod
    def click_submit():
        """Click submit button"""
        class ClickSubmitJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('button[type="submit"]');
                    if (btn) btn.click();
                """)
        return ClickSubmitJS()
    
    @staticmethod
    def error_toast_is_visible():
        """Assert that error toast is visible"""
        return Wait.for_the(VallmereAdminPage.ERROR_TOAST).to_appear()
    
    @staticmethod
    def success_toast_is_visible():
        """Assert that success toast is visible"""
        return Wait.for_the(VallmereAdminPage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def click_edit_first():
        """Click first edit button"""
        class ClickEditJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const editButtons = document.querySelectorAll('button.btn-icon.edit');
                    if (editButtons.length > 0) editButtons[0].click();
                """)
        return ClickEditJS()
    
    @staticmethod
    def content_title_is(expected_text: str):
        """Assert that content title matches expected text"""
        return See.the(Text.of(VallmereAdminPage.CONTENT_TITLE), IsEqualTo(expected_text))
    
    @staticmethod
    def enter_name(name: str):
        """Enter product name"""
        class EnterNameJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                from selenium.webdriver.common.keys import Keys
                browser = actor.ability_to(BrowseTheWeb).browser
                name_field = browser.find_element(By.ID, "name")
                name_field.click()
                name_field.send_keys(Keys.CONTROL + "a")
                name_field.send_keys(name)
        return EnterNameJS()
    
    @staticmethod
    def enter_price(price: str):
        """Enter product price"""
        class EnterPriceJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                from selenium.webdriver.common.keys import Keys
                browser = actor.ability_to(BrowseTheWeb).browser
                field = browser.find_element(By.ID, "price")
                field.click()
                field.send_keys(Keys.CONTROL + "a")
                field.send_keys(price)
        return EnterPriceJS()
    
    @staticmethod
    def enter_description(description: str):
        """Enter product description"""
        class EnterDescriptionJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                from selenium.webdriver.common.keys import Keys
                browser = actor.ability_to(BrowseTheWeb).browser
                field = browser.find_element(By.ID, "description")
                field.click()
                field.send_keys(Keys.CONTROL + "a")
                field.send_keys(description)
        return EnterDescriptionJS()
    
    @staticmethod
    def enter_stock(stock: str):
        """Enter product stock"""
        class EnterStockJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                from selenium.webdriver.common.keys import Keys
                browser = actor.ability_to(BrowseTheWeb).browser
                field = browser.find_element(By.ID, "stock")
                field.click()
                field.send_keys(Keys.CONTROL + "a")
                field.send_keys(stock)
        return EnterStockJS()
    
    @staticmethod
    def select_category(label: str):
        """Select category by label"""
        class SelectCategoryJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                from selenium.webdriver.support.ui import Select
                browser = actor.ability_to(BrowseTheWeb).browser
                select = Select(browser.find_element(By.ID, "categoryId"))
                select.select_by_visible_text(label)
        return SelectCategoryJS()
    
    @staticmethod
    def click_delete_image():
        """Click delete image button"""
        class ClickDeleteImageJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('.delete');
                    if (btn) btn.click();
                """)
        return ClickDeleteImageJS()
    
    @staticmethod
    def enter_image_url(url: str):
        """Enter image URL"""
        return Enter.the_text(url).into(VallmereAdminPage.IMAGE_URL_FIELD)
    
    @staticmethod
    def first_row_name_is(expected_text: str):
        """Assert that first row name matches expected text"""
        return See.the(Text.of(VallmereAdminPage.FIRST_ROW_NAME), IsEqualTo(expected_text))
    
    @staticmethod
    def click_delete_first():
        """Click first delete button"""
        class ClickDeleteJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const deleteButtons = document.querySelectorAll('button.btn-icon.delete[title="Delete Product"]');
                    if (deleteButtons.length > 0) deleteButtons[0].click();
                """)
        return ClickDeleteJS()
    
    @staticmethod
    def accept_confirmation():
        """Accept browser confirmation dialog"""
        class AcceptConfirmation:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                import time
                browser = actor.ability_to(BrowseTheWeb).browser
                time.sleep(0.5)
                try:
                    alert = browser.switch_to.alert
                    alert.accept()
                except:
                    pass
        return AcceptConfirmation()
    
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

