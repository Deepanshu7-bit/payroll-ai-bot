import time
from playwright.sync_api import sync_playwright

def login_and_save_session():
    print("🚀 Launching visible browser...")

    # 1. Start Playwright and open a VISIBLE Chromium window (headless=False)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        context = browser.new_context()
        page = context.new_page()

        # 2. Go to the nugenova portal
        # (Replace with the exact login URL of your portal)
        print("🌐 Navigating to login page...")
        page.goto("https://nugenova.com")

        print("\n" + "=" * 60)
        print("👉 ACTION REQUIRED BY YOU:")
        print("1. Enter your work email in the browser.")
        print("2. Enter the OTP code sent to your email.")
        print("3. Once you are successfully logged in and see the dashboard,")
        print("   come back to this terminal and press ENTER!")
        print("=" * 60 + "\n")

        # 3. Wait for you to press Enter in terminal after logging in
        input("Press ENTER here in the terminal once you are logged in...")

        # 4. Save the cookies and login session to a JSON file!
        context.storage_state(path="auth_state.json")
        print("✅ SUCCESS! Login session saved to 'auth_state.json'")

        # 5. Close browser
        browser.close()

if __name__ == "__main__":
    login_and_save_session()