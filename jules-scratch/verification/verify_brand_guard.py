from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    try:
        page.goto("http://localhost:3000/")

        # Wait for the chat composer to be visible
        composer = page.locator('textarea[placeholder*="Escribe tu mensaje"]')
        expect(composer).to_be_visible()

        # Type a message
        composer.fill("This is a test message.")

        # The button should now be enabled
        send_button = page.locator('button:has-text("Send")').or_(page.locator('button:has(svg.lucide-send)'))
        expect(send_button).to_be_enabled()

        # Click the send button
        send_button.click()

        # Wait for the message to appear in the chat
        expect(page.locator('text="This is a test message."')).to_be_visible()

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/verification.png")

    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)