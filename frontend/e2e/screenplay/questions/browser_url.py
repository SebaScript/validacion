from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb

class BrowserURL(Answerable):
    def answered_by(self, actor):
        return actor.ability_to(BrowseTheWeb).browser.current_url
