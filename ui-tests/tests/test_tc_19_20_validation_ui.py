from pages.login_page import LoginPage
from pages.selectors import Sel


def test_tc_19_login_validation_required_fields(driver, cfg):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    driver.find_element(*Sel.LOGIN_SUBMIT).click()
    assert "/login" in driver.current_url


def test_tc_20_core_pages_render_without_crash(driver, cfg):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg["emp"]["email"], cfg["emp"]["password"])
    page.wait_url_contains("/dashboard")

    pages = [
        "/dashboard",
        "/leave-request",
        "/vehicle-request",
        "/recommendation-request",
        "/equipment-request",
    ]
    for p in pages:
        driver.get(f"{cfg['base_url']}{p}")
        assert p in driver.current_url
