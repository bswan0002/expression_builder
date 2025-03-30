import React, { useEffect, useRef, useState } from "react";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView, keymap, highlightActiveLine } from "@codemirror/view";
import { startCompletion } from "@codemirror/autocomplete";
import { defaultKeymap } from "@codemirror/commands";
import { Plus, Minus, X, Divide, RotateCcw, Save, Trash2 } from "lucide-react";
import {
  ExpressionBuilderProps,
  Metric,
  DateRange,
  MetricWithRange,
  CustomMetric,
} from "../types/expression";
import { evaluateExpression } from "../utils/expressionEvaluator";
import { arithmeticLanguage } from "../language/arithmetic";

const ExpressionBuilder: React.FC<ExpressionBuilderProps> = ({
  initialValue = "",
  metrics = [],
  customMetrics = [],
  onChange,
  onSaveCustomMetric,
  onDeleteCustomMetric,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();
  const [usedMetrics, setUsedMetrics] = useState<MetricWithRange[]>([]);
  const [currentExpression, setCurrentExpression] = useState<string>(initialValue);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [customMetricName, setCustomMetricName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

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
    setCurrentExpression(value);
    setIsValid(isValid);
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
  const getExtensions = () => [
    keymap.of(defaultKeymap),
    arithmeticLanguage(metrics, customMetrics),
    highlightActiveLine(),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const value = update.state.doc.toString();
        
        // Auto-trigger completion when typing '{'
        if (update.state.selection.main.empty && 
            update.startState.doc.length < update.state.doc.length) {
          const lastChar = value.charAt(update.state.selection.main.head - 1);
          if (lastChar === '{') {
            setTimeout(() => {
              if (viewRef.current) startCompletion(viewRef.current);
            }, 10);
          }
        }
        
        try {
          const result = evaluateExpression(value, metrics, customMetrics);
          handleExpressionChange(value, true, result);
        } catch (error) {
          handleExpressionChange(value, false);
        }
      }
    }),
  ];

  // Update editor when customMetrics changes, but preserve cursor position and selection
  // Use ref to store current custom metrics to avoid unnecessary re-renders
  const prevCustomMetricsRef = useRef<CustomMetric[]>([]);
  const prevMetricsRef = useRef<Metric[]>([]);
  
  useEffect(() => {
    // Only update the editor if metrics or customMetrics have actually changed
    const customMetricsChanged = 
      JSON.stringify(prevCustomMetricsRef.current) !== JSON.stringify(customMetrics);
    const metricsChanged = 
      JSON.stringify(prevMetricsRef.current) !== JSON.stringify(metrics);
      
    if ((customMetricsChanged || metricsChanged) && viewRef.current && editorRef.current) {
      const view = viewRef.current;
      
      // Save important state
      const currentDoc = view.state.doc;
      const currentSelection = view.state.selection;
      
      // Create new state with updated extensions but preserved doc and selection
      const state = EditorState.create({
        doc: currentDoc,
        extensions: getExtensions(),
        selection: currentSelection,
      });
      
      // Update the editor
      view.setState(state);
      
      // Update refs to avoid unnecessary re-renders
      prevCustomMetricsRef.current = [...customMetrics];
      prevMetricsRef.current = [...metrics];
    }
  }, [customMetrics, metrics]);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialValue,
      extensions: getExtensions(),
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
    
    // Schedule the autocomplete to start after the transaction is processed
    setTimeout(() => {
      if (view) startCompletion(view);
    }, 10);
  };

  const clearExpression = () => {
    const view = viewRef.current;
    if (!view) return;

    const transaction = view.state.update({
      changes: { from: 0, to: view.state.doc.length, insert: "" },
    });
    view.dispatch(transaction);
    
    // If not in editing mode, also clear the metric name
    if (!isEditing) {
      setCustomMetricName("");
    }
  };

  const handleSaveCustomMetric = () => {
    if (customMetricName && currentExpression && isValid) {
      onSaveCustomMetric?.(customMetricName, currentExpression);
      setCustomMetricName("");
      setIsEditing(false);
      
      // Clear the editor
      const view = viewRef.current;
      if (view) {
        const transaction = view.state.update({
          changes: { from: 0, to: view.state.doc.length, insert: "" },
        });
        view.dispatch(transaction);
      }
    }
  };

  const handleDeleteCustomMetric = (name: string) => {
    // If we're deleting the metric we're currently editing, clear the form
    if (customMetricName === name) {
      setCustomMetricName("");
      setIsEditing(false);
    }
    onDeleteCustomMetric?.(name);
  };
  
  // Handle selecting a custom metric for editing
  const handleEditCustomMetric = (metric: CustomMetric) => {
    // Set the name in the input field
    setCustomMetricName(metric.name);
    setIsEditing(true);
    
    // Set the expression in the editor
    const view = viewRef.current;
    if (!view) return;
    
    const transaction = view.state.update({
      changes: { from: 0, to: view.state.doc.length, insert: metric.expression },
    });
    view.dispatch(transaction);
    view.focus();
  };
  
  // Handle canceling the edit
  const handleCancelEdit = () => {
    setCustomMetricName("");
    setIsEditing(false);
    
    // Clear the editor
    const view = viewRef.current;
    if (view) {
      const transaction = view.state.update({
        changes: { from: 0, to: view.state.doc.length, insert: "" },
      });
      view.dispatch(transaction);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="mb-4 flex justify-between">
        <div className="flex space-x-2">
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
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={customMetricName}
            onChange={(e) => setCustomMetricName(e.target.value)}
            placeholder={isEditing ? "Editing metric..." : "Custom metric name"}
            className={`p-2 border rounded w-44 ${isEditing ? 'border-blue-400 bg-blue-50' : ''}`}
          />
          <button
            onClick={handleSaveCustomMetric}
            disabled={!customMetricName || !isValid || currentExpression.trim() === ""}
            className="p-2 rounded bg-green-500 text-white disabled:bg-gray-300 flex items-center"
            title={!isValid ? "Cannot save invalid expression" : isEditing ? "Update custom metric" : "Save as custom metric"}
          >
            <Save size={20} />
          </button>
          <button
            onClick={isEditing ? handleCancelEdit : clearExpression}
            className={`p-2 rounded flex items-center ${
              isEditing 
                ? "bg-gray-300 hover:bg-gray-400" 
                : "bg-red-100 hover:bg-red-200"
            }`}
            title={isEditing ? "Cancel editing" : "Reset"}
          >
            {isEditing ? <X size={20} /> : <RotateCcw size={20} />}
          </button>
        </div>
      </div>
      
      <p className="mb-4">
        Use <code className="bg-gray-100 px-2 py-1 rounded">{"{}"}</code> to
        insert metrics
      </p>
      <div
        ref={editorRef}
        className="border rounded p-2 min-h-[100px] font-mono text-sm"
      />

      {customMetrics && customMetrics.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Custom Metrics</h3>
          <div className="space-y-2">
            {customMetrics.map((metric) => (
              <div
                key={metric.name}
                className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 ${
                  isEditing && customMetricName === metric.name ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'
                }`}
              >
                <div 
                  className="flex-1 cursor-pointer" 
                  onClick={() => handleEditCustomMetric(metric)}
                  title="Click to edit this custom metric"
                >
                  <div className="font-medium">{metric.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{metric.expression}</div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleEditCustomMetric(metric)}
                    className="p-1 text-blue-500 hover:text-blue-700 mr-1"
                    title="Edit custom metric"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCustomMetric(metric.name)}
                    className="p-1 text-red-500 hover:text-red-700"
                    title="Delete custom metric"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
