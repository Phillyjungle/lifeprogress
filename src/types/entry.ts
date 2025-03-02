import { DOMAIN_CONFIG } from '../config/domains';

export type DomainKey = keyof typeof DOMAIN_CONFIG;

export interface Entry {
  id: string;
  date: string;
  health: number;
  mental: number;
  social: number;
  career: number;
  growth: number;
  notes?: string;
}

export interface DomainData {
  value: number;
  date: string;
} 