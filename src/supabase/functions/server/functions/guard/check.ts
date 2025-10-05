import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import type { GuardInput, GuardReport } from '../../shared/brandkit.types.ts';
import { GuardEngine } from '../../shared/guard.engine.ts';
import * as kv from '../../kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// POST /api/guard/check - Analyze text against brand guidelines
app.post('/make-server-ecf7df64/api/guard/check', async (c) => {
  try {
    const body = await c.req.json();
    const { input } = body as { input: GuardInput };

    // Validate input
    if (!input || !input.text || !input.brand) {
      return c.json({
        error: 'Missing required fields: input.text and input.brand'
      }, 400);
    }

    if (input.text.length === 0) {
      return c.json({
        report: {
          score: 100,
          findings: [],
          disclaimerNeeded: false
        } as GuardReport
      });
    }

    // Log analysis request
    console.log(`[Brand Guard] Analyzing ${input.role} message: ${input.text.substring(0, 100)}...`);

    // Run analysis
    const report = await GuardEngine.analyze(input);

    // Store metrics
    try {
      const metrics = {
        stage: 'brand_guard',
        score: report.score,
        findings_count: report.findings.length,
        timestamp: Date.now(),
        role: input.role,
        text_length: input.text.length
      };
      
      const metricsKey = `brand_guard_metrics:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
      await kv.set(metricsKey, JSON.stringify(metrics));
    } catch (metricsError) {
      console.warn('Failed to store brand guard metrics:', metricsError);
    }

    // Log results
    console.log(`[Brand Guard] Analysis complete - Score: ${report.score}, Findings: ${report.findings.length}`);
    
    if (report.findings.length > 0) {
      console.log('[Brand Guard] Findings:', report.findings.map(f => `${f.severity}: ${f.message}`));
    }

    return c.json({ report });

  } catch (error) {
    console.error('[Brand Guard] Analysis error:', error);
    
    // Return graceful fallback
    const fallbackReport: GuardReport = {
      score: 75,
      findings: [{
        type: 'compliance',
        severity: 'info',
        message: 'Análisis de marca no disponible temporalmente',
        suggestion: 'Revisa manualmente según directrices de marca'
      }],
      disclaimerNeeded: false
    };

    return c.json({ report: fallbackReport });
  }
});

export default app;