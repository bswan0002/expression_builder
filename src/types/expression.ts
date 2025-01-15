export interface Metric {
  name: string;
  value: number;
}

export interface ExpressionBuilderProps {
  initialValue?: string;
  metrics?: Metric[];
  onChange?: (value: string, isValid: boolean, result?: number) => void;
}