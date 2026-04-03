from selenium.webdriver.common.by import By


class Sel:
    EMAIL = (By.ID, "email")
    PASSWORD = (By.ID, "password")
    LOGIN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")

    NEW_LEAVE = (By.XPATH, "//a[contains(.,'New Leave Request')]")
    NEW_VEHICLE = (By.XPATH, "//a[contains(.,'New Vehicle Request')]")
    NEW_RECOMMENDATION = (By.XPATH, "//a[contains(.,'New Recommendation Request')]")
    NEW_EQUIPMENT = (By.XPATH, "//a[contains(.,'New Product Request')]")

    LEAVE_TYPE = (By.ID, "leave_type")
    LEAVE_START = (By.ID, "leave_start")
    LEAVE_END = (By.ID, "leave_end")
    LEAVE_SUBMIT = (By.XPATH, "//button[normalize-space()='Submit']")
    LEAVE_CONFIRM_SUBMIT = (By.XPATH, "//button[normalize-space()='Confirm & Submit']")

    VEHICLE_ORIGIN = (By.ID, "origin")
    VEHICLE_DESTINATION = (By.ID, "destination")
    VEHICLE_START = (By.ID, "start_at")
    VEHICLE_END = (By.ID, "end_at")
    VEHICLE_SUBMIT = (By.XPATH, "//button[normalize-space()='Submit request']")

    RECOMMEND_TO = (By.XPATH, "//label[contains(normalize-space(),'Recipient (To)')]/following::input[1]")
    RECOMMEND_SUBMIT = (By.XPATH, "//button[normalize-space()='Submit']")

    EQUIP_PRODUCT_SEARCH = (
        By.XPATH,
        "//label[contains(normalize-space(),'Product (type to filter inventory)')]/following::input[1]",
    )
    EQUIP_QTY = (By.XPATH, "//label[normalize-space()='Requested amount']/following::input[1]")
    EQUIP_ADD = (By.XPATH, "//button[normalize-space()='Add']")
    EQUIP_SUBMIT = (By.XPATH, "//button[normalize-space()='Submit Request']")

    VIEW_FIRST = (By.XPATH, "//a[normalize-space()='View'][1]")

    MANAGER_ACT = (By.XPATH, "//button[contains(.,'Approve / Reject')]")
    MANAGER_APPROVE = (By.XPATH, "//button[normalize-space()='Approve']")
    MANAGER_REJECT = (By.XPATH, "//button[normalize-space()='Reject']")

    ADMIN_ACT = (By.XPATH, "//button[contains(.,'Final Approve / Reject')]")
    ADMIN_APPROVE = (By.XPATH, "//button[normalize-space()='Final Approve']")
    ADMIN_REJECT = (By.XPATH, "//button[normalize-space()='Final Reject']")

    MANAGER_QTY_FIRST = (By.XPATH, "//table//tbody/tr[1]//input[@type='number'][1]")
    ADMIN_QTY_FIRST = (By.XPATH, "//table//tbody/tr[1]//input[@type='number'][last()]")


def equipment_option_by_text(product_text: str):
    return By.XPATH, f"//li[contains(normalize-space(),'{product_text}')]"
