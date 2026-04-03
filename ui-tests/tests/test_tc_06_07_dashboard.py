from pages.login_page import LoginPage


def test_tc_06_dashboard_redirects_guest(driver, cfg):
    driver.get(f"{cfg['base_url']}/dashboard")
    assert "/login" in driver.current_url


def test_tc_07_dashboard_access_authenticated(driver, cfg):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg["emp"]["email"], cfg["emp"]["password"])
    page.wait_url_contains("/dashboard")
    assert "/dashboard" in driver.current_url
