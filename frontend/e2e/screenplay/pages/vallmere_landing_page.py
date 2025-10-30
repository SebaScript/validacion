"""
Vallmere Landing Page (Home Page with Products)
Page Object following ScreenPlay pattern for the main landing page
"""
from screenpy import See
from screenpy_selenium.actions import Click, Wait
from screenpy_selenium.target import Target
from selenium.webdriver.common.by import By


class VallmereLandingPage:
    """Page Object for Vallmere Landing/Home Page"""
    
    # Product elements on landing page
    PRODUCT_CARD = Target.the("product card").located_by((By.CSS_SELECTOR, ".product-card"))
    FIRST_PRODUCT_CARD = Target.the("first product card").located_by((By.CSS_SELECTOR, ".product-card:first-child"))
    PRODUCT_IMAGE = Target.the("product image").located_by((By.CSS_SELECTOR, ".product-card .product-image"))
    PRODUCT_TITLE = Target.the("product title").located_by((By.CSS_SELECTOR, ".product-card .product-title"))
    PRODUCT_PRICE = Target.the("product price").located_by((By.CSS_SELECTOR, ".product-card .product-price"))
    
    # Header elements
    APP_HEADER = Target.the("app header").located_by((By.CSS_SELECTOR, ".app-header"))
    CART_ICON = Target.the("cart icon").located_by((By.CSS_SELECTOR, ".cart-icon"))
    SEARCH_INPUT = Target.the("search input").located_by((By.CSS_SELECTOR, ".search-container input"))
    SEARCH_RESULTS = Target.the("search results").located_by((By.CSS_SELECTOR, ".search-results"))
    SEARCH_RESULT_ITEM = Target.the("search result item").located_by((By.CSS_SELECTOR, ".search-results li"))
    FIRST_SEARCH_RESULT = Target.the("first search result").located_by((By.CSS_SELECTOR, ".search-results li:first-child"))
    
    # Sidebar navigation
    SIDEBAR_NAV = Target.the("sidebar navigation").located_by((By.CSS_SELECTOR, ".sidebar-nav"))
    
    # Cart badge
    CART_BADGE = Target.the("cart badge").located_by((By.CSS_SELECTOR, ".badge"))
    
    @staticmethod
    def wait_for_product_cards():
        """Wait for product cards to be visible"""
        return Wait.for_the(VallmereLandingPage.PRODUCT_CARD).to_appear()
    
    @staticmethod
    def wait_for_app_header():
        """Wait for app header to be visible"""
        return Wait.for_the(VallmereLandingPage.APP_HEADER).to_appear()
    
    @staticmethod
    def product_card_is_visible():
        """Assert that product card is visible"""
        return Wait.for_the(VallmereLandingPage.PRODUCT_CARD).to_appear()
    
    @staticmethod
    def product_image_is_visible():
        """Assert that product image is visible"""
        return Wait.for_the(VallmereLandingPage.PRODUCT_IMAGE).to_appear()
    
    @staticmethod
    def product_title_is_visible():
        """Assert that product title is visible"""
        return Wait.for_the(VallmereLandingPage.PRODUCT_TITLE).to_appear()
    
    @staticmethod
    def product_price_is_visible():
        """Assert that product price is visible"""
        return Wait.for_the(VallmereLandingPage.PRODUCT_PRICE).to_appear()
    
    @staticmethod
    def click_first_product():
        """Click on the first product card"""
        return Click.on(VallmereLandingPage.FIRST_PRODUCT_CARD)
    
    @staticmethod
    def click_cart_icon():
        """Click on cart icon in header"""
        return Click.on(VallmereLandingPage.CART_ICON)

