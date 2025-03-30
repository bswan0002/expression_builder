import { Metric, CustomMetric } from '../types/expression';

export class ExpressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpressionError';
  }
}

export const evaluateExpression = (
  expression: string, 
  metrics: Metric[] = [], 
  customMetrics: CustomMetric[] = []
): number => {
  try {
    // Process the expression recursively to handle nested custom metric references
    const processedExpression = processExpression(expression, metrics, customMetrics);

    // Validate the expression only contains allowed characters
    if (!/^[\d\s+\-*/().]+$/.test(processedExpression)) {
      throw new ExpressionError('Invalid characters in expression');
    }

    // Check for invalid operator placement
    if (/^[\s]*[+*/]/.test(processedExpression) ||              // operators at start (except minus)
        /[\s]*[+\-*/][\s]*[+\-*/]/.test(processedExpression) || // consecutive operators
        /[+\-*/][\s]*$/.test(processedExpression)) {            // operators at end
      throw new ExpressionError('Invalid operator placement');
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

// Process an expression by replacing all metric references with their values
const processExpression = (
  expression: string, 
  metrics: Metric[] = [], 
  customMetrics: CustomMetric[] = [],
  processedCustomMetrics: Set<string> = new Set()
): string => {
  let processedExpression = expression;
  
  // Replace standard metric references first
  metrics.forEach(metric => {
    const regex = new RegExp(`\\{${metric.name}\\}`, 'g');
    processedExpression = processedExpression.replace(regex, metric.value.toString());
  });

  // Now handle custom metrics with cycle detection
  const customMetricRegex = /\{([^}]+)\}/g;
  let matches;
  let hasCustomMetrics = false;

  while ((matches = customMetricRegex.exec(processedExpression)) !== null) {
    const metricName = matches[1];
    const customMetric = customMetrics.find(m => m.name === metricName);
    
    if (customMetric) {
      hasCustomMetrics = true;
      
      // Check for circular references
      if (processedCustomMetrics.has(customMetric.name)) {
        throw new ExpressionError(`Circular reference detected in custom metric: ${customMetric.name}`);
      }
      
      // Mark this custom metric as being processed
      processedCustomMetrics.add(customMetric.name);
      
      // Process the custom metric's expression recursively
      const customValue = processExpression(
        customMetric.expression, 
        metrics, 
        customMetrics, 
        processedCustomMetrics
      );
      
      // Calculate the value
      const customMetricValue = evaluateExpression(customValue, metrics, []);
      
      // Replace this custom metric reference with its value
      const regex = new RegExp(`\\{${customMetric.name}\\}`, 'g');
      processedExpression = processedExpression.replace(regex, customMetricValue.toString());
      
      // Reset regex index for next iteration
      customMetricRegex.lastIndex = 0;
      
      // Remove from processing set as we're done with it
      processedCustomMetrics.delete(customMetric.name);
    }
  }
  
  // If we processed any custom metrics, we need to check again for more references
  if (hasCustomMetrics) {
    // Process any remaining metric references
    return processExpression(processedExpression, metrics, customMetrics, processedCustomMetrics);
  }
  
  // Remove any remaining curly braces and their contents
  return processedExpression.replace(/\{[^}]*\}/g, '');
};
