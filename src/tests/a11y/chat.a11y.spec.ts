import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Chat Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000); // Wait for app to load
  });

  test('should not have any critical accessibility violations on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1366, height: 768 });
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Filter for critical and serious violations
    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    const seriousViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious'
    );

    // Log violations for debugging
    if (criticalViolations.length > 0) {
      console.log('Critical violations:', criticalViolations.map(v => ({
        rule: v.id,
        description: v.description,
        nodes: v.nodes.length
      })));
    }
    
    if (seriousViolations.length > 0) {
      console.log('Serious violations:', seriousViolations.map(v => ({
        rule: v.id,
        description: v.description,
        nodes: v.nodes.length
      })));
    }

    expect(criticalViolations).toHaveLength(0);
    expect(seriousViolations).toHaveLength(0);
  });

  test('should not have any critical accessibility violations on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15');
    
    // Wait for mobile view to activate
    await page.waitForTimeout(1000);
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const criticalViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'critical'
    );
    
    const seriousViolations = accessibilityScanResults.violations.filter(
      violation => violation.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.log('Mobile critical violations:', criticalViolations.map(v => ({
        rule: v.id,
        description: v.description,
        nodes: v.nodes.length
      })));
    }

    expect(criticalViolations).toHaveLength(0);
    expect(seriousViolations).toHaveLength(0);
  });

  test('should have proper ARIA labels on critical controls', async ({ page }) => {
    // Check sidebar toggle
    const sidebarToggle = page.locator('[aria-label="Abrir biblioteca"]');
    await expect(sidebarToggle).toBeVisible();
    await expect(sidebarToggle).toHaveAttribute('aria-label', 'Abrir biblioteca');

    // Check composer
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]');
    if (await composer.isVisible()) {
      await expect(composer).toHaveAttribute('aria-label', 'Escribir mensaje');
    }

    // Check send button  
    const sendButton = page.locator('[aria-label="Enviar mensaje"]');
    if (await sendButton.isVisible()) {
      await expect(sendButton).toHaveAttribute('aria-label', 'Enviar mensaje');
    }

    // Check settings button
    const settingsButton = page.locator('[aria-label="Configuración"]');
    if (await settingsButton.isVisible()) {
      await expect(settingsButton).toHaveAttribute('aria-label', 'Configuración');
    }
  });

  test('should have proper ARIA live regions for announcements', async ({ page }) => {
    // Check for polite live region
    const politeRegion = page.locator('[aria-live="polite"]');
    await expect(politeRegion).toBeInViewport();
    await expect(politeRegion).toHaveAttribute('aria-atomic', 'true');
    await expect(politeRegion).toHaveAttribute('role', 'status');

    // Check for assertive live region
    const assertiveRegion = page.locator('[aria-live="assertive"]');
    await expect(assertiveRegion).toBeInViewport();
    await expect(assertiveRegion).toHaveAttribute('aria-atomic', 'true');
    await expect(assertiveRegion).toHaveAttribute('role', 'alert');
  });

  test('should have sufficient color contrast', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      console.log('Color contrast violations:', contrastViolations.map(v => ({
        nodes: v.nodes.map(n => n.html)
      })));
    }

    expect(contrastViolations).toHaveLength(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Test basic tab navigation
    await page.keyboard.press('Tab');
    
    // Should be able to reach interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Continue tabbing to ensure focus is visible and logical
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      
      // Each focused element should be visible
      if (await currentFocus.count() > 0) {
        await expect(currentFocus).toBeVisible();
      }
    }
  });

  test('should have accessible forms', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-title-only'])
      .analyze();

    const labelViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'label' || violation.id === 'label-title-only'
    );

    if (labelViolations.length > 0) {
      console.log('Label violations:', labelViolations.map(v => ({
        rule: v.id,
        nodes: v.nodes.map(n => n.html)
      })));
    }

    expect(labelViolations).toHaveLength(0);
  });

  test('should have accessible buttons and links', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['button-name', 'link-name'])
      .analyze();

    const nameViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'button-name' || violation.id === 'link-name'
    );

    if (nameViolations.length > 0) {
      console.log('Button/Link name violations:', nameViolations.map(v => ({
        rule: v.id,
        nodes: v.nodes.map(n => n.html)
      })));
    }

    expect(nameViolations).toHaveLength(0);
  });

  test('should handle focus management in modals', async ({ page }) => {
    // Open sidebar (sheet modal on mobile)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);
    
    const sidebarToggle = page.locator('[aria-label="Abrir biblioteca"]');
    await sidebarToggle.click();
    
    // Check if modal/sheet is open
    const modal = page.locator('[role="dialog"]');
    if (await modal.isVisible()) {
      // Focus should be trapped within the modal
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      
      // Focused element should be within the modal
      const isWithinModal = await focusedElement.evaluate((el, modalEl) => {
        return modalEl.contains(el);
      }, await modal.elementHandle());
      
      expect(isWithinModal).toBe(true);
      
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      
      // Modal should be closed
      await expect(modal).not.toBeVisible();
    }
  });

  test('should work with screen reader semantics', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['aria-valid-attr', 'aria-valid-attr-value', 'aria-required-attr'])
      .analyze();

    const ariaViolations = accessibilityScanResults.violations;

    if (ariaViolations.length > 0) {
      console.log('ARIA violations:', ariaViolations.map(v => ({
        rule: v.id,
        description: v.description,
        nodes: v.nodes.length
      })));
    }

    expect(ariaViolations).toHaveLength(0);
  });

  test('should have accessible content structure', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['landmark-one-main', 'region', 'bypass'])
      .analyze();

    const structureViolations = accessibilityScanResults.violations.filter(
      violation => ['landmark-one-main', 'region', 'bypass'].includes(violation.id)
    );

    // Allow moderate violations for bypass (skip links) as they might not be critical
    const criticalStructureViolations = structureViolations.filter(
      violation => violation.impact === 'critical' || violation.impact === 'serious'
    );

    if (criticalStructureViolations.length > 0) {
      console.log('Critical structure violations:', criticalStructureViolations.map(v => ({
        rule: v.id,
        description: v.description
      })));
    }

    expect(criticalStructureViolations).toHaveLength(0);
  });

  test('should handle dynamic content announcements', async ({ page }) => {
    // Send a message to test dynamic content announcements
    const composer = page.locator('textarea[aria-label="Escribir mensaje"]').or(
      page.locator('textarea[placeholder*="mensaje"]')
    );
    
    if (await composer.isVisible()) {
      await composer.fill('Test message for announcements');
      
      const sendButton = page.locator('[aria-label="Enviar mensaje"]').or(
        page.locator('button:has-text("Enviar")')
      );
      
      if (await sendButton.isVisible() && !await sendButton.isDisabled()) {
        await sendButton.click();
        
        // Live regions should still be present after dynamic updates
        await page.waitForTimeout(1000);
        
        const politeRegion = page.locator('[aria-live="polite"]');
        const assertiveRegion = page.locator('[aria-live="assertive"]');
        
        await expect(politeRegion).toBeInViewport();
        await expect(assertiveRegion).toBeInViewport();
      }
    }
  });
});