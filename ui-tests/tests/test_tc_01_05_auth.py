from pages.login_page import LoginPage


def test_tc_01_valid_user_login(driver, cfg):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg["emp"]["email"], cfg["emp"]["password"])
    page.wait_url_contains("/dashboard")
    assert "/dashboard" in driver.current_url


def test_tc_02_invalid_login_attempt(driver, cfg):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg["emp"]["email"], "wrong-password")
    assert "/login" in driver.current_url


def test_tc_03_registration_page_loads(driver, cfg):
    driver.get(f"{cfg['base_url']}/register")
    assert "/register" in driver.current_url


def test_tc_04_forgot_password_page_loads(driver, cfg):
    driver.get(f"{cfg['base_url']}/forgot-password")
    assert "/forgot-password" in driver.current_url


def test_tc_05_verify_email_requires_auth(driver, cfg):
    driver.get(f"{cfg['base_url']}/verify-email")
    assert "/login" in driver.current_url
