import { LanguageSupport, StreamLanguage } from "@codemirror/language"
import { styleTags, tags as t } from "@lezer/highlight"
import { Completion, CompletionContext, CompletionResult, autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { bracketMatching } from "@codemirror/language"
import { Metric } from "../types/expression"

// Create the stream parser for our arithmetic language
const arithmeticParser = {
  token(stream: any) {
    // Skip whitespace
    if (stream.eatSpace()) return null

    // Handle numbers
    if (stream.match(/\d+(\.\d+)?/)) return "number"

    // Handle metrics in curly braces
    if (stream.match(/\{/)) {
      stream.eatWhile(char => char !== '}')
      if (stream.eat('}')) return "metric"
      return null
    }

    // Handle operators
    if (stream.match(/[+\-*/]/)) return "operator"

    // Handle parentheses
    if (stream.match(/[()]/)) return "bracket"

    // Skip any other character
    stream.next()
    return null
  },

  // Enable automatic bracket closing
  languageData: {
    closeBrackets: {
      brackets: ["(", "{"]
    }
  }
}

// Create highlighting rules
const highlighting = styleTags({
  operator: t.operator,
  number: t.number,
  metric: t.variableName,
  bracket: t.bracket
})

function createMetricCompletions(metrics: Metric[]) {
  return (context: CompletionContext): CompletionResult | null => {
    let word = context.matchBefore(/\{[^}]*/)
    if (!word || (word.from === word.to && !context.explicit)) return null
    
    let options: Completion[] = metrics.map(metric => ({
      label: metric.name,
      type: "variable",
      apply: (view, completion, from, to) => {
        view.dispatch({
          changes: { from, to, insert: `${completion.label}` },
          selection: { anchor: from + completion.label.length }
        })
      }
    }))

    return {
      from: word.from + 1, // +1 to account for the opening brace
      options,
      validFor: /^[^}]*$/
    }
  }
}

// Create the language support
export function arithmeticLanguage(metrics: Metric[]) {
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
        override: [createMetricCompletions(metrics)]
      })
    ]
  )
}