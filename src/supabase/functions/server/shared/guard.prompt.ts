import type { BrandKit, GuardInput } from './brandkit.types.ts';

export class GuardPrompt {
  static buildToneAnalysisPrompt(input: GuardInput): string {
    const { text, brand, context } = input;
    
    return `Analiza el siguiente texto para evaluar su alineación con las directrices de tono de marca.

TEXTO A ANALIZAR:
"${text}"

DIRECTRICES DE MARCA:
- Tono deseado: ${brand.tone.do.join(', ')}
- Tono a evitar: ${brand.tone.dont.join(', ')}
- Nivel de lectura: ${brand.tone.readingLevel || 'no especificado'}
${context?.objective ? `- Objetivo del mensaje: ${context.objective}` : ''}
${context?.audience ? `- Audiencia: ${context.audience}` : ''}

EVALUACIÓN REQUERIDA:
1. ¿El texto mantiene el tono deseado según las directrices?
2. ¿Evita los tonos no deseados?
3. ¿Es apropiado para el nivel de lectura especificado?
4. ¿Hay aspectos del tono que podrían mejorarse?

RESPUESTA (JSON):
{
  "toneScore": [0-100],
  "findings": [
    {
      "type": "tone",
      "severity": "info|warn|block",
      "message": "descripción específica del problema de tono",
      "suggestion": "sugerencia de mejora específica"
    }
  ],
  "suggestedRewrite": "versión mejorada del texto que mantiene el mensaje pero ajusta el tono (solo si es necesario)"
}`;
  }

  static buildClaimsAnalysisPrompt(input: GuardInput): string {
    const { text, brand } = input;
    
    return `Analiza el siguiente texto para detectar afirmaciones que puedan requerir validación o disclaimer.

TEXTO A ANALIZAR:
"${text}"

AFIRMACIONES PERMITIDAS:
${brand.claims.allowed.join('\n')}

AFIRMACIONES PROHIBIDAS:
${brand.claims.forbidden.join('\n')}

AFIRMACIONES QUE REQUIEREN DISCLAIMER:
${brand.claims.needsDisclaimer?.join('\n') || 'Ninguna especificada'}

EVALUACIÓN REQUERIDA:
1. ¿El texto contiene afirmaciones prohibidas?
2. ¿Contiene afirmaciones que requieren disclaimer?
3. ¿Las afirmaciones están alineadas con las permitidas?
4. ¿Hay riesgo legal o de cumplimiento?

RESPUESTA (JSON):
{
  "claimsScore": [0-100],
  "findings": [
    {
      "type": "claim",
      "severity": "info|warn|block",
      "message": "descripción de la afirmación problemática",
      "suggestion": "alternativa sugerida"
    }
  ],
  "disclaimerNeeded": true/false,
  "disclaimerType": "standard|legal"
}`;
  }

  static buildComprehensiveRewritePrompt(input: GuardInput, heuristicFindings: any[]): string {
    const { text, brand, role } = input;
    
    return `Reescribe el siguiente ${role === 'user' ? 'mensaje del usuario' : 'respuesta del asistente'} para alinearlo completamente con las directrices de marca.

TEXTO ORIGINAL:
"${text}"

DIRECTRICES DE MARCA:
- Tono deseado: ${brand.tone.do.join(', ')}
- Tono a evitar: ${brand.tone.dont.join(', ')}
- Términos preferidos: ${brand.lexicon.preferred.slice(0, 5).join(', ')}
- Términos a evitar: ${brand.lexicon.avoid.slice(0, 5).join(', ')}
- Uso de emoji: ${brand.style.emoji ? 'permitido' : 'no permitido'}
- Máximo exclamaciones: ${brand.style.exclamationMax || 'sin límite'}

PROBLEMAS DETECTADOS AUTOMÁTICAMENTE:
${heuristicFindings.map(f => `- ${f.message}`).join('\n')}

INSTRUCCIONES:
1. Mantén el mensaje y propósito original
2. Ajusta el tono según las directrices
3. Reemplaza términos problemáticos con alternativas de marca
4. Asegura cumplimiento de formato (emoji, exclamaciones, etc.)
5. Si eres ${role}, mantén el estilo conversacional apropiado

RESPUESTA (JSON):
{
  "rewrittenText": "versión mejorada del texto",
  "changes": [
    {
      "type": "tone|lexicon|format",
      "original": "texto original problemático",
      "replacement": "texto corregido",
      "reason": "explicación del cambio"
    }
  ],
  "improvementScore": [0-100]
}`;
  }

  static buildQuickToneCheckPrompt(text: string, toneGuidelines: string[]): string {
    return `Evalúa rápidamente si este texto mantiene un tono: ${toneGuidelines.join(', ')}.

Texto: "${text}"

Responde solo: CUMPLE / NO_CUMPLE / PARCIAL`;
  }
}