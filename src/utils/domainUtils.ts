import { DOMAIN_CONFIG } from '../config/domains';
import { DomainData, ChartDataPoint, DomainCorrelation } from '../types/analytics';

export type DomainKey = keyof typeof DOMAIN_CONFIG;
export type DomainSelection = DomainKey | 'all';

export const ALL_DOMAINS = 'all' as const;

export function getDomainLabel(domain: DomainKey): string {
  return DOMAIN_CONFIG[domain]?.label || domain;
}

export function getDomainColor(domain: DomainKey): string {
  return DOMAIN_CONFIG[domain]?.color || '#6B7280';
}

export function shouldDisplayDomain(domain: DomainKey, selectedDomain: DomainSelection): boolean {
  return selectedDomain === ALL_DOMAINS || selectedDomain === domain;
}

export function getDomainValue(data: DomainData, domain: DomainKey): number | null {
  const value = data[domain];
  return typeof value === 'number' ? value : null;
}

export function formatDomainData(entries: DomainData[]): ChartDataPoint[] {
  return entries.map(entry => {
    const point: ChartDataPoint = { name: entry.date };
    (Object.keys(DOMAIN_CONFIG) as DomainKey[]).forEach(domain => {
      const value = getDomainValue(entry, domain);
      if (value !== null) {
        point[domain] = value;
      }
    });
    return point;
  });
}

export function calculateDomainCorrelations(data: DomainData[]): DomainCorrelation[] {
  const domains = Object.keys(DOMAIN_CONFIG) as DomainKey[];
  const correlations: DomainCorrelation[] = [];

  for (let i = 0; i < domains.length; i++) {
    for (let j = i + 1; j < domains.length; j++) {
      const source = domains[i];
      const target = domains[j];
      
      const sourceValues: number[] = [];
      const targetValues: number[] = [];
      
      data.forEach(entry => {
        const sourceValue = getDomainValue(entry, source);
        const targetValue = getDomainValue(entry, target);
        
        if (sourceValue !== null && targetValue !== null) {
          sourceValues.push(sourceValue);
          targetValues.push(targetValue);
        }
      });
      
      if (sourceValues.length > 1) {
        const correlation = calculateCorrelation(sourceValues, targetValues);
        const strength = Math.abs(correlation);
        
        correlations.push({
          source,
          target,
          correlation,
          strength,
          positive: correlation > 0
        });
      }
    }
  }

  return correlations;
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

export function calculateDomainVariability(data: DomainData[], domain: DomainKey): {
  level: 'low' | 'moderate' | 'high';
  score: number;
} {
  const values = data
    .map(entry => getDomainValue(entry, domain))
    .filter((value): value is number => value !== null);

  if (values.length < 2) {
    return { level: 'low', score: 0 };
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / mean;

  if (coefficientOfVariation > 0.3) return { level: 'high', score: coefficientOfVariation };
  if (coefficientOfVariation > 0.15) return { level: 'moderate', score: coefficientOfVariation };
  return { level: 'low', score: coefficientOfVariation };
}

export function getVariabilityInsight(domain: DomainKey, level: 'low' | 'moderate' | 'high'): string {
  const label = getDomainLabel(domain);
  
  switch (level) {
    case 'high':
      return `Your ${label} shows significant variability. Consider establishing more consistent routines.`;
    case 'moderate':
      return `Your ${label} has some fluctuation. Focus on maintaining stable practices.`;
    case 'low':
      return `Your ${label} is very stable. You've found a consistent approach that works.`;
  }
} 