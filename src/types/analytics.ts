import { LucideIcon, Activity, Brain, Users, Briefcase, Star } from 'lucide-react';
import { DomainKey } from '../utils/domainUtils';

export interface DomainConfig {
  label: string;
  color: string;
  icon: LucideIcon;
  iconBgColor: string;
  glowColor: string;
}

export interface DomainData {
  [key: string]: number | string;
  timestamp: string;
  date: string;
}

export interface DomainInsight {
  trend: {
    current: number;
    previous: number;
    change: number;
  };
  average: number;
  variability: number;
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface DomainChange {
  domain: DomainKey;
  oldValue: number;
  newValue: number;
  difference: number;
}

export interface DomainBalance {
  domain: DomainKey;
  score: number;
  change: number;
}

export interface AnalysisResults {
  correlations: Array<{
    source: DomainKey;
    target: DomainKey;
    correlation: number;
    strength: number;
    positive: boolean;
  }>;
  variabilityInsights: Record<DomainKey, {
    level: 'low' | 'moderate' | 'high';
    score: number;
    insight: string;
  }>;
  overallInsight: string;
  topPerformingDomain: DomainKey | null;
  needsAttentionDomain: DomainKey | null;
  suggestions: string[];
}

export interface DomainTrend {
  domain: DomainKey;
  trend: 'improving' | 'declining' | 'stable';
  score: number;
  change: number;
}

export interface DomainCorrelation {
  source: DomainKey;
  target: DomainKey;
  correlation: number;
  strength: number;
  positive: boolean;
}

export const DOMAIN_CONFIG: Record<string, DomainConfig> = {
  health: {
    label: 'Physical Health',
    color: '#4361ee',
    icon: Activity,
    iconBgColor: 'rgba(67, 97, 238, 0.1)',
    glowColor: 'rgba(67, 97, 238, 0.5)'
  },
  mental: {
    label: 'Mental Wellbeing',
    color: '#4cc9f0',
    icon: Brain,
    iconBgColor: 'rgba(76, 201, 240, 0.1)',
    glowColor: 'rgba(76, 201, 240, 0.5)'
  },
  social: {
    label: 'Social Life',
    color: '#ff8fab',
    icon: Users,
    iconBgColor: 'rgba(255, 143, 171, 0.1)',
    glowColor: 'rgba(255, 143, 171, 0.5)'
  },
  career: {
    label: 'Career Growth',
    color: '#f77f00',
    icon: Briefcase,
    iconBgColor: 'rgba(247, 127, 0, 0.1)',
    glowColor: 'rgba(247, 127, 0, 0.5)'
  },
  growth: {
    label: 'Personal Growth',
    color: '#2a9d8f',
    icon: Star,
    iconBgColor: 'rgba(42, 157, 143, 0.1)',
    glowColor: 'rgba(42, 157, 143, 0.5)'
  }
}; 