"""
Vallmere Header Page
Page Object following ScreenPlay pattern for app header and navigation
"""
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By


class VallmereHeaderPage:
    """Page Object for Vallmere App Header"""
    
    # Header elements
    APP_HEADER = Target.the("app header").located_by((By.CSS_SELECTOR, ".app-header"))
    BACK_HOME_BTN = Target.the("back home button").located_by((By.CSS_SELECTOR, ".back-home-btn"))
    
    # Search
    SEARCH_CONTAINER = Target.the("search container").located_by((By.CSS_SELECTOR, ".search-container"))
    SEARCH_INPUT = Target.the("search input").located_by((By.CSS_SELECTOR, ".search-container input"))
    SEARCH_RESULTS = Target.the("search results").located_by((By.CSS_SELECTOR, ".search-results"))
    SEARCH_RESULTS_ITEM = Target.the("search results item").located_by((By.CSS_SELECTOR, ".search-results li"))
    SEARCH_RESULTS_FIRST = Target.the("first search result").located_by((By.CSS_SELECTOR, ".search-results li:first-child"))
    
    # Sidebar navigation
    SIDEBAR_NAV = Target.the("sidebar nav").located_by((By.CSS_SELECTOR, ".sidebar-nav"))
    
    @staticmethod
    def wait_for_header():
        """Wait for header to be visible"""
        return Wait.for_the(VallmereHeaderPage.APP_HEADER).to_appear()
    
    @staticmethod
    def app_header_is_visible():
        """Assert that app header is visible"""
        return Wait.for_the(VallmereHeaderPage.APP_HEADER).to_appear()
    
    @staticmethod
    def enter_search_term(term: str):
        """Enter search term in header search"""
        return Enter.the_text(term).into(VallmereHeaderPage.SEARCH_INPUT)
    
    @staticmethod
    def search_results_are_visible():
        """Assert that search results are visible"""
        return Wait.for_the(VallmereHeaderPage.SEARCH_RESULTS).to_appear()
    
    @staticmethod
    def search_results_item_is_visible():
        """Assert that at least one search result item is visible"""
        return Wait.for_the(VallmereHeaderPage.SEARCH_RESULTS_ITEM).to_appear()
    
    @staticmethod
    def click_first_search_result():
        """Click first search result"""
        class ClickFirstResultJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const result = document.querySelector('.search-results li:first-child');
                    if (result) result.click();
                """)
        return ClickFirstResultJS()
    
    @staticmethod
    def click_back_home():
        """Click back home button"""
        return Click.on(VallmereHeaderPage.BACK_HOME_BTN)
    
    @staticmethod
    def sidebar_nav_is_visible():
        """Assert that sidebar navigation is visible"""
        return Wait.for_the(VallmereHeaderPage.SIDEBAR_NAV).to_appear()
    
    @staticmethod
    def click_category(category_name: str):
        """Click on a category link in sidebar"""
        class ClickCategoryJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script(f"""
                    const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('{category_name}'));
                    if (link) link.click();
                """)
        return ClickCategoryJS()

