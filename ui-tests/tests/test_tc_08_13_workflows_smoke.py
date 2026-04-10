from pages.inertia_nav import open_link_by_href_or_click, wait_url_contains
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
    open_link_by_href_or_click(driver, Sel.NEW_LEAVE)
    wait_url_contains(driver, "leave-request/create")
    assert "/leave-request/create" in driver.current_url


def test_tc_09_leave_manager_flow_page_open(driver, cfg):
    login_mgr(driver, cfg)
    driver.get(f"{cfg['base_url']}/leave-request")
    assert "/leave-request" in driver.current_url


def test_tc_10_vehicle_request_page_open(driver, cfg):
    login_emp(driver, cfg)
    driver.get(f"{cfg['base_url']}/vehicle-request")
    open_link_by_href_or_click(driver, Sel.NEW_VEHICLE)
    wait_url_contains(driver, "vehicle-request/create")
    assert "/vehicle-request/create" in driver.current_url


def test_tc_12_recommendation_request_page_open(driver, cfg):
    login_emp(driver, cfg)
    driver.get(f"{cfg['base_url']}/recommendation-request")
    open_link_by_href_or_click(driver, Sel.NEW_RECOMMENDATION)
    wait_url_contains(driver, "recommendation-request/create")
    assert "/recommendation-request/create" in driver.current_url


def test_tc_13_recommendation_status_page_access(driver, cfg):
    login_emp(driver, cfg)
    driver.get(f"{cfg['base_url']}/recommendation-request")
    assert "/recommendation-request" in driver.current_url
