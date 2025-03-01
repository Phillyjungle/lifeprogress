export interface User {
  email: string;
  id: string;
}

export interface ProgressEntry {
  date: string;
  health: number;
  mental: number;
  social: number;
  career: number;
  growth: number;
}

export type ProgressData = ProgressEntry[];