import re
from playwright.sync_api import sync_playwright

# 1. Bring in our salary formula from Lesson 2!
def calculate_pay(hours_worked, hourly_rate=30.0):
    standard_hours = 160
    if hours_worked > standard_hours:
        overtime = hours_worked - standard_hours
        regular = standard_hours
    else:
        overtime = 0
        regular = hours_worked
        
    gross = (regular * hourly_rate) + (overtime * hourly_rate * 1.5)
    tax = gross * 0.10
    net = gross - tax
    return {
        "gross": gross,
        "tax": tax,
        "net": net,
        "overtime": overtime
    }

def scrape_and_calculate():
    print("🚀 Connecting to NuGenova with saved session...")

    # Load Playwright with the saved login cookies!
    with sync_playwright() as p:
        # Launch visible browser for now so you can watch it work!
        browser = p.chromium.launch(headless=False)
        
        # KEY LINE: We give Playwright the saved auth state!
        context = browser.new_context(storage_state="auth_state.json")
        page = context.new_page()

        # Navigate to the portal
        print("🌐 Opening portal...")
        page.goto("https://nugenova.com")
        page.wait_for_timeout(3000)  # Wait 3 seconds for UI to load

        # If there is a direct URL or menu click to Timesheets:
        # Let's click on "Timesheets" or navigate directly
        # You can also change this to the direct URL, e.g. page.goto("https://nugenova.com/timesheets")
        if "timesheet" not in page.url.lower():
            print("👉 Navigating to Timesheets section...")
            # Try to click the Timesheets button in navigation
            page.get_by_text("Timesheets", exact=False).first.click()
            page.wait_for_timeout(3000)

        print("🔍 Scanning employee timesheet cards...")

        # Let's find all employee rows/cards
        # In the screenshot, each item has an "Approved" badge and a "View" button
        # We find each container that has a "View" button
        cards = page.locator("div").filter(has_text="View").filter(has_text="Approved")
        
        print(f"Found items on page. Extracting details...\n")
        
        # Let's grab the visible text from the page
        # Playwright lets us evaluate JavaScript right inside the browser:
        extracted_data = page.evaluate("""() => {
            const results = [];
            // Find all buttons that say "View"
            const viewButtons = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('View'));
            
            viewButtons.forEach(btn => {
                // The card is the parent container of the button
                const card = btn.closest('div[class*="border"], div[class*="rounded"], div') || btn.parentElement;
                if (card) {
                    const text = card.innerText;
                    results.push(text);
                }
            });
            return results;
        }""")

        print("=" * 70)
        print(f"{'EMPLOYEE NAME':<20} | {'HOURS':<8} | {'GROSS':<10} | {'NET SALARY':<10}")
        print("=" * 70)

        # Regex pattern to match hours like "109.44h" or "70.23h"
        hour_pattern = r"(\d+(?:\.\d+)?)h"

        for raw_text in extracted_data:
            lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
            if not lines:
                continue

            # First non-empty line is usually the employee's name (e.g. "Deepanshu Dhingra")
            name = lines[0]
            
            # Find the line that mentions hours (e.g. "2026-10 · 109.44h")
            hours = 0.0
            for line in lines:
                match = re.search(hour_pattern, line)
                if match:
                    hours = float(match.group(1))
                    break

            # If we found an employee name and valid line, calculate their pay!
            if hours > 0 or "Deepanshu" in name or "Jaspreet" in name:
                salary = calculate_pay(hours_worked=hours, hourly_rate=30.0)
                print(f"{name:<20} | {hours:<6}h | ${salary['gross']:<9.2f} | ${salary['net']:<9.2f}")

        print("=" * 70)
        print("\nPress ENTER in your terminal to close the browser...")
        input()
        browser.close()

if __name__ == "__main__":
    scrape_and_calculate()