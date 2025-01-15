import { useState } from "react";
import ExpressionBuilder from "./components/ExpressionBuilder";
import { Metric } from "./types/expression";

function App() {
  const [expression, setExpression] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [result, setResult] = useState<number | undefined>();

  // Example metrics
  const metrics: Metric[] = [
    { name: "revenue", value: 1000 },
    { name: "costs", value: 500 },
    { name: "profit_margin", value: 0.2 },
  ];

  const handleExpressionChange = (
    value: string,
    valid: boolean,
    evaluatedResult?: number
  ) => {
    setExpression(value);
    setIsValid(valid);
    setResult(evaluatedResult);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Expression Builder
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Available Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="bg-gray-50 p-4 rounded">
                <div className="font-medium text-gray-700">{metric.name}</div>
                <div className="text-gray-600">{metric.value}</div>
              </div>
            ))}
          </div>
        </div>

        <ExpressionBuilder
          initialValue=""
          metrics={metrics}
          onChange={handleExpressionChange}
        />

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Expression Details</h2>
          <div className="space-y-4">
            <div>
              <span className="font-medium">Status: </span>
              <span className={isValid ? "text-green-600" : "text-red-600"}>
                {isValid ? "Valid" : "Invalid"}
              </span>
            </div>
            <div>
              <span className="font-medium">Current Expression: </span>
              <code className="bg-gray-100 px-2 py-1 rounded">
                {expression || "Empty"}
              </code>
            </div>
            {isValid && result !== undefined && (
              <div>
                <span className="font-medium">Result: </span>
                <span className="text-blue-600">{result}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
