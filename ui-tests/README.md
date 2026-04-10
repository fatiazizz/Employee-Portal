# Selenium UI Tests

This folder contains Selenium + pytest test cases mapped to your report TCs.

## 1) Setup

```powershell
cd ui-tests
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2) Configure test accounts

Copy `.env.example` to `.env` and update credentials:

```powershell
copy .env.example .env
```

Make sure these users exist in your app DB:

- employee account
- manager account
- admin account

## 3) Start the app (in another terminal)

From project root:

```powershell
php artisan serve
npm run dev
```

## 4) Run tests

```powershell
cd ui-tests
pytest -v
```

Save output for the test report:

```powershell
pytest -v > evidence\test-run.txt
```

Each test saves a screenshot after it finishes (pass or fail) to:

`ui-tests/evidence/screenshots/`

(File name matches the pytest node name, e.g. `test_tc_01_valid_user_login.png`.)
