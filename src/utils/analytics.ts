import { ProgressData, ProgressEntry } from '../types';

interface MetricResult {
  meanProgress: number;
  finalProgress: number;
  volatility: number;
  timeToStabilization: number | null;
  volatilityInsight: string | null;
}

interface Metrics {
  [key: string]: MetricResult;
}

// Calculate mean of an array of numbers
const mean = (arr: number[]): number => 
  arr.reduce((sum, val) => sum + val, 0) / arr.length;

// Calculate standard deviation
const standardDeviation = (arr: number[]): number => {
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

// Calculate days between two dates
const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateQuantitativeMetrics = (
  entries: ProgressData,
  stabilizationThreshold = 0.5,
  consecutivePoints = 2,
  volatilityThreshold = 1.5
): Metrics => {
  if (entries.length === 0) return {};

  const metrics: Metrics = {};
  const categories = ['health', 'mental', 'social', 'career', 'growth'];

  categories.forEach(category => {
    const scores = entries.map(entry => entry[category as keyof ProgressEntry]);
    const meanProgress = mean(scores);
    const finalProgress = scores[scores.length - 1];
    const volatility = standardDeviation(scores);

    // Calculate time to stabilization
    let stabilizationTime: number | null = null;
    for (let i = 0; i <= scores.length - consecutivePoints; i++) {
      if (scores.slice(i, i + consecutivePoints).every(
        score => Math.abs(score - finalProgress) <= stabilizationThreshold
      )) {
        stabilizationTime = daysBetween(
          entries[0].date,
          entries[i].date
        );
        break;
      }
    }

    metrics[category] = {
      meanProgress,
      finalProgress,
      volatility,
      timeToStabilization: stabilizationTime,
      volatilityInsight: volatility > volatilityThreshold
        ? "High Volatility: This area is fluctuating more than usual. Consider reviewing recent events and factors influencing it."
        : null
    };
  });

  return metrics;
};

export const calculateInsightsAndSuggestions = (metrics: Metrics): string[] => {
  const suggestions: string[] = [];

  // Rule 1: Personal Growth final progress is low
  if (metrics.growth?.finalProgress < 4.0) {
    suggestions.push(
      "Consider setting a small, achievable goal related to Personal Growth this month."
    );
  }

  // Rule 2: Social Life volatility is high
  if (metrics.social?.volatility > 1.7) {
    suggestions.push(
      "Social Life volatility is higher than usual. Reflect on your social interactions and consider scheduling regular social activities."
    );
  }

  // Rule 3: Career vs Mental Health imbalance
  if (metrics.career?.meanProgress > 8.0 && metrics.mental?.meanProgress < 5.0) {
    suggestions.push(
      "While your career is thriving, consider dedicating more time to mental well-being activities this week."
    );
  }

  // Additional insights based on progress patterns
  Object.entries(metrics).forEach(([area, metric]) => {
    if (metric.volatility > 2.0) {
      suggestions.push(
        `${area.charAt(0).toUpperCase() + area.slice(1)} shows high variability. Consider establishing a more consistent routine.`
      );
    }
    if (metric.finalProgress < metric.meanProgress - 1.0) {
      suggestions.push(
        `Recent decline in ${area} detected. Review what changed and make adjustments if needed.`
      );
    }
  });

  return suggestions;
};