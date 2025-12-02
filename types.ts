// types.ts

export enum AppStep {
  LOGIN = 'LOGIN', // Select Room ID and Role
  COURT_SESSION = 'COURT_SESSION', // Both inputs happen here
  JUDGING = 'JUDGING',
  VERDICT = 'VERDICT'
}

export interface LitigantData {
  name: string;
  story: string;
  grievance: string;
}

export interface VerdictData {
  summary: string;
  plaintiffFaultScore: number;
  defendantFaultScore: number;
  verdictReasoning: string;
  plaintiffAdvice: string;
  defendantAdvice: string;
  reconciliationRitual: string;
}

export interface CaseState {
  step: AppStep;
  plaintiff: LitigantData;
  defendant: LitigantData;
  verdict: VerdictData | null;
  error: string | null;
  roomId: string;
  role: 'PLAINTIFF' | 'DEFENDANT' | null;
  isConnected: boolean;
}

// P2P Message Types
export type SyncMessage = 
  | { type: 'SYNC_DATA'; payload: { role: 'PLAINTIFF' | 'DEFENDANT'; data: LitigantData } }
  | { type: 'SYNC_VERDICT'; payload: VerdictData }
  | { type: 'TRIGGER_JUDGEMENT_START' };
