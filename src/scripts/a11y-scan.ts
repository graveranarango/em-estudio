#!/usr/bin/env tsx

/**
 * Accessibility Scanner Script
 * 
 * Scans the application for accessibility violations using axe-core.
 * Can be run manually or as part of CI/CD pipeline.
 * 
 * Usage:
 *   npm run test:a11y
 *   tsx scripts/a11y-scan.ts
 *   tsx scripts/a11y-scan.ts --url http://localhost:3000
 *   tsx scripts/a11y-scan.ts --config desktop
 */

import { chromium, Browser, Page } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import * as fs from 'fs';
import * as path from 'path';

interface ScanConfig {
  name: string;
  url: string;
  viewport: { width: number; height: number };
  userAgent?: string;
  actions?: Array<(page: Page) => Promise<void>>;
  rules?: {
    enabled?: string[];
    disabled?: string[];
  };
}

interface ViolationSummary {
  total: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
}

// Predefined scan configurations
const SCAN_CONFIGS: Record<string, ScanConfig> = {
  desktop: {
    name: 'Desktop',
    url: 'http://localhost:3000',
    viewport: { width: 1366, height: 768 }
  },
  
  mobile: {
    name: 'Mobile',
    url: 'http://localhost:3000',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  
  chat_desktop: {
    name: 'Chat Desktop',
    url: 'http://localhost:3000',
    viewport: { width: 1366, height: 768 },
    actions: [
      async (page) => {
        // Navigate to chat and perform interactions
        await page.click('[data-module="chat"]');
        await page.waitForTimeout(1000);
        
        // Open right panel
        await page.click('[aria-label="Abrir biblioteca"]');
        await page.waitForTimeout(500);
        
        // Type in composer
        await page.fill('textarea[placeholder*="mensaje"]', 'Test message for accessibility');
        await page.waitForTimeout(500);
      }
    ]
  },
  
  chat_mobile: {
    name: 'Chat Mobile',
    url: 'http://localhost:3000',
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    actions: [
      async (page) => {
        // Wait for mobile view
        await page.waitForTimeout(1000);
        
        // Open mobile sidebar
        await page.click('[aria-label="Abrir biblioteca"]');
        await page.waitForTimeout(500);
        
        // Close sidebar and test composer
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        // Focus composer
        await page.click('textarea[aria-label="Escribir mensaje"]');
        await page.type('textarea[aria-label="Escribir mensaje"]', 'Mobile test message');
        await page.waitForTimeout(500);
      }
    ]
  }
};

// Critical accessibility rules that should never fail
const CRITICAL_RULES = [
  'color-contrast',
  'image-alt',
  'label',
  'button-name',
  'link-name',
  'aria-required-attr',
  'aria-valid-attr-value',
  'aria-hidden-focus',
  'focus-order-semantics',
  'keyboard',
  'tabindex'
];

async function scanPage(config: ScanConfig): Promise<any> {
  let browser: Browser | null = null;
  
  try {
    console.log(`\n🔍 Scanning ${config.name} configuration...`);
    console.log(`   URL: ${config.url}`);
    console.log(`   Viewport: ${config.viewport.width}x${config.viewport.height}`);
    
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
      viewport: config.viewport,
      userAgent: config.userAgent
    });
    
    const page = await context.newPage();
    
    // Navigate to page
    await page.goto(config.url, { waitUntil: 'networkidle' });
    
    // Perform custom actions if specified
    if (config.actions) {
      for (const action of config.actions) {
        await action(page);
      }
    }
    
    // Wait for any dynamic content
    await page.waitForTimeout(2000);
    
    // Build axe scanner
    let axeBuilder = new AxeBuilder({ page });
    
    // Configure rules if specified
    if (config.rules?.enabled) {
      axeBuilder = axeBuilder.withRules(config.rules.enabled);
    }
    if (config.rules?.disabled) {
      axeBuilder = axeBuilder.disableRules(config.rules.disabled);
    }
    
    // Include common accessibility standards
    axeBuilder = axeBuilder.withTags(['wcag2a', 'wcag2aa', 'wcag21aa']);
    
    // Run the scan
    const results = await axeBuilder.analyze();
    
    await browser.close();
    
    return {
      config: config.name,
      url: config.url,
      timestamp: new Date().toISOString(),
      ...results
    };
    
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    throw new Error(`Failed to scan ${config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function analyzeResults(results: any[]): ViolationSummary {
  const summary: ViolationSummary = {
    total: 0,
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0
  };
  
  for (const result of results) {
    if (result.violations) {
      for (const violation of result.violations) {
        summary.total += violation.nodes.length;
        
        switch (violation.impact) {
          case 'critical':
            summary.critical += violation.nodes.length;
            break;
          case 'serious':
            summary.serious += violation.nodes.length;
            break;
          case 'moderate':
            summary.moderate += violation.nodes.length;
            break;
          case 'minor':
            summary.minor += violation.nodes.length;
            break;
        }
      }
    }
  }
  
  return summary;
}

function generateReport(results: any[], summary: ViolationSummary): string {
  const report = ['# Accessibility Scan Report', ''];
  
  report.push(`**Generated:** ${new Date().toISOString()}`);
  report.push('');
  
  // Summary
  report.push('## Summary');
  report.push('');
  report.push(`- **Total Violations:** ${summary.total}`);
  report.push(`- **Critical:** ${summary.critical} 🔴`);
  report.push(`- **Serious:** ${summary.serious} 🟠`);
  report.push(`- **Moderate:** ${summary.moderate} 🟡`);
  report.push(`- **Minor:** ${summary.minor} ⚪`);
  report.push('');
  
  // Status
  const hasBlockingIssues = summary.critical > 0 || summary.serious > 0;
  report.push(`**Status:** ${hasBlockingIssues ? '❌ FAIL' : '✅ PASS'}`);
  report.push('');
  
  // Detailed results
  for (const result of results) {
    if (!result.violations || result.violations.length === 0) {
      report.push(`## ${result.config} ✅`);
      report.push('');
      report.push('No accessibility violations found.');
      report.push('');
      continue;
    }
    
    report.push(`## ${result.config} (${result.violations.length} rule violations)`);
    report.push('');
    
    // Group violations by impact
    const groupedViolations = result.violations.reduce((acc: any, violation: any) => {
      const impact = violation.impact || 'unknown';
      if (!acc[impact]) acc[impact] = [];
      acc[impact].push(violation);
      return acc;
    }, {});
    
    for (const [impact, violations] of Object.entries(groupedViolations)) {
      const icon = {
        critical: '🔴',
        serious: '🟠', 
        moderate: '🟡',
        minor: '⚪',
        unknown: '❓'
      }[impact] || '❓';
      
      report.push(`### ${impact.toUpperCase()} ${icon}`);
      report.push('');
      
      for (const violation of violations as any[]) {
        report.push(`#### ${violation.help}`);
        report.push('');
        report.push(`**Rule:** \`${violation.id}\``);
        report.push(`**Impact:** ${violation.impact}`);
        report.push(`**Nodes affected:** ${violation.nodes.length}`);
        report.push('');
        report.push(`**Description:** ${violation.description}`);
        report.push('');
        
        if (violation.helpUrl) {
          report.push(`**More info:** [${violation.helpUrl}](${violation.helpUrl})`);
          report.push('');
        }
        
        // Show first few affected elements
        const maxNodes = 3;
        const nodesToShow = violation.nodes.slice(0, maxNodes);
        
        report.push('**Affected elements:**');
        report.push('');
        for (let i = 0; i < nodesToShow.length; i++) {
          const node = nodesToShow[i];
          report.push(`${i + 1}. \`${node.target[0]}\``);
          if (node.html) {
            report.push(`   \`\`\`html`);
            report.push(`   ${node.html.substring(0, 200)}${node.html.length > 200 ? '...' : ''}`);
            report.push(`   \`\`\``);
          }
        }
        
        if (violation.nodes.length > maxNodes) {
          report.push(`   ... and ${violation.nodes.length - maxNodes} more`);
        }
        
        report.push('');
      }
    }
  }
  
  return report.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  let configName = 'desktop';
  let customUrl: string | undefined;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--config' && i + 1 < args.length) {
      configName = args[i + 1];
      i++;
    } else if (arg === '--url' && i + 1 < args.length) {
      customUrl = args[i + 1];
      i++;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Accessibility Scanner

Usage:
  tsx scripts/a11y-scan.ts [options]

Options:
  --config <name>    Configuration to use (desktop, mobile, chat_desktop, chat_mobile)
  --url <url>        Custom URL to scan (default: http://localhost:3000)
  --help, -h         Show this help

Examples:
  tsx scripts/a11y-scan.ts
  tsx scripts/a11y-scan.ts --config mobile
  tsx scripts/a11y-scan.ts --config chat_mobile --url http://localhost:3001
      `);
      process.exit(0);
    }
  }
  
  try {
    // Determine configurations to scan
    let configsToScan: ScanConfig[];
    
    if (configName === 'all') {
      configsToScan = Object.values(SCAN_CONFIGS);
    } else if (SCAN_CONFIGS[configName]) {
      configsToScan = [SCAN_CONFIGS[configName]];
    } else {
      throw new Error(`Unknown configuration: ${configName}. Available: ${Object.keys(SCAN_CONFIGS).join(', ')}, all`);
    }
    
    // Apply custom URL if provided
    if (customUrl) {
      configsToScan = configsToScan.map(config => ({ ...config, url: customUrl }));
    }
    
    console.log('🚀 Starting Accessibility Scan');
    console.log(`   Configurations: ${configsToScan.map(c => c.name).join(', ')}`);
    
    // Run scans
    const results = [];
    for (const config of configsToScan) {
      const result = await scanPage(config);
      results.push(result);
    }
    
    // Analyze results
    const summary = analyzeResults(results);
    
    // Generate report
    const report = generateReport(results, summary);
    
    // Save report
    const outputDir = 'reports';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const reportPath = path.join(outputDir, `a11y-scan-${timestamp}.md`);
    
    fs.writeFileSync(reportPath, report);
    
    // Save JSON for CI
    const jsonPath = path.join(outputDir, `a11y-scan-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
    
    // Print summary
    console.log('\n📊 Scan Complete!');
    console.log(`   Report saved: ${reportPath}`);
    console.log(`   JSON data: ${jsonPath}`);
    console.log('');
    console.log('Summary:');
    console.log(`   Total violations: ${summary.total}`);
    console.log(`   Critical: ${summary.critical}`);
    console.log(`   Serious: ${summary.serious}`);
    console.log(`   Moderate: ${summary.moderate}`);
    console.log(`   Minor: ${summary.minor}`);
    
    // Exit with error code if critical issues found
    const hasBlockingIssues = summary.critical > 0 || summary.serious > 0;
    if (hasBlockingIssues) {
      console.log('\n❌ BLOCKING ISSUES FOUND');
      console.log('   Fix critical and serious accessibility violations before deployment.');
      process.exit(1);
    } else {
      console.log('\n✅ ALL CHECKS PASSED');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('\n❌ Scan failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runA11yScan, SCAN_CONFIGS };