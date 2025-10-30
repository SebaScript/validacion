from screenpy import Actor
from screenpy.pacing import beat
from screenpy_selenium.actions import Visit


class OpenPage:
    """Una tarea personalizada para abrir una página web directamente por URL."""

    def __init__(self, url: str):
        self.url = url

    @beat("{} abre la página {self.url}")
    def perform_as(self, the_actor: Actor) -> None:
        the_actor.attempts_to(Visit.the_url(self.url))
