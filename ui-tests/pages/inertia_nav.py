"""Inertia <Link> clicks are unreliable in Selenium; prefer navigating via href."""

import re

from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


def open_link_by_href_or_click(driver: WebDriver, locator, timeout: int = 10) -> None:
    link = WebDriverWait(driver, timeout).until(ec.element_to_be_clickable(locator))
    href = link.get_attribute("href")
    if href:
        driver.get(href)
    else:
        link.click()


def wait_url_contains(driver: WebDriver, fragment: str, timeout: int = 10) -> None:
    WebDriverWait(driver, timeout).until(ec.url_contains(fragment))


def wait_url_matches_id_suffix(driver: WebDriver, prefix_path: str, timeout: int = 10) -> None:
    """e.g. prefix_path='/equipment-request/' then URL must be .../equipment-request/123"""
    pattern = re.compile(rf".*{re.escape(prefix_path)}\d+.*")

    def _ok(d):
        return pattern.search(d.current_url) is not None

    WebDriverWait(driver, timeout).until(_ok)
