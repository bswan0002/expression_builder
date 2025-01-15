import React, { useEffect, useRef } from "react";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView, keymap, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { Plus, Minus, X, Divide, RotateCcw } from "lucide-react";
import { ExpressionBuilderProps } from "../types/expression";
import { evaluateExpression } from "../utils/expressionEvaluator";
import { arithmeticLanguage } from "../language/arithmetic";

const ExpressionBuilder: React.FC<ExpressionBuilderProps> = ({
  initialValue = "",
  metrics = [],
  onChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView>();

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
          onChange?.(value, true, result);
        } catch (error) {
          onChange?.(value, false);
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
          onClick={clearExpression}
          className="p-2 rounded bg-red-100 hover:bg-red-200 ml-auto"
        >
          <RotateCcw size={20} />
        </button>
      </div>
      <p className="mb-4">
        Use <code>{"`{}`"} to insert expressions</code>
      </p>
      <div
        ref={editorRef}
        className="border rounded p-2 min-h-[100px] font-mono text-sm"
      />
    </div>
  );
};

export default ExpressionBuilder;
