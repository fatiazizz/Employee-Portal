from pages.login_page import LoginPage
from pages.selectors import Sel


def login_emp(driver, cfg):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg["emp"]["email"], cfg["emp"]["password"])
    page.wait_url_contains("/dashboard")


def login_mgr(driver, cfg):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg["mgr"]["email"], cfg["mgr"]["password"])
    page.wait_url_contains("/dashboard")


def test_tc_08_leave_request_page_open(driver, cfg):
    login_emp(driver, cfg)
    driver.get(f"{cfg['base_url']}/leave-request")
    driver.find_element(*Sel.NEW_LEAVE).click()
    assert "/leave-request/create" in driver.current_url


def test_tc_09_leave_manager_flow_page_open(driver, cfg):
    login_mgr(driver, cfg)
    driver.get(f"{cfg['base_url']}/leave-request")
    assert "/leave-request" in driver.current_url


def test_tc_10_vehicle_request_page_open(driver, cfg):
    login_emp(driver, cfg)
    driver.get(f"{cfg['base_url']}/vehicle-request")
    driver.find_element(*Sel.NEW_VEHICLE).click()
    assert "/vehicle-request/create" in driver.current_url


def test_tc_12_recommendation_request_page_open(driver, cfg):
    login_emp(driver, cfg)
    driver.get(f"{cfg['base_url']}/recommendation-request")
    driver.find_element(*Sel.NEW_RECOMMENDATION).click()
    assert "/recommendation-request/create" in driver.current_url


def test_tc_13_recommendation_status_page_access(driver, cfg):
    login_emp(driver, cfg)
    driver.get(f"{cfg['base_url']}/recommendation-request")
    assert "/recommendation-request" in driver.current_url
