"""
Vallmere Product Detail Page
Page Object following ScreenPlay pattern for individual product detail view
"""
from screenpy import See
from screenpy_selenium.actions import Click, Wait
from screenpy_selenium.questions import Text
from screenpy_selenium.target import Target
from screenpy.resolutions import IsEqualTo
from selenium.webdriver.common.by import By


class VallmereProductPage:
    """Page Object for Vallmere Product Detail Page"""
    
    # Product detail elements
    PRODUCT_DETAIL = Target.the("product detail container").located_by((By.CSS_SELECTOR, ".product-detail"))
    PRODUCT_INFO_TITLE = Target.the("product info title").located_by((By.CSS_SELECTOR, ".product-detail .product-info h2"))
    PRODUCT_PRICE = Target.the("product price").located_by((By.CSS_SELECTOR, ".product-detail .price"))
    PRODUCT_DESCRIPTION = Target.the("product description").located_by((By.CSS_SELECTOR, ".product-detail .description"))
    
    # Action buttons
    ADD_TO_CART_BUTTON = Target.the("add to cart button").located_by((By.CSS_SELECTOR, "button.add-to-cart"))
    
    # Modals
    SIZE_GUIDE_LINK = Target.the("size guide link").located_by((By.XPATH, "//a[contains(text(),'SIZE GUIDE')]"))
    SHIPPING_POLICY_LINK = Target.the("shipping policy link").located_by((By.XPATH, "//a[contains(text(),'SHIPPING POLICY')]"))
    MODAL_BACKDROP = Target.the("modal backdrop").located_by((By.CSS_SELECTOR, ".modal-backdrop"))
    MODAL = Target.the("modal dialog").located_by((By.CSS_SELECTOR, "dialog.modal"))
    MODAL_TITLE = Target.the("modal title").located_by((By.CSS_SELECTOR, ".modal-title"))
    MODAL_CLOSE = Target.the("modal close button").located_by((By.CSS_SELECTOR, ".modal-close"))
    
    # Messages
    SUCCESS_TOAST = Target.the("success toast").located_by((By.CSS_SELECTOR, "#toast-container .toast-success"))
    ERROR_MESSAGE = Target.the("error message").located_by((By.CSS_SELECTOR, ".error"))
    
    # Cart badge
    CART_BADGE = Target.the("cart badge").located_by((By.CSS_SELECTOR, ".badge"))
    
    @staticmethod
    def wait_for_product_detail():
        """Wait for product detail container to be visible"""
        return Wait.for_the(VallmereProductPage.PRODUCT_DETAIL).to_appear()
    
    @staticmethod
    def wait_for_add_to_cart_button():
        """Wait for add to cart button to be visible"""
        return Wait.for_the(VallmereProductPage.ADD_TO_CART_BUTTON).to_appear()
    
    @staticmethod
    def wait_for_success_toast():
        """Wait for success toast to appear"""
        return Wait.for_the(VallmereProductPage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def product_detail_is_visible():
        """Assert that product detail container is visible"""
        return Wait.for_the(VallmereProductPage.PRODUCT_DETAIL).to_appear()
    
    @staticmethod
    def product_title_is_visible():
        """Assert that product title is visible"""
        return Wait.for_the(VallmereProductPage.PRODUCT_INFO_TITLE).to_appear()
    
    @staticmethod
    def product_price_is_visible():
        """Assert that product price is visible"""
        return Wait.for_the(VallmereProductPage.PRODUCT_PRICE).to_appear()
    
    @staticmethod
    def product_description_is_visible():
        """Assert that product description is visible"""
        return Wait.for_the(VallmereProductPage.PRODUCT_DESCRIPTION).to_appear()
    
    @staticmethod
    def click_add_to_cart():
        """Click the add to cart button using JavaScript (more reliable with Angular)"""
        # Custom action that uses JavaScript to click the button
        # This is more reliable than Selenium's native click for Angular applications
        class ClickAddToCartWithJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const button = document.querySelector('button.add-to-cart');
                    if (button) {
                        button.click();
                    } else {
                        throw new Error('Add to Cart button not found');
                    }
                """)
        
        return ClickAddToCartWithJS()
    
    @staticmethod
    def success_toast_is_visible():
        """Assert that success toast is visible"""
        return Wait.for_the(VallmereProductPage.SUCCESS_TOAST).to_appear()
    
    @staticmethod
    def cart_badge_is_visible():
        """Assert that cart badge is visible"""
        return Wait.for_the(VallmereProductPage.CART_BADGE).to_appear()
    
    @staticmethod
    def error_message_is_visible():
        """Assert that error message is visible (for sold out products)"""
        return Wait.for_the(VallmereProductPage.ERROR_MESSAGE).to_appear()
    
    @staticmethod
    def click_size_guide():
        """Click on size guide link using JavaScript"""
        class ClickSizeGuideJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('SIZE GUIDE'));
                    if (link) link.click();
                """)
        return ClickSizeGuideJS()
    
    @staticmethod
    def click_shipping_policy():
        """Click on shipping policy link using JavaScript"""
        class ClickShippingPolicyJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const link = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('SHIPPING POLICY'));
                    if (link) link.click();
                """)
        return ClickShippingPolicyJS()
    
    @staticmethod
    def modal_is_visible():
        """Assert that modal is visible"""
        return Wait.for_the(VallmereProductPage.MODAL).to_appear()
    
    @staticmethod
    def modal_title_is(expected_title: str):
        """Assert that modal title matches expected text"""
        return See.the(Text.of(VallmereProductPage.MODAL_TITLE), IsEqualTo(expected_title))
    
    @staticmethod
    def close_modal():
        """Click the modal close button using JavaScript"""
        class CloseModalJS:
            def perform_as(self, actor):
                from screenpy_selenium.abilities import BrowseTheWeb
                browser = actor.ability_to(BrowseTheWeb).browser
                browser.execute_script("""
                    const closeBtn = document.querySelector('.modal-close');
                    if (closeBtn) closeBtn.click();
                """)
        return CloseModalJS()

