from screenpy.protocols import Answerable
from screenpy_selenium.abilities import BrowseTheWeb
from screenpy import Actor

class PageTitle(Answerable):
    """Pregunta que obtiene el título actual de la página del navegador."""

    def answered_by(self, actor: Actor) -> str:
        return actor.ability_to(BrowseTheWeb).browser.title
