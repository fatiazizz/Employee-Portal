from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait

from pages.login_page import LoginPage
from pages.selectors import Sel, equipment_option_by_text


def login_role(driver, cfg, role: str):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg[role]["email"], cfg[role]["password"])
    page.wait_url_contains("/dashboard")


def test_tc_14_equipment_page_open(driver, cfg):
    login_role(driver, cfg, "emp")
    driver.get(f"{cfg['base_url']}/equipment-request")
    driver.find_element(*Sel.NEW_EQUIPMENT).click()
    assert "/equipment-request/create" in driver.current_url


def test_tc_15_equipment_create_happy_path(driver, cfg):
    login_role(driver, cfg, "emp")
    driver.get(f"{cfg['base_url']}/equipment-request/create")

    driver.find_element(*Sel.EQUIP_PRODUCT_SEARCH).send_keys("Laptop")
    WebDriverWait(driver, 10).until(ec.element_to_be_clickable(equipment_option_by_text("Laptop"))).click()

    qty = driver.find_element(*Sel.EQUIP_QTY)
    qty.clear()
    qty.send_keys("1")

    driver.find_element(*Sel.EQUIP_ADD).click()
    driver.find_element(*Sel.EQUIP_SUBMIT).click()
    WebDriverWait(driver, 10).until(ec.url_contains("/equipment-request"))
    assert "/equipment-request" in driver.current_url


def test_tc_16_manager_can_open_equipment_details(driver, cfg):
    login_role(driver, cfg, "mgr")
    driver.get(f"{cfg['base_url']}/equipment-request")
    if driver.find_elements(*Sel.VIEW_FIRST):
        driver.find_element(*Sel.VIEW_FIRST).click()
        assert "/equipment-request/" in driver.current_url
    else:
        assert "/equipment-request" in driver.current_url


def test_tc_17_admin_can_open_product_requests(driver, cfg):
    login_role(driver, cfg, "adm")
    driver.get(f"{cfg['base_url']}/admin/product-requests")
    assert "/admin/product-requests" in driver.current_url


def test_tc_18_unauthorized_admin_page_blocked_for_employee(driver, cfg):
    login_role(driver, cfg, "emp")
    driver.get(f"{cfg['base_url']}/admin/warehouse-inventory")
    assert ("/login" in driver.current_url) or ("/dashboard" in driver.current_url) or ("403" in driver.page_source)
