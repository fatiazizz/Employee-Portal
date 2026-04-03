from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


class BasePage:
    def __init__(self, driver, base_url: str):
        self.driver = driver
        self.base_url = base_url.rstrip("/")

    def open(self, path: str):
        self.driver.get(f"{self.base_url}{path}")

    def wait_click(self, locator, timeout: int = 10):
        WebDriverWait(self.driver, timeout).until(ec.element_to_be_clickable(locator)).click()

    def wait_visible(self, locator, timeout: int = 10):
        return WebDriverWait(self.driver, timeout).until(ec.visibility_of_element_located(locator))

    def wait_url_contains(self, value: str, timeout: int = 10):
        WebDriverWait(self.driver, timeout).until(ec.url_contains(value))
