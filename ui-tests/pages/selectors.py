from selenium.webdriver.common.by import By


class Sel:
    EMAIL = (By.ID, "email")
    PASSWORD = (By.ID, "password")
    LOGIN_SUBMIT = (By.CSS_SELECTOR, "button[type='submit']")

    NEW_LEAVE = (By.XPATH, "//a[contains(.,'New Leave Request')]")
    NEW_VEHICLE = (By.XPATH, "//a[contains(.,'New Vehicle Request')]")
    NEW_RECOMMENDATION = (By.XPATH, "//a[contains(.,'New Recommendation Request')]")
    NEW_EQUIPMENT = (By.XPATH, "//a[contains(.,'New Product Request')]")

    LEAVE_TYPE = (By.XPATH, "//label[contains(normalize-space(),'Leave Type')]/following::select[1]")
    LEAVE_START = (By.XPATH, "//label[contains(normalize-space(),'Start')]/following::input[1]")
    LEAVE_END = (By.XPATH, "//label[contains(normalize-space(),'End')]/following::input[1]")
    LEAVE_SUBMIT = (By.XPATH, "//button[normalize-space()='Submit']")
    LEAVE_CONFIRM_SUBMIT = (By.XPATH, "//button[normalize-space()='Confirm & Submit']")

    VEHICLE_ORIGIN = (By.XPATH, "//label[normalize-space()='Origin']/following::input[1]")
    VEHICLE_DESTINATION = (By.XPATH, "//label[normalize-space()='Destination']/following::input[1]")
    VEHICLE_START = (By.XPATH, "//label[contains(normalize-space(),'Start Date')]/following::input[1]")
    VEHICLE_END = (By.XPATH, "//label[contains(normalize-space(),'End Date')]/following::input[1]")
    VEHICLE_SUBMIT = (By.XPATH, "//button[normalize-space()='Submit']")

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
