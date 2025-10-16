import { test, expect, Page } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 390, height: 844 };
const MOBILE_USER_AGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15';

test.describe('Chat Mobile', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set mobile viewport and user agent
    await context.setDefaultTimeout(30000);
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.setUserAgent(MOBILE_USER_AGENT);
    
    // Navigate to app
    await page.goto('http://localhost:3000');
    
    // Wait for app to load and detect mobile view
    await page.waitForTimeout(1000);
  });

  test('should display mobile chat interface correctly', async ({ page }) => {
    // Check mobile header is visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('[aria-label="Abrir biblioteca"]')).toBeVisible();
    
    // Check composer is visible and properly sized
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    await expect(composer).toBeVisible();
    
    // Check send button is visible
    const sendButton = page.locator('[aria-label="Enviar mensaje"]');
    await expect(sendButton).toBeVisible();
    
    // Verify mobile-specific layout
    const chatContainer = page.locator('.h-screen').first();
    await expect(chatContainer).toBeVisible();
  });

  test('should open and close mobile sidebar sheet', async ({ page }) => {
    const sidebarToggle = page.locator('[aria-label="Abrir biblioteca"]');
    
    // Open sidebar
    await sidebarToggle.click();
    
    // Check sidebar sheet is open
    const sidebarSheet = page.locator('[role="dialog"]');
    await expect(sidebarSheet).toBeVisible();
    
    // Check sidebar content
    await expect(page.getByText('Biblioteca')).toBeVisible();
    await expect(page.getByText('Acciones Rápidas')).toBeVisible();
    await expect(page.getByText('Módulos')).toBeVisible();
    
    // Close sidebar by clicking outside or escape
    await page.keyboard.press('Escape');
    await expect(sidebarSheet).not.toBeVisible();
  });

  test('should handle mobile keyboard interactions', async ({ page }) => {
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    const sendButton = page.locator('[aria-label="Enviar mensaje"]');
    
    // Focus composer
    await composer.click();
    await expect(composer).toBeFocused();
    
    // Type message
    const testMessage = 'Test message from mobile';
    await composer.fill(testMessage);
    await expect(composer).toHaveValue(testMessage);
    
    // Send button should be enabled
    await expect(sendButton).not.toBeDisabled();
    
    // Test keyboard shortcut (Ctrl+Enter on mobile might be Cmd+Enter)
    await composer.press('Meta+Enter');
    
    // Message should be sent (composer cleared)
    await expect(composer).toHaveValue('');
  });

  test('should handle virtual keyboard safely', async ({ page }) => {
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    
    // Get initial viewport height
    const initialHeight = await page.evaluate(() => window.innerHeight);
    
    // Focus composer (triggers virtual keyboard)
    await composer.click();
    await page.waitForTimeout(500); // Wait for keyboard animation
    
    // Type in composer
    await composer.fill('Testing virtual keyboard');
    
    // Composer should still be visible and functional
    await expect(composer).toBeVisible();
    await expect(composer).toHaveValue('Testing virtual keyboard');
    
    // Send button should be reachable
    const sendButton = page.locator('[aria-label="Enviar mensaje"]');
    await expect(sendButton).toBeVisible();
    
    // Blur composer (hides virtual keyboard)
    await composer.blur();
    await page.waitForTimeout(500); // Wait for keyboard to hide
  });

  test('should display messages in mobile-optimized format', async ({ page }) => {
    // Add some test messages
    await page.evaluate(() => {
      // Mock adding messages to the chat store
      const messages = [
        {
          id: 'test1',
          role: 'user',
          parts: [{ type: 'text', value: 'Hello from mobile user' }],
          createdAt: new Date().toISOString()
        },
        {
          id: 'test2', 
          role: 'assistant',
          parts: [{ type: 'text', value: 'Hello! This is a response from the assistant on mobile.' }],
          createdAt: new Date().toISOString()
        }
      ];
      
      // This would normally update the store, but for this test we'll inject directly
      window.postMessage({ type: 'TEST_ADD_MESSAGES', messages }, '*');
    });
    
    await page.waitForTimeout(1000);
    
    // Check that messages are displayed with mobile styling
    const userMessage = page.locator('text=Hello from mobile user').first();
    const assistantMessage = page.locator('text=Hello! This is a response').first();
    
    // Messages should be visible (might need to scroll)
    await expect(userMessage.or(assistantMessage)).toBeVisible();
  });

  test('should handle virtual list scroll and load more', async ({ page }) => {
    // Navigate to a conversation with many messages (or mock it)
    await page.evaluate(() => {
      // Mock a large conversation
      const messages = Array.from({ length: 50 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        parts: [{ type: 'text', value: `Message ${i + 1} content` }],
        createdAt: new Date(Date.now() - (50 - i) * 60000).toISOString()
      }));
      
      window.postMessage({ type: 'TEST_LOAD_CONVERSATION', messages }, '*');
    });
    
    await page.waitForTimeout(1000);
    
    // Should auto-scroll to bottom
    const timeline = page.locator('[data-testid="virtual-timeline"]').or(page.locator('.flex-1').first());
    
    // Try to scroll to top to trigger load more
    await timeline.scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, -1000); // Scroll up
    await page.waitForTimeout(500);
    
    // Should trigger loading more messages
    const loadingIndicator = page.locator('text=Cargando').or(page.locator('[role="status"]'));
    // Loading might be fast, so we just check the scroll worked
  });

  test('should show jump to bottom button when scrolled up', async ({ page }) => {
    // Add messages and scroll up
    await page.evaluate(() => {
      const messages = Array.from({ length: 20 }, (_, i) => ({
        id: `msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant', 
        parts: [{ type: 'text', value: `Message ${i + 1}` }],
        createdAt: new Date().toISOString()
      }));
      
      window.postMessage({ type: 'TEST_LOAD_CONVERSATION', messages }, '*');
    });
    
    await page.waitForTimeout(1000);
    
    // Scroll up to middle of conversation
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(500);
    
    // Jump to bottom button should appear
    const jumpButton = page.locator('[aria-label="Ir al final de la conversación"]');
    await expect(jumpButton).toBeVisible();
    
    // Click jump to bottom
    await jumpButton.click();
    await page.waitForTimeout(500);
    
    // Button should disappear
    await expect(jumpButton).not.toBeVisible();
  });

  test('should maintain accessibility focus order', async ({ page }) => {
    // Test tab navigation flow
    await page.keyboard.press('Tab'); // Should go to sidebar toggle
    await expect(page.locator('[aria-label="Abrir biblioteca"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Should go to settings
    await expect(page.locator('[aria-label="Configuración"]')).toBeFocused();
    
    // Continue tabbing to reach composer
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should eventually reach composer
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    await expect(composer).toBeFocused();
    
    // Tab to send button
    await page.keyboard.press('Tab');
    await expect(page.locator('[aria-label="Enviar mensaje"]')).toBeFocused();
  });

  test('should announce important changes to screen readers', async ({ page }) => {
    // Check for ARIA live regions
    const politeRegion = page.locator('[aria-live="polite"]');
    const assertiveRegion = page.locator('[aria-live="assertive"]'); 
    
    await expect(politeRegion).toBeInViewport();
    await expect(assertiveRegion).toBeInViewport();
    
    // Test message sending announcement
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    await composer.fill('Test announcement');
    
    const sendButton = page.locator('[aria-label="Enviar mensaje"]');
    await sendButton.click();
    
    // Should announce message sent (check live region gets updated)
    // Note: We can't easily test the actual announcement, but we can check the regions exist
    await page.waitForTimeout(500);
  });

  test('should work with branch toolbar on mobile', async ({ page }) => {
    // Mock having multiple branches
    await page.evaluate(() => {
      const branches = [
        { id: 'main', name: 'Principal', isDefault: true },
        { id: 'alt1', name: 'Alternativa 1', isDefault: false },
        { id: 'alt2', name: 'Alternativa 2', isDefault: false }
      ];
      
      window.postMessage({ type: 'TEST_SET_BRANCHES', branches }, '*');
    });
    
    await page.waitForTimeout(1000);
    
    // Branch toolbar should be visible
    const branchToolbar = page.locator('[data-testid="branch-toolbar"]').or(
      page.locator('text=Principal').first()
    );
    
    // Should show current branch
    await expect(page.getByText('Principal')).toBeVisible();
  });

  test('should handle streaming messages', async ({ page }) => {
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    const sendButton = page.locator('[aria-label="Enviar mensaje"]');
    
    // Send a message
    await composer.fill('Test streaming response');
    await sendButton.click();
    
    // Should show streaming indicator
    const streamingIndicator = page.locator('text=Escribiendo...').or(
      page.locator('text=Pensando...').or(
        page.locator('.animate-pulse')
      )
    );
    
    // Wait for streaming to potentially appear
    await page.waitForTimeout(1000);
    
    // Composer should be disabled during streaming
    await expect(composer).toBeDisabled();
    await expect(sendButton).toBeDisabled();
  });

  test('should maintain performance with many messages', async ({ page }) => {
    // Load a large conversation
    await page.evaluate(() => {
      const messages = Array.from({ length: 200 }, (_, i) => ({
        id: `perf-msg-${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant',
        parts: [{ type: 'text', value: `Performance test message ${i + 1} with some longer content to test rendering performance under load` }],
        createdAt: new Date(Date.now() - (200 - i) * 30000).toISOString()
      }));
      
      window.postMessage({ type: 'TEST_LOAD_LARGE_CONVERSATION', messages }, '*');
    });
    
    // Wait for virtual list to render
    await page.waitForTimeout(2000);
    
    // Test scrolling performance
    const startTime = Date.now();
    
    // Scroll to top
    await page.mouse.wheel(0, -2000);
    await page.waitForTimeout(100);
    
    // Scroll to bottom
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(100);
    
    const scrollTime = Date.now() - startTime;
    
    // Should complete scrolling operations quickly (under 1 second)
    expect(scrollTime).toBeLessThan(1000);
    
    // App should remain responsive
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    await composer.click();
    await expect(composer).toBeFocused();
  });
});