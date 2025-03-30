import { LanguageSupport, StreamLanguage } from "@codemirror/language";
import {
  Completion,
  CompletionContext,
  CompletionResult,
  autocompletion,
  closeBrackets,
} from "@codemirror/autocomplete";
import { bracketMatching } from "@codemirror/language";
import { linter, Diagnostic } from "@codemirror/lint";
import { Metric, CustomMetric } from "../types/expression";

// Create the stream parser for our arithmetic language
const arithmeticParser = {
  token(stream: any) {
    // Skip whitespace
    if (stream.eatSpace()) return null;

    // Handle numbers
    if (stream.match(/\d+(\.\d+)?/)) return "number";

    // Handle metrics in curly braces
    if (stream.match(/\{/)) {
      stream.eatWhile((char: string) => char !== "}");
      if (stream.eat("}")) return "metric";
      return null;
    }

    // Handle operators
    if (stream.match(/[+\-*/]/)) return "operator";

    // Handle parentheses
    if (stream.match(/[()]/)) return "bracket";

    // Skip any other character
    stream.next();
    return null;
  },

  // Enable automatic bracket closing
  languageData: {
    closeBrackets: {
      brackets: ["(", "{"],
    },
  },
};

function createMetricCompletions(metrics: Metric[], customMetrics: CustomMetric[] = []) {
  return (context: CompletionContext): CompletionResult | null => {
    let word = context.matchBefore(/\{[^}]*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    
    // Extract what's been typed so far inside the braces
    let typed = '';
    if (word.text.length > 1) {
      typed = word.text.substring(1).toLowerCase();
    }

    // Create options for all metrics (both regular and custom)
    const allMetricOptions: Completion[] = [];
    
    // Regular metrics
    metrics.forEach((metric) => {
      allMetricOptions.push({
        label: metric.name,
        type: "variable",
        boost: 1, // Higher priority for exact match
        info: `Static metric: ${metric.value}`,
        apply: (view, completion, from, to) => {
          view.dispatch({
            changes: { from, to, insert: `${completion.label}` },
            selection: { anchor: from + completion.label.length },
          });
        },
      });
    });

    // Custom metrics
    customMetrics.forEach((metric) => {
      allMetricOptions.push({
        label: metric.name,
        type: "function",
        boost: 1, // Higher priority for exact match
        info: `Custom metric: ${metric.expression}`,
        apply: (view, completion, from, to) => {
          view.dispatch({
            changes: { from, to, insert: `${completion.label}` },
            selection: { anchor: from + completion.label.length },
          });
        },
      });
    });
    
    // Filter options to include only those that match what's been typed
    // If nothing has been typed, show all options
    let filteredOptions = allMetricOptions;
    if (typed) {
      filteredOptions = allMetricOptions.filter(option => 
        option.label.toLowerCase().includes(typed)
      );
      
      // Boost exact prefix matches
      filteredOptions.forEach(option => {
        if (option.label.toLowerCase().startsWith(typed)) {
          option.boost = 2;
        }
      });
    }

    return {
      from: word.from + 1, // +1 to account for the opening brace
      options: filteredOptions,
      span: /^[^}]*$/, // Continue suggesting until closing brace
      // Explicitly keep completions open until closed with }
      validFor: /^.*$/,
    };
  };
}

// Create a linter that checks for invalid metrics
function createMetricLinter(metrics: Metric[], customMetrics: CustomMetric[] = []) {
  return linter(view => {
    const diagnostics: Diagnostic[] = [];
    const doc = view.state.doc;
    const text = doc.toString();
    
    // Find all metric references using regex
    const metricRegex = /\{([^}]+)\}/g;
    let match;
    
    // Create a set of valid metric names for faster lookup
    const validMetricNames = new Set([
      ...metrics.map(m => m.name),
      ...customMetrics.map(m => m.name)
    ]);
    
    while ((match = metricRegex.exec(text)) !== null) {
      const metricName = match[1];
      
      // Check if the metric exists
      if (!validMetricNames.has(metricName)) {
        // Calculate the position in the document
        const from = match.index + 1;  // +1 to place after the opening brace
        const to = match.index + match[0].length - 1;  // -1 to place before the closing brace
        
        diagnostics.push({
          from,
          to,
          severity: "error",
          message: `Unknown metric: ${metricName}`,
          actions: [{
            name: "Remove invalid metric",
            apply(view, from, to) {
              view.dispatch({
                changes: { from: from - 1, to: to + 1, insert: "" }  // Remove the entire {metric}
              });
            }
          }]
        });
      }
    }
    
    return diagnostics;
  }, {
    delay: 300  // Delay in ms before linting
  });
}

// Create the language support
export function arithmeticLanguage(metrics: Metric[], customMetrics: CustomMetric[] = []) {
  return new LanguageSupport(
    StreamLanguage.define({
      name: "arithmetic",
      ...arithmeticParser,
    }),
    [
      // Add bracket matching
      bracketMatching(),
      closeBrackets(),
      // Add autocompletion for metrics inside curly braces
      autocompletion({
        override: [createMetricCompletions(metrics, customMetrics)],
      }),
      // Add linter for invalid metrics
      createMetricLinter(metrics, customMetrics)
    ]
  );
}
