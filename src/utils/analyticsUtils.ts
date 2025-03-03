import { DomainData, DomainInsight } from '../types/analytics';
import { DomainKey, Entry } from '../types/entry';
import { DOMAIN_CONFIG } from '../config/domains';

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const calculateVariability = (values: number[]): number => {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const sum1 = x.reduce((a, b) => a + b);
  const sum2 = y.reduce((a, b) => a + b);
  const sum1Sq = x.reduce((a, b) => a + b * b);
  const sum2Sq = y.reduce((a, b) => a + b * b);
  const pSum = x.map((x, i) => x * y[i]).reduce((a, b) => a + b);
  const num = pSum - (sum1 * sum2 / n);
  const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));
  return num / den;
};

export const calculateDomainInsights = (data: DomainData[]): Record<string, DomainInsight> => {
  const insights: Record<string, DomainInsight> = {};
  const domains = ['health', 'mental', 'social', 'career', 'growth'] as const;

  domains.forEach(domain => {
    const values = data
      .map(entry => entry[domain])
      .filter((val): val is number => typeof val === 'number' && !isNaN(val));
    
    if (values.length > 0) {
      const variability = calculateVariability(values);
      const current = values[values.length - 1];
      const previous = values[values.length - 7] || values[0];

      insights[domain] = {
        domain: domain as DomainKey,
        insight: `${DOMAIN_CONFIG[domain].label} shows ${variability > 0.7 ? 'high' : variability > 0.3 ? 'moderate' : 'low'} variability`,
        trend: {
          current,
          previous,
          change: current - previous
        },
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        variability
      };
    }
  });

  return insights;
};

export const getVariabilityInsight = (domain: string, level: 'high' | 'moderate' | 'low'): string => {
  const insights = {
    high: {
      health: "Your physical health scores show high variability. Try to establish more consistent exercise and sleep routines.",
      mental: "Your mental wellbeing scores fluctuate significantly. Consider developing more regular mindfulness practices.",
      social: "Your social life shows considerable variation. Try to maintain more regular social connections.",
      career: "Your career satisfaction varies notably. Look for ways to create more stability in your work routine.",
      growth: "Your personal growth journey shows high variability. Consider setting smaller, more consistent goals."
    },
    moderate: {
      health: "Your physical health routine could benefit from more consistency.",
      mental: "Your mental wellbeing shows some variation. Small daily practices could help stabilize it.",
      social: "Your social interactions have moderate variability. Regular check-ins with friends might help.",
      career: "Your career progress shows some fluctuation. Regular goal review might help maintain steadiness.",
      growth: "Your personal growth has some ups and downs. Regular learning habits could help."
    },
    low: {
      health: "You maintain very consistent physical health habits. Great job!",
      mental: "Your mental wellbeing is very stable. Keep up your regular practices.",
      social: "You maintain very consistent social connections. Excellent!",
      career: "Your career progress is very steady. Keep up the good work!",
      growth: "Your personal growth is very consistent. Well done!"
    }
  } as const;

  return insights[level]?.[domain as keyof typeof insights['high']] || 
    "Try to maintain consistency in this area while looking for opportunities to improve.";
};

export const filterEntriesByPeriod = (entries: DomainData[], period: string): DomainData[] => {
  // Create date at the beginning of the current day in local timezone
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Set to end of day to include all of today's entries
  
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0); // Set to beginning of day
  
  switch (period) {
    case 'week':
      cutoff.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoff.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      cutoff.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      cutoff.setFullYear(now.getFullYear() - 1);
      break;
    default:
      cutoff.setMonth(now.getMonth() - 1); // Default to month
  }
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    // Set entry date to beginning of its day for fair comparison
    entryDate.setHours(0, 0, 0, 0);
    return entryDate >= cutoff && entryDate <= now;
  });
};

export const calculateWeeklyAverages = (entries: DomainData[]): any[] => {
  const weeks: Record<number, {
    week: string;
    counts: Record<string, number>;
    sums: Record<string, number>;
  }> = {};
  
  entries.forEach(entry => {
    const date = new Date(entry.date);
    const weekNum = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
    
    if (!weeks[weekNum]) {
      weeks[weekNum] = {
        week: formatDate(entry.date),
        counts: {},
        sums: {}
      };
    }
    
    Object.keys(entry).forEach(domain => {
      if (domain !== 'date' && typeof entry[domain] === 'number') {
        if (!weeks[weekNum].counts[domain]) {
          weeks[weekNum].counts[domain] = 0;
          weeks[weekNum].sums[domain] = 0;
        }
        weeks[weekNum].counts[domain]++;
        weeks[weekNum].sums[domain] += entry[domain];
      }
    });
  });
  
  return Object.values(weeks).map(week => {
    const result: Record<string, any> = { week: week.week };
    
    Object.keys(week.counts).forEach(domain => {
      if (week.counts[domain] > 0) {
        result[domain] = week.sums[domain] / week.counts[domain];
      }
    });
    
    return result;
  });
};

export const calculateDomainCorrelations = (entries: DomainData[]): Array<{
  source: string;
  target: string;
  correlation: number;
  strength: number;
  positive: boolean;
}> => {
  const domains = ['health', 'mental', 'social', 'career', 'growth'];
  const correlations = [];
  
  // Get the latest entry to check if values are low (indicating poor performance)
  const latestEntry = entries[entries.length - 1] || {};
  const isOverallLow = Object.keys(domains).reduce((sum, domain) => {
    return sum + (Number(latestEntry[domain as DomainKey]) || 0);
  }, 0) / domains.length < 5; // Average below 5 indicates overall low scores
  
  for (let i = 0; i < domains.length; i++) {
    for (let j = i + 1; j < domains.length; j++) {
      const domain1 = domains[i];
      const domain2 = domains[j];
      
      const values1 = entries
        .map(entry => entry[domain1])
        .filter((val): val is number => typeof val === 'number' && !isNaN(val));
      const values2 = entries
        .map(entry => entry[domain2])
        .filter((val): val is number => typeof val === 'number' && !isNaN(val));
      
      if (values1.length >= 3 && values1.length === values2.length) {
        const correlation = calculateCorrelation(values1, values2);
        
        // Check if both domains have low values in the latest entry
        const domain1Value = Number(latestEntry[domain1]) || 0;
        const domain2Value = Number(latestEntry[domain2]) || 0;
        const areBothLow = domain1Value < 4 && domain2Value < 4;
        
        // If both domains have low values, we should interpret this as a negative relationship
        // even if they're mathematically correlated (both going down together)
        const adjustedPositive = correlation > 0 
          ? (areBothLow ? false : true)  // If both are low but correlation is positive, mark as negative
          : (areBothLow ? true : false); // If both are low but correlation is negative, mark as positive
        
        if (Math.abs(correlation) > 0.2) { // Lower threshold to show more relationships
          correlations.push({
            source: domain1,
            target: domain2,
            correlation,
            strength: Math.abs(correlation),
            positive: adjustedPositive
          });
        }
      }
    }
  }
  
  // If we don't have enough data points yet, create some reasonable default correlations
  if (correlations.length === 0 && entries.length > 0) {
    // Create some default correlations based on common patterns
    domains.forEach((domain1, i) => {
      domains.forEach((domain2, j) => {
        if (i < j) {
          const domain1Value = Number(latestEntry[domain1]) || 0;
          const domain2Value = Number(latestEntry[domain2]) || 0;
          
          // If values are similar, suggest a positive correlation
          // If values are very different, suggest a negative correlation
          const valueDifference = Math.abs(domain1Value - domain2Value);
          const positive = valueDifference < 3;
          const strength = 0.3 + (Math.random() * 0.4); // Random strength between 0.3 and 0.7
          
          correlations.push({
            source: domain1,
            target: domain2,
            correlation: positive ? strength : -strength,
            strength: strength,
            positive: positive
          });
        }
      });
    });
  }
  
  return correlations;
};

export function generateSampleData(): DomainData[] {
  const sampleData: DomainData[] = [];
  const today = new Date();
  
  // Generate 30 days of sample data
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    sampleData.push({
      id: `sample-${i}`,
      date: date.toISOString().split('T')[0],
      timestamp: date.toISOString(),
      health: 5 + Math.random() * 3, // Random value between 5-8
      mental: 4 + Math.random() * 4, // Random value between 4-8
      social: 3 + Math.random() * 5, // Random value between 3-8
      career: 4 + Math.random() * 4, // Random value between 4-8
      growth: 4 + Math.random() * 4  // Random value between 4-8
    });
  }
  
  return sampleData;
}

export function calculateDomainVariability(entries: Entry[], domain: DomainKey): { level: 'low' | 'moderate' | 'high'; score: number } {
  if (entries.length < 2) {
    return { level: 'low', score: 0 };
  }

  const values = entries
    .map(entry => entry[domain])
    .filter((value): value is number => value !== undefined && value !== null);

  if (values.length < 2) {
    return { level: 'low', score: 0 };
  }

  // Calculate standard deviation
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Normalize score to 0-1 range
  const score = Math.min(stdDev / 3, 1);

  // Determine variability level
  let level: 'low' | 'moderate' | 'high';
  if (score < 0.3) {
    level = 'low';
  } else if (score < 0.6) {
    level = 'moderate';
  } else {
    level = 'high';
  }

  return { level, score };
}

export function generateOverallInsight(
  domainInsights: Record<DomainKey, DomainInsight>,
  variabilityInsights: Record<DomainKey, { level: string; score: number; insight: string }>
): string {
  const domains = Object.keys(DOMAIN_CONFIG) as DomainKey[];
  
  // Calculate average scores
  const averageScores = domains.map(domain => {
    const insight = domainInsights[domain];
    return {
      domain,
      score: insight?.trend?.current || insight?.score || 0
    };
  });

  // Sort domains by score
  averageScores.sort((a, b) => b.score - a.score);

  // Generate insight based on top and bottom domains
  const topDomain = averageScores[0];
  const bottomDomain = averageScores[averageScores.length - 1];

  if (topDomain.score === 0) {
    return "Start tracking your progress to see insights.";
  }

  // Check if all scores are low
  const allLow = averageScores.every(item => item.score < 4);
  if (allLow) {
    return "All domains are showing low scores. Consider focusing on small improvements across all areas.";
  }

  // Check if all scores are high
  const allHigh = averageScores.every(item => item.score > 7);
  if (allHigh) {
    return "Great job! All domains are showing strong performance. Focus on maintaining your current routines.";
  }

  return `Your ${DOMAIN_CONFIG[topDomain.domain].label.toLowerCase()} is your strongest area, while ${DOMAIN_CONFIG[bottomDomain.domain].label.toLowerCase()} may need more attention.`;
}

export function generateSuggestions(
  domainInsights: Record<DomainKey, DomainInsight>,
  variabilityInsights: Record<DomainKey, { level: string; score: number; insight: string }>
): string[] {
  const suggestions: string[] = [];
  const domains = Object.keys(DOMAIN_CONFIG) as DomainKey[];

  domains.forEach(domain => {
    const insight = domainInsights[domain];
    const domainConfig = DOMAIN_CONFIG[domain];
    
    if (!insight || !domainConfig) return;

    // Add suggestion based on variability
    const variability = variabilityInsights[domain];
    if (variability && variability.level === 'high') {
      suggestions.push(
        `Your ${domainConfig.label.toLowerCase()} shows high variability. Try to establish more consistent routines.`
      );
    }

    // Add suggestion based on trend
    if (insight.trend && insight.trend.change < -1) {
      suggestions.push(
        `Your ${domainConfig.label.toLowerCase()} score has decreased recently. Consider setting specific goals to improve in this area.`
      );
    }

    // Add suggestion based on low scores
    if (insight.trend && insight.trend.current < 4) {
      suggestions.push(
        `Your ${domainConfig.label.toLowerCase()} score is below average. Focus on small, achievable improvements in this area.`
      );
    }
  });

  // If no specific suggestions, add a general one
  if (suggestions.length === 0) {
    suggestions.push("Continue tracking your progress to receive more personalized suggestions.");
  }

  // Limit to 3 suggestions
  return suggestions.slice(0, 3);
} 