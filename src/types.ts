export type AnalysisType = 'pros_cons' | 'swot' | 'comparison';

export interface ProCon {
  id: string;
  text: string;
  explanation: string;
}

export interface ProsConsData {
  pros: ProCon[];
  cons: ProCon[];
  summary: string;
}

export interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  summary: string;
}

export interface Option {
  name: string;
  points: string[];
}

export interface ComparisonData {
  options: Option[];
  conclusion: string;
}

export interface Decision {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  analysisType: AnalysisType;
  analysisData: ProsConsData | SwotData | ComparisonData;
  weights: Record<string, number>;
  createdAt: any;
  updatedAt: any;
}
