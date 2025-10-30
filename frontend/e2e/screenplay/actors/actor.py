from screenpy import Actor
from screenpy_selenium.abilities import BrowseTheWeb
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

def create_actor_named(name: str) -> Actor:
    options = Options()
    options.add_argument("--headless=new")  # quítala si quieres ver el navegador
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--window-size=1920,1080")

    # ¡Sin ruta! Selenium Manager resuelve el driver correcto automáticamente.
    service = Service()
    driver = webdriver.Chrome(service=service, options=options)

    return Actor.named(name).who_can(BrowseTheWeb.using(driver))
