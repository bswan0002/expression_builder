export interface Metric {
  name: string;
  value: number;
}

export interface CustomMetric {
  name: string;
  expression: string;
  isCustom: true;
}

export type MetricOrCustom = Metric | CustomMetric;

export interface ExpressionBuilderProps {
  initialValue?: string;
  metrics?: Metric[];
  customMetrics?: CustomMetric[];
  onChange?: (value: string, isValid: boolean, result?: number) => void;
  onSaveCustomMetric?: (name: string, expression: string) => void;
  onDeleteCustomMetric?: (name: string) => void;
}

export type DateRange = "last_24h" | "last_7d" | "last_30d" | "last_90d";

export interface MetricWithRange extends Metric {
  dateRange?: DateRange;
}
