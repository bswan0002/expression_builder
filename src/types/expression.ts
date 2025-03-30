export interface Metric {
  name: string;
  value: number;
}

export interface ExpressionBuilderProps {
  initialValue?: string;
  metrics?: Metric[];
  onChange?: (value: string, isValid: boolean, result?: number) => void;
}

export type DateRange = "last_24h" | "last_7d" | "last_30d" | "last_90d";

export interface MetricWithRange extends Metric {
  dateRange?: DateRange;
}
