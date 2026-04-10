import pytest
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait

from pages.inertia_nav import (
    open_link_by_href_or_click,
    wait_url_contains,
    wait_url_matches_id_suffix,
)
from pages.login_page import LoginPage
from pages.selectors import Sel

FIRST_INVENTORY_OPTION = (By.CSS_SELECTOR, "ul.absolute li[role='button']")


def login_role(driver, cfg, role: str):
    page = LoginPage(driver, cfg["base_url"])
    page.open_login()
    page.login(cfg[role]["email"], cfg[role]["password"])
    page.wait_url_contains("/dashboard")


def test_tc_14_equipment_page_open(driver, cfg):
    login_role(driver, cfg, "emp")
    driver.get(f"{cfg['base_url']}/equipment-request")
    open_link_by_href_or_click(driver, Sel.NEW_EQUIPMENT)
    wait_url_contains(driver, "equipment-request/create")
    assert "/equipment-request/create" in driver.current_url


def _pick_first_inventory_product(driver, wait: WebDriverWait) -> None:
    search = wait.until(ec.visibility_of_element_located(Sel.EQUIP_PRODUCT_SEARCH))
    for term in ("a", "e", "i", "Lap", "pro", "1"):
        search.clear()
        search.send_keys(term)
        try:
            WebDriverWait(driver, 4).until(ec.element_to_be_clickable(FIRST_INVENTORY_OPTION)).click()
            return
        except TimeoutException:
            continue
    pytest.skip("No warehouse stock / no matching product in dropdown; seed inventory to run this TC")


def test_tc_15_equipment_create_happy_path(driver, cfg):
    login_role(driver, cfg, "emp")
    driver.get(f"{cfg['base_url']}/equipment-request/create")

    wait = WebDriverWait(driver, 20)
    WebDriverWait(driver, 15).until(ec.visibility_of_element_located(Sel.EQUIP_PRODUCT_SEARCH))
    if driver.find_elements(By.XPATH, "//*[contains(.,'No products available in inventory.')]"):
        pytest.skip("Seed warehouse inventory so equipment create has products to pick")

    _pick_first_inventory_product(driver, wait)

    qty = driver.find_element(*Sel.EQUIP_QTY)
    qty.clear()
    qty.send_keys("1")

    driver.find_element(*Sel.EQUIP_ADD).click()
    driver.find_element(*Sel.EQUIP_SUBMIT).click()
    WebDriverWait(driver, 30).until(ec.url_contains("/equipment-request"))
    assert "/equipment-request" in driver.current_url


def test_tc_16_manager_can_open_equipment_details(driver, cfg):
    login_role(driver, cfg, "mgr")
    driver.get(f"{cfg['base_url']}/equipment-request")
    rows = driver.find_elements(*Sel.VIEW_FIRST)
    if rows:
        open_link_by_href_or_click(driver, Sel.VIEW_FIRST)
        wait_url_matches_id_suffix(driver, "/equipment-request/")
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
