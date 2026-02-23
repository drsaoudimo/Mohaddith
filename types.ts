export enum Verdict {
  SAHIH = 'صحيح',
  HASAN = 'حسن',
  GHARIB = 'غريب',
  MAWDU = 'موضوع / منكر'
}

export interface AnalysisResult {
  verdict: Verdict;
  confidenceScore: number; // 0-100
  quranicConsistency: number; // 0-1 (Theta value)
  isnadScore: number; // 0-1 (Continuity * Narrator Reliability)
  matnScore: number; // 0-1 (Semantic integrity)
  reasoning: string;
  mathFormula: string;
  narratorChain?: string[];
  orthogonalityCheck: string; // Explanation of the M perpendicular Q check
}

export interface ChartData {
  subject: string;
  A: number;
  fullMark: number;
}