import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

load_dotenv()


@pytest.fixture(scope="session")
def cfg():
    return {
        "base_url": os.getenv("BASE_URL", "http://127.0.0.1:8000"),
        "headless": os.getenv("HEADLESS", "false").lower() == "true",
        "emp": {
            "email": os.getenv("EMP_EMAIL", ""),
            "password": os.getenv("EMP_PASSWORD", ""),
        },
        "mgr": {
            "email": os.getenv("MGR_EMAIL", ""),
            "password": os.getenv("MGR_PASSWORD", ""),
        },
        "adm": {
            "email": os.getenv("ADM_EMAIL", ""),
            "password": os.getenv("ADM_PASSWORD", ""),
        },
    }


@pytest.fixture(scope="session")
def screenshot_dir():
    path = Path("evidence/screenshots")
    path.mkdir(parents=True, exist_ok=True)
    return path


@pytest.fixture
def driver(cfg):
    options = webdriver.ChromeOptions()
    if cfg["headless"]:
        options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--window-size=1920,1080")

    drv = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    drv.implicitly_wait(8)
    yield drv
    drv.quit()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    if rep.when == "call":
        setattr(item, "rep_call", rep)


@pytest.fixture(autouse=True)
def capture_screenshot(request, driver, screenshot_dir):
    """Save a PNG per test after each run (pass or fail) for evidence/reporting."""
    yield
    rep = getattr(request.node, "rep_call", None)
    if rep and rep.when == "call":
        output = screenshot_dir / f"{request.node.name}.png"
        driver.save_screenshot(str(output))
