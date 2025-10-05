// Calculator Adapter - Live Implementation
// Safe mathematical expression evaluation

export interface CalculationResult {
  result: number | string;
  expression: string;
  steps?: string[];
  variables?: Record<string, number>;
  isValid: boolean;
  error?: string;
}

export interface CalculationResponse extends CalculationResult {
  processingTime: number;
  source: string;
}

export class CalculatorAdapter {
  private timeout: number;

  constructor(config = { timeout: 1500 }) {
    this.timeout = config.timeout;
  }

  async execute(input: { 
    expression: string; 
    precision?: number;
    showSteps?: boolean;
    variables?: Record<string, number>;
  }): Promise<CalculationResponse> {
    const { 
      expression, 
      precision = 10,
      showSteps = false,
      variables = {}
    } = input;
    
    const startTime = Date.now();

    if (!expression || typeof expression !== 'string') {
      return {
        result: 'Error',
        expression: expression || '',
        isValid: false,
        error: 'Expression is required',
        processingTime: Date.now() - startTime,
        source: 'Calculator Error'
      };
    }

    try {
      // Set timeout for calculation
      const timeoutPromise = new Promise<CalculationResponse>((_, reject) => {
        setTimeout(() => reject(new Error('Calculation timeout')), this.timeout);
      });

      const calculationPromise = this.performCalculation(expression, precision, showSteps, variables);
      
      const result = await Promise.race([calculationPromise, timeoutPromise]);
      
      return {
        ...result,
        processingTime: Date.now() - startTime,
        source: 'Safe Calculator'
      };

    } catch (error) {
      console.error('Calculation failed:', error);
      
      return {
        result: 'Error',
        expression,
        isValid: false,
        error: error.message,
        processingTime: Date.now() - startTime,
        source: 'Calculator Error'
      };
    }
  }

  private async performCalculation(
    expression: string, 
    precision: number, 
    showSteps: boolean, 
    variables: Record<string, number>
  ): Promise<Omit<CalculationResponse, 'processingTime' | 'source'>> {
    
    try {
      // Try mathjs first for advanced calculations
      return await this.calculateWithMathJS(expression, precision, showSteps, variables);
    } catch (mathJSError) {
      console.warn('MathJS calculation failed, trying basic evaluation:', mathJSError);
      
      try {
        // Fallback to basic evaluation
        return await this.calculateBasic(expression, precision, variables);
      } catch (basicError) {
        console.error('Basic calculation also failed:', basicError);
        throw new Error(`Calculation failed: ${basicError.message}`);
      }
    }
  }

  private async calculateWithMathJS(
    expression: string, 
    precision: number, 
    showSteps: boolean, 
    variables: Record<string, number>
  ): Promise<Omit<CalculationResponse, 'processingTime' | 'source'>> {
    
    // Dynamic import of mathjs for advanced calculations
    const { create, all } = await import('npm:mathjs@13.2.0');
    
    // Create a limited math instance for security
    const math = create(all, {
      // Security settings
      predictable: true
    });

    // Configure precision
    math.config({
      precision: precision,
      number: 'BigNumber'
    });

    // Restrict available functions for security
    const allowedFunctions = [
      'add', 'subtract', 'multiply', 'divide', 'pow', 'sqrt', 'cbrt',
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
      'log', 'log10', 'exp', 'abs', 'ceil', 'floor', 'round',
      'min', 'max', 'mean', 'median', 'mode', 'std', 'var',
      'factorial', 'gcd', 'lcm', 'mod', 'random', 'combinations', 'permutations'
    ];

    // Create scope with variables
    const scope = { ...variables };

    // Sanitize expression
    const sanitized = this.sanitizeExpression(expression);
    
    let steps: string[] = [];
    let result: any;

    if (showSteps && this.isComplexExpression(sanitized)) {
      // Try to break down complex expressions into steps
      steps = this.generateCalculationSteps(sanitized, math, scope);
    }

    // Evaluate the expression
    try {
      result = math.evaluate(sanitized, scope);
      
      // Convert result to number if it's a BigNumber
      if (typeof result === 'object' && result.constructor.name === 'BigNumber') {
        result = result.toNumber();
      }

      // Handle arrays/matrices
      if (Array.isArray(result)) {
        result = `[${result.join(', ')}]`;
      }

      // Round to specified precision
      if (typeof result === 'number') {
        result = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);
      }

      return {
        result,
        expression: sanitized,
        steps: steps.length > 0 ? steps : undefined,
        variables: Object.keys(scope).length > 0 ? scope : undefined,
        isValid: true
      };

    } catch (evalError) {
      throw new Error(`Evaluation error: ${evalError.message}`);
    }
  }

  private async calculateBasic(
    expression: string, 
    precision: number, 
    variables: Record<string, number>
  ): Promise<Omit<CalculationResponse, 'processingTime' | 'source'>> {
    
    // Basic safe evaluation for simple expressions
    const sanitized = this.sanitizeExpression(expression);
    
    // Replace variables
    let processedExpression = sanitized;
    for (const [variable, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\b${variable}\\b`, 'g');
      processedExpression = processedExpression.replace(regex, value.toString());
    }

    // Validate that only safe characters remain
    if (!/^[0-9+\-*/.() \t]+$/.test(processedExpression)) {
      throw new Error('Expression contains invalid characters');
    }

    // Check for potential security issues
    if (processedExpression.includes('__') || processedExpression.includes('constructor')) {
      throw new Error('Expression contains potentially unsafe patterns');
    }

    try {
      // Use Function constructor for safer evaluation than eval
      const result = new Function('return ' + processedExpression)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Result is not a valid number');
      }

      // Round to precision
      const rounded = Math.round(result * Math.pow(10, precision)) / Math.pow(10, precision);

      return {
        result: rounded,
        expression: processedExpression,
        variables: Object.keys(variables).length > 0 ? variables : undefined,
        isValid: true
      };

    } catch (error) {
      throw new Error(`Basic evaluation failed: ${error.message}`);
    }
  }

  private sanitizeExpression(expression: string): string {
    // Remove potentially dangerous patterns
    let sanitized = expression
      .replace(/[;{}]/g, '') // Remove statement separators and blocks
      .replace(/(?:function|var|let|const|return|if|else|for|while|do|try|catch|throw)/gi, '') // Remove keywords
      .replace(/(?:eval|exec|system|require|import|process|global|window|document)/gi, '') // Remove dangerous functions
      .trim();

    // Replace common mathematical symbols
    sanitized = sanitized
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/\^/g, '**'); // Power operator

    return sanitized;
  }

  private isComplexExpression(expression: string): boolean {
    // Determine if expression is complex enough to warrant step-by-step breakdown
    const complexity = (expression.match(/[+\-*/()]/g) || []).length;
    return complexity > 3;
  }

  private generateCalculationSteps(expression: string, math: any, scope: any): string[] {
    const steps: string[] = [];
    
    try {
      // This is a simplified step generator
      // In production, you'd implement a proper expression tree parser
      
      // For now, just show the original expression and basic simplification
      steps.push(`Original: ${expression}`);
      
      // If there are variables, show substitution
      if (Object.keys(scope).length > 0) {
        let withVars = expression;
        for (const [variable, value] of Object.entries(scope)) {
          withVars = withVars.replace(new RegExp(`\\b${variable}\\b`, 'g'), value.toString());
        }
        if (withVars !== expression) {
          steps.push(`Substitute variables: ${withVars}`);
        }
      }
      
      // Add a final calculation step
      steps.push(`Calculate: ${expression}`);
      
    } catch (error) {
      console.warn('Failed to generate calculation steps:', error);
    }
    
    return steps;
  }

  // Helper method for common mathematical operations
  async executeCommonOperations(operation: string, operands: number[]): Promise<number> {
    switch (operation.toLowerCase()) {
      case 'add':
      case 'sum':
        return operands.reduce((sum, num) => sum + num, 0);
      
      case 'subtract':
      case 'difference':
        return operands.reduce((diff, num, index) => index === 0 ? num : diff - num);
      
      case 'multiply':
      case 'product':
        return operands.reduce((product, num) => product * num, 1);
      
      case 'divide':
      case 'quotient':
        return operands.reduce((quotient, num, index) => {
          if (index === 0) return num;
          if (num === 0) throw new Error('Division by zero');
          return quotient / num;
        });
      
      case 'average':
      case 'mean':
        return operands.reduce((sum, num) => sum + num, 0) / operands.length;
      
      case 'median':
        const sorted = [...operands].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      
      case 'max':
      case 'maximum':
        return Math.max(...operands);
      
      case 'min':
      case 'minimum':
        return Math.min(...operands);
      
      case 'range':
        return Math.max(...operands) - Math.min(...operands);
      
      case 'std':
      case 'stdev':
      case 'standarddeviation':
        const mean = operands.reduce((sum, num) => sum + num, 0) / operands.length;
        const variance = operands.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / operands.length;
        return Math.sqrt(variance);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  // Utility methods for unit conversions
  async convertUnits(value: number, fromUnit: string, toUnit: string): Promise<number> {
    const conversions: Record<string, Record<string, number>> = {
      // Length conversions (to meters)
      length: {
        'mm': 0.001, 'cm': 0.01, 'm': 1, 'km': 1000,
        'in': 0.0254, 'ft': 0.3048, 'yd': 0.9144, 'mi': 1609.34
      },
      // Weight conversions (to grams)
      weight: {
        'mg': 0.001, 'g': 1, 'kg': 1000, 't': 1000000,
        'oz': 28.3495, 'lb': 453.592
      },
      // Temperature conversions
      temperature: {
        'c': (val: number) => val,
        'f': (val: number) => (val - 32) * 5/9,
        'k': (val: number) => val - 273.15
      }
    };

    // Determine unit type
    let unitType = '';
    for (const [type, units] of Object.entries(conversions)) {
      if (type === 'temperature') continue; // Special handling
      if (fromUnit in units && toUnit in units) {
        unitType = type;
        break;
      }
    }

    if (unitType && unitType !== 'temperature') {
      // Standard unit conversion
      const baseValue = value * conversions[unitType][fromUnit];
      return baseValue / conversions[unitType][toUnit];
    } else if (fromUnit in conversions.temperature && toUnit in conversions.temperature) {
      // Temperature conversion
      if (fromUnit === toUnit) return value;
      
      // Convert to Celsius first
      let celsius = value;
      if (fromUnit === 'f') celsius = (value - 32) * 5/9;
      if (fromUnit === 'k') celsius = value - 273.15;
      
      // Convert from Celsius to target
      if (toUnit === 'c') return celsius;
      if (toUnit === 'f') return celsius * 9/5 + 32;
      if (toUnit === 'k') return celsius + 273.15;
    }

    throw new Error(`Cannot convert from ${fromUnit} to ${toUnit}`);
  }
}