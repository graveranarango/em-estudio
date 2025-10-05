import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'reports/test-results.xml' }]
  ],
  outputDir: 'test-results/',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop Tests
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.spec\.ts$/,
      testIgnore: /.*mobile\.spec\.ts$/
    },
    
    // Mobile Tests
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /.*mobile\.spec\.ts$/
    },
    
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
      testMatch: /.*mobile\.spec\.ts$/
    },

    // Accessibility Tests (run on both desktop and mobile)
    {
      name: 'a11y-desktop',
      use: { ...devices['Desktop Chrome'] },
      testDir: './tests/a11y',
      testMatch: /.*a11y\.spec\.ts$/
    },
    
    {
      name: 'a11y-mobile',
      use: { ...devices['iPhone 12'] },
      testDir: './tests/a11y',
      testMatch: /.*a11y\.spec\.ts$/
    }
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});