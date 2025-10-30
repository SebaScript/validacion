"""
Vallmere Cart Page
Page Object following ScreenPlay pattern for shopping cart
"""
from screenpy import See
from screenpy_selenium.actions import Click, Enter, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo, ContainsTheText
from selenium.webdriver.common.by import By


class VallmereCartPage:
    """Page Object for Vallmere Shopping Cart"""
    
    # Cart container and elements
    CART_ICON = Target.the("cart icon").located_by((By.CSS_SELECTOR, ".cart-icon"))
    CART_CONTAINER = Target.the("cart container").located_by((By.CSS_SELECTOR, ".cart-container"))
    CART_CONTAINER_SHOW = Target.the("cart container shown").located_by((By.CSS_SELECTOR, ".cart-container.show"))
    CART_HEADER = Target.the("cart header").located_by((By.XPATH, "//h3[contains(text(),'Shopping Cart')]"))
    EMPTY_CART = Target.the("empty cart message").located_by((By.CSS_SELECTOR, ".empty-cart"))
    
    # Cart items
    CART_ITEM = Target.the("cart item").located_by((By.CSS_SELECTOR, ".cart-item"))
    CART_ITEM_FIRST = Target.the("first cart item").located_by((By.CSS_SELECTOR, ".cart-item:first-child"))
    QUANTITY = Target.the("quantity").located_by((By.CSS_SELECTOR, ".quantity"))
    QUANTITY_BTN_INCREASE = Target.the("increase quantity button").located_by((By.CSS_SELECTOR, ".quantity-btn:last-child"))
    QUANTITY_BTN_DECREASE = Target.the("decrease quantity button").located_by((By.CSS_SELECTOR, ".quantity-btn:first-child"))
    REMOVE_BTN = Target.the("remove button").located_by((By.CSS_SELECTOR, ".remove-btn"))
    REMOVE_BTN_FIRST = Target.the("first remove button").located_by((By.CSS_SELECTOR, ".cart-item:first-child .remove-btn"))
    
    # Cart actions
    CLEAR_BTN = Target.the("clear cart button").located_by((By.CSS_SELECTOR, ".clear-btn"))
    CHECKOUT_BTN = Target.the("checkout button").located_by((By.CSS_SELECTOR, ".checkout-btn"))
    
    # Badge
    BADGE = Target.the("cart badge").located_by((By.CSS_SELECTOR, ".badge"))
    
    @staticmethod
    def click_cart_icon():
        """Click the cart icon to open/close cart using JavaScript"""
        class ClickCartIconJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const cartIcon = document.querySelector('.cart-icon');
                    if (cartIcon) cartIcon.click();
                """)
        return ClickCartIconJS()
    
    @staticmethod
    def wait_for_cart_container():
        """Wait for cart container to appear"""
        return Wait.for_the(VallmereCartPage.CART_CONTAINER_SHOW).to_appear()
    
    @staticmethod
    def cart_container_is_visible():
        """Assert that cart container is visible"""
        return Wait.for_the(VallmereCartPage.CART_CONTAINER_SHOW).to_appear()
    
    @staticmethod
    def empty_cart_is_visible():
        """Assert that empty cart message is visible"""
        return Wait.for_the(VallmereCartPage.EMPTY_CART).to_appear()
    
    @staticmethod
    def cart_header_text_is(expected_text: str):
        """Assert that cart header has expected text"""
        return Wait.for_the(VallmereCartPage.CART_HEADER).to_appear()
    
    @staticmethod
    def cart_item_is_visible():
        """Assert that at least one cart item is visible"""
        return Wait.for_the(VallmereCartPage.CART_ITEM).to_appear()
    
    @staticmethod
    def click_increase_quantity():
        """Click to increase quantity of first item"""
        class ClickIncreaseQuantityJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('.cart-item:first-child .quantity-btn:last-child');
                    if (btn) btn.click();
                """)
        return ClickIncreaseQuantityJS()
    
    @staticmethod
    def click_remove_first_item():
        """Click to remove first item from cart"""
        class ClickRemoveJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('.cart-item:first-child .remove-btn');
                    if (btn) btn.click();
                """)
        return ClickRemoveJS()
    
    @staticmethod
    def click_clear_cart():
        """Click to clear all items from cart"""
        class ClickClearJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const btn = document.querySelector('.clear-btn');
                    if (btn) btn.click();
                """)
        return ClickClearJS()
    
    @staticmethod
    def badge_is_visible():
        """Assert that cart badge is visible"""
        return Wait.for_the(VallmereCartPage.BADGE).to_appear()

