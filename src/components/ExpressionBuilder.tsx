import React, { useEffect, useRef, useState } from "react";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView, keymap, highlightActiveLine } from "@codemirror/view";
import { startCompletion } from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import { Plus, Minus, X, Divide, RotateCcw } from "lucide-react";
import {
  ExpressionBuilderProps,
  Metric,
  DateRange,
  MetricWithRange,
} from "../types/expression";
import { evaluateExpression } from "../utils/expressionEvaluator";
import { arithmeticLanguage } from "../language/arithmetic";

const ExpressionBuilder: React.FC<ExpressionBuilderProps> = ({
  initialValue = "",
  metrics = [],
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();
  const [usedMetrics, setUsedMetrics] = useState<MetricWithRange[]>([]);

  // Function to extract metrics from expression
  const extractMetrics = (expression: string): MetricWithRange[] => {
    const metricRegex = /\{([^}]+)\}/g;
    const matches = [...expression.matchAll(metricRegex)];
    const foundMetrics = matches
      .map((match) => metrics.find((m) => m.name === match[1]))
      .filter((m): m is Metric => m !== undefined);

    return foundMetrics.map((metric) => ({
      ...metric,
      dateRange: "last_24h", // default date range
    }));
  };

  // Update used metrics when the expression changes
  const handleExpressionChange = (
    value: string,
    isValid: boolean,
    result?: number
  ) => {
    const newUsedMetrics = extractMetrics(value);
    setUsedMetrics(newUsedMetrics);
    onChange?.(value, isValid, result);
  };

  // Handle date range change for a metric
  const handleDateRangeChange = (metricName: string, dateRange: DateRange) => {
    setUsedMetrics((prev) =>
      prev.map((m) => (m.name === metricName ? { ...m, dateRange } : m))
    );
  };

  // Set up CodeMirror extensions
  const extensions: Extension[] = [
    keymap.of(defaultKeymap),
    arithmeticLanguage(metrics),
    highlightActiveLine(),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const value = update.state.doc.toString();
        try {
          const result = evaluateExpression(value, metrics);
          handleExpressionChange(value, true, result);
        } catch (error) {
          handleExpressionChange(value, false);
        }
      }
    }),
  ];

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialValue,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  const insertOperator = (operator: string) => {
    const view = viewRef.current;
    if (!view) return;

    const doc = view.state.doc;
    const transaction = view.state.update({
      changes: { from: doc.length, insert: ` ${operator} ` },
    });
    view.dispatch(transaction);
  };

  const insertParentheses = () => {
    const view = viewRef.current;
    if (!view) return;

    const doc = view.state.doc;
    const transaction = view.state.update({
      changes: { from: doc.length, insert: "()" },
    });
    view.dispatch(transaction);
  };

  const insertCurlyBraces = () => {
    const view = viewRef.current;
    if (!view) return;

    const doc = view.state.doc;
    const transaction = view.state.update({
      changes: { from: doc.length, insert: "{}" },
      selection: { anchor: doc.length + 1 },
    });
    view.focus();
    view.dispatch(transaction);
    startCompletion(view);
  };

  const clearExpression = () => {
    const view = viewRef.current;
    if (!view) return;

    const transaction = view.state.update({
      changes: { from: 0, to: view.state.doc.length, insert: "" },
    });
    view.dispatch(transaction);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => insertOperator("+")}
          className="p-2 rounded bg-blue-100 hover:bg-blue-200"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={() => insertOperator("-")}
          className="p-2 rounded bg-blue-100 hover:bg-blue-200"
        >
          <Minus size={20} />
        </button>
        <button
          onClick={() => insertOperator("*")}
          className="p-2 rounded bg-blue-100 hover:bg-blue-200"
        >
          <X size={20} />
        </button>
        <button
          onClick={() => insertOperator("/")}
          className="p-2 rounded bg-blue-100 hover:bg-blue-200"
        >
          <Divide size={20} />
        </button>
        <button
          onClick={insertParentheses}
          className="p-2 rounded bg-blue-100 hover:bg-blue-200"
        >
          ( )
        </button>
        <button
          onClick={insertCurlyBraces}
          className="p-2 rounded bg-blue-100 hover:bg-blue-200"
        >
          {"{ }"}
        </button>
        <button
          onClick={clearExpression}
          className="p-2 rounded bg-red-100 hover:bg-red-200 ml-auto"
        >
          <RotateCcw size={20} />
        </button>
      </div>
      <p className="mb-4">
        Use <code className="bg-gray-100 px-2 py-1 rounded">{"{}"}</code> to
        insert metrics
      </p>
      <div
        ref={editorRef}
        className="border rounded p-2 min-h-[100px] font-mono text-sm"
      />
      {usedMetrics.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Used Metrics</h3>
          <div className="space-y-2">
            {usedMetrics.map((metric) => (
              <div
                key={metric.name}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="font-mono">{metric.name}</span>
                <select
                  value={metric.dateRange}
                  onChange={(e) =>
                    handleDateRangeChange(
                      metric.name,
                      e.target.value as DateRange
                    )
                  }
                  className="ml-4 p-1 border rounded"
                >
                  <option value="last_24h">Last 24 Hours</option>
                  <option value="last_7d">Last 7 Days</option>
                  <option value="last_30d">Last 30 Days</option>
                  <option value="last_90d">Last 90 Days</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpressionBuilder;
