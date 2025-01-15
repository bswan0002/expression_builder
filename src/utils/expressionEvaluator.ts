import { Metric } from '../types/expression';

export class ExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpressionError';
  }
}

export const evaluateExpression = (expression: string, metrics: Metric[] = []): number => {
  try {
    // Replace metric references (in curly braces) with their values
    let processedExpression = expression;
    metrics.forEach(metric => {
      const regex = new RegExp(`\\{${metric.name}\\}`, 'g');
      processedExpression = processedExpression.replace(regex, metric.value.toString());
    });

    // Remove any remaining curly braces and their contents
    processedExpression = processedExpression.replace(/\{[^}]*\}/g, '');

    // Validate the expression only contains allowed characters
    if (!/^[\d\s+\-*/().]+$/.test(processedExpression)) {
      throw new ExpressionError('Invalid characters in expression');
    }

    // Use Function constructor to evaluate the expression
    // This is safe because we've already validated the input
    const result = new Function(`return ${processedExpression}`)();

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new ExpressionError('Invalid result');
    }

    return result;
  } catch (error) {
    if (error instanceof ExpressionError) {
      throw error;
    }
    throw new ExpressionError('Invalid expression');
  }
};