from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        print("Running verification script...")
        # 1. Arrange: Go to the application's home page.
        page.goto("http://localhost:3000")

        # 2. Assert: Confirm the main content is visible.
        # We expect to see the "Chat Maestro" heading.
        page.wait_for_selector('h1:has-text("Chat Maestro")')

        # 3. Screenshot: Capture the final result for visual verification.
        screenshot_path = "jules-scratch/verification/verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {os.path.abspath(screenshot_path)}")
        browser.close()

if __name__ == "__main__":
    run()