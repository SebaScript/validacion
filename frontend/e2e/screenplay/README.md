# Vallmere E2E Tests - ScreenPlay Pattern

Automated E2E tests for the Vallmere e-commerce application using the ScreenPlay pattern with ScreenPy and Selenium WebDriver.

## Test Coverage

This test suite contains **42 comprehensive E2E tests** covering:

### Authentication & Authorization (Tests 01-08)
- Client login (success, validation, failures)
- Admin login (success, validation)
- Sign up (success, validations)
- Guards (unauthorized access)

### Product Browsing (Tests 09-15)
- Browse products on landing page
- Product detail view
- Modals (size guide, shipping policy)
- Add to cart functionality
- Sold out products

### Shopping Cart (Tests 14-19)
- Empty cart state
- Open cart from header
- Update item quantity
- Remove items
- Clear all items
- Multiple products

### User Profile (Tests 20-24)
- View user information
- Edit profile mode
- Update name
- Add address modal
- Logout

### Admin Panel (Tests 25-33)
- Admin login
- View products list
- Search products
- Add product form & validation
- Edit product
- Delete product
- Admin logout

### Navigation & Search (Tests 34-39)
- Header search functionality
- Click search results
- Back to home navigation
- Category filtering

### Additional Scenarios (Tests 40-44)
- Invalid email format validation
- Multiple products to cart
- Product navigation sequence
- Login after failed attempt
- Cart persistence after logout

## Running Tests

### Run all tests:
```bash
pytest -v --html=report.html --self-contained-html
```

### Run specific test:
```bash
pytest tests/test_01_login_success_client.py -v
```

### Run tests by pattern:
```bash
pytest -k "login" -v
pytest -k "cart" -v
pytest -k "admin" -v
```

## Prerequisites

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure the Vallmere application is running on:
```
http://localhost:4200
```

3. Ensure the following test accounts exist:
- Client: `cliente@vallmere.com` / `cliente123`
- Admin: `admin@vallmere.com` / `admin123`

## Test Structure

```
screenplay/
├── pages/              # Page Objects (ScreenPlay pattern)
│   ├── vallmere_login_page.py
│   ├── vallmere_signup_page.py
│   ├── vallmere_landing_page.py
│   ├── vallmere_product_page.py
│   ├── vallmere_cart_page.py
│   ├── vallmere_profile_page.py
│   ├── vallmere_admin_login_page.py
│   ├── vallmere_admin_page.py
│   └── vallmere_header_page.py
├── tests/              # Test files
├── questions/          # Custom questions
├── actions/            # Custom actions
├── actors/             # Actor configuration
└── conftest.py         # Pytest fixtures

```

## Notes

- Some tests use JavaScript click for better compatibility with Angular's Zone.js
- Cart state is verified through localStorage for reliability
- Tests include appropriate waits for async operations
- Screenshots are captured on failures

## Report

After running tests, open `report.html` in your browser to view detailed results.

