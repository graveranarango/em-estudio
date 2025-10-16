import { test, expect } from '@playwright/test';

test.describe('Verify Fix', () => {
  test('should display "Chat Maestro"', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000/');

    // Check if "Chat Maestro" is visible
    try {
      await expect(page.getByText('Chat Maestro')).toBeVisible({ timeout: 5000 });
    } catch (error) {
      console.log(await page.content());
      throw error;
    }
  });
});
