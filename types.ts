// types.ts

export enum AppStep {
  LANDING = 'LANDING',
  PLAINTIFF_INPUT = 'PLAINTIFF_INPUT', // 原告 (User A)
  SHARE_WAIT = 'SHARE_WAIT', // Generating link / Passing device
  DEFENDANT_INPUT = 'DEFENDANT_INPUT', // 被告 (User B)
  JUDGING = 'JUDGING',
  VERDICT = 'VERDICT'
}

export interface LitigantData {
  name: string;
  story: string;
  grievance: string; // The specific point of hurt/feeling
}

export interface VerdictData {
  summary: string;
  plaintiffFaultScore: number; // 0-100
  defendantFaultScore: number; // 0-100
  verdictReasoning: string;
  plaintiffAdvice: string;
  defendantAdvice: string;
  reconciliationRitual: string; // A cute task for them to do
}

export interface CaseState {
  step: AppStep;
  plaintiff: LitigantData;
  defendant: LitigantData;
  verdict: VerdictData | null;
  error: string | null;
}
