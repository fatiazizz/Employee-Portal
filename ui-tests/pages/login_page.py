from pages.base_page import BasePage
from pages.selectors import Sel


class LoginPage(BasePage):
    def open_login(self):
        self.open("/login")

    def login(self, email: str, password: str):
        email_el = self.wait_visible(Sel.EMAIL)
        email_el.clear()
        email_el.send_keys(email)

        pass_el = self.wait_visible(Sel.PASSWORD)
        pass_el.clear()
        pass_el.send_keys(password)

        self.wait_click(Sel.LOGIN_SUBMIT)
