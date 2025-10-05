import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import type { BrandKit } from '../../../shared/brandkit.types.ts';
import * as kv from '../../../kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// POST /api/guard/rules/update - Update brand guard rules (admin only)
app.post('/make-server-ecf7df64/api/guard/rules/update', async (c) => {
  try {
    // Basic auth check - in production this would be more sophisticated
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token || token !== 'admin-token') {
      return c.json({
        error: 'Unauthorized - Admin access required'
      }, 401);
    }

    const body = await c.req.json();
    const { patch } = body as { patch: Partial<BrandKit> };

    if (!patch) {
      return c.json({
        error: 'Missing patch data'
      }, 400);
    }

    // Get current brand kit rules
    const currentRulesStr = await kv.get('brand_guard_rules');
    let currentRules: BrandKit;
    
    if (currentRulesStr) {
      currentRules = JSON.parse(currentRulesStr);
    } else {
      // Default rules if none exist
      currentRules = {
        tone: {
          do: ['profesional', 'amigable', 'claro'],
          dont: ['agresivo', 'confuso', 'técnico excesivo'],
          readingLevel: 'neutral'
        },
        lexicon: {
          preferred: ['solución', 'experiencia', 'innovación'],
          avoid: ['problema', 'fallo', 'error'],
          banned: ['spam', 'scam', 'fake']
        },
        style: {
          emoji: false,
          exclamationMax: 2,
          linksPolicy: 'need-disclaimer'
        },
        claims: {
          allowed: ['Ofrecemos soluciones innovadoras', 'Experiencia comprobada'],
          forbidden: ['El mejor del mercado', '100% garantizado'],
          needsDisclaimer: ['resultados pueden variar', 'según términos y condiciones']
        },
        disclaimers: {
          standard: 'Esta información se proporciona solo con fines informativos.',
          legal: 'Consulte los términos y condiciones completos en nuestro sitio web.'
        },
        locales: ['es', 'es-ES']
      };
    }

    // Apply patch - deep merge
    const updatedRules = this.deepMerge(currentRules, patch);

    // Validate updated rules
    const validationResult = this.validateBrandKit(updatedRules);
    if (!validationResult.valid) {
      return c.json({
        error: 'Invalid brand kit configuration',
        details: validationResult.errors
      }, 400);
    }

    // Store updated rules
    await kv.set('brand_guard_rules', JSON.stringify(updatedRules));

    // Log update
    console.log('[Brand Guard] Rules updated:', Object.keys(patch));
    console.log('[Brand Guard] New rules stored successfully');

    return c.json({ 
      ok: true,
      updated: updatedRules
    });

  } catch (error) {
    console.error('[Brand Guard] Rules update error:', error);
    return c.json({
      error: 'Failed to update brand guard rules',
      details: error.message
    }, 500);
  }
});

// Helper method for deep merging objects
function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

// Helper method for validating BrandKit structure
function validateBrandKit(brandKit: BrandKit): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required structure
  if (!brandKit.tone || !Array.isArray(brandKit.tone.do) || !Array.isArray(brandKit.tone.dont)) {
    errors.push('Invalid tone configuration');
  }

  if (!brandKit.lexicon || !Array.isArray(brandKit.lexicon.preferred) || !Array.isArray(brandKit.lexicon.avoid)) {
    errors.push('Invalid lexicon configuration');
  }

  if (!brandKit.style || typeof brandKit.style.emoji !== 'boolean') {
    errors.push('Invalid style configuration');
  }

  if (!brandKit.claims || !Array.isArray(brandKit.claims.allowed) || !Array.isArray(brandKit.claims.forbidden)) {
    errors.push('Invalid claims configuration');
  }

  if (!brandKit.disclaimers || !brandKit.disclaimers.standard) {
    errors.push('Invalid disclaimers configuration');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default app;