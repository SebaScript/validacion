from screenpy import Action
from screenpy_selenium.abilities import BrowseTheWeb
from selenium.webdriver.common.by import By

from screenpy_selenium.actions import Visit, Click


class EnterText(Action):
    """Permite que el actor escriba texto en un campo identificado por un localizador."""

    def __init__(self, text: str, locator: tuple):
        self.text = text
        self.locator = locator

    def perform_as(self, actor):
        browser = actor.ability_to(BrowseTheWeb)
        element = browser.driver.find_element(*self.locator)
        element.clear()
        element.send_keys(self.text)

