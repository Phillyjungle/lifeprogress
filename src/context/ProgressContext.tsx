import React, { createContext, useContext, useState, useEffect } from 'react';
import { DomainData, AnalysisResults, DomainKey } from '../types/analytics';
import { calculateDomainInsights, calculateDomainCorrelations, calculateDomainVariability, getVariabilityInsight } from '../utils/analyticsUtils';
import { DOMAIN_CONFIG } from '../config/domains';
import { generateSampleData } from '../utils/analyticsUtils';

interface ProgressContextType {
  entries: DomainData[];
  addEntry: (entry: DomainData) => void;
  updateEntry: (entry: DomainData) => void;
  analysisResults: AnalysisResults | null;
  setAnalysisResults: React.Dispatch<React.SetStateAction<AnalysisResults | null>>;
  refreshAnalysis: () => void;
  selectedTimeRange: 'week' | 'month' | 'quarter' | 'year';
  setSelectedTimeRange: (range: 'week' | 'month' | 'quarter' | 'year') => void;
}

const defaultAnalysisResults: AnalysisResults = {
  correlations: [],
  variabilityInsights: Object.keys(DOMAIN_CONFIG).reduce((acc, domain) => {
    const domainKey = domain as DomainKey;
    acc[domainKey] = {
      level: 'low',
      score: 0,
      insight: 'Not enough data to analyze variability.'
    };
    return acc;
  }, {} as Record<DomainKey, { level: 'low' | 'moderate' | 'high'; score: number; insight: string }>),
  overallInsight: 'Start tracking your progress to see insights.',
  topPerformingDomain: null,
  needsAttentionDomain: null
};

const ProgressContext = createContext<ProgressContextType>({
  entries: [],
  addEntry: () => {},
  updateEntry: () => {},
  analysisResults: defaultAnalysisResults,
  setAnalysisResults: () => {},
  refreshAnalysis: () => {},
  selectedTimeRange: 'month',
  setSelectedTimeRange: () => {},
});

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [entries, setEntries] = useState<DomainData[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(defaultAnalysisResults);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Load entries from localStorage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem('progressEntries');
    if (storedEntries) {
      try {
        const parsedEntries = JSON.parse(storedEntries);
        if (Array.isArray(parsedEntries) && parsedEntries.length > 0) {
          setEntries(parsedEntries);
          refreshAnalysis();
        } else {
          // Generate sample data if parsed entries are empty
          const sampleData = generateSampleData();
          setEntries(sampleData);
          localStorage.setItem('progressEntries', JSON.stringify(sampleData));
        }
      } catch (error) {
        console.error('Failed to parse stored entries:', error);
        // Generate sample data on error
        const sampleData = generateSampleData();
        setEntries(sampleData);
        localStorage.setItem('progressEntries', JSON.stringify(sampleData));
      }
    } else {
      // If no entries exist, generate sample data
      const sampleData = generateSampleData();
      setEntries(sampleData);
      localStorage.setItem('progressEntries', JSON.stringify(sampleData));
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('progressEntries', JSON.stringify(entries));
  }, [entries]);

  // Recalculate analysis results when entries or time range changes
  useEffect(() => {
    refreshAnalysis();
  }, [entries, selectedTimeRange]);

  const addEntry = (entry: DomainData) => {
    // Validate date is not in the future
    const entryDate = new Date(entry.date);
    if (entryDate > new Date()) {
      console.error('Cannot add entry with future date');
      return;
    }

    setEntries(prev => {
      // Check if entry for this date already exists
      const existingIndex = prev.findIndex(e => e.date === entry.date);
      if (existingIndex >= 0) {
        // Update existing entry
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], ...entry };
        return updated;
      }
      // Add new entry
      return [...prev, entry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
  };

  const updateEntry = (entry: DomainData) => {
    setEntries(prev => 
      prev.map(e => e.date === entry.date ? { ...e, ...entry } : e)
    );
  };

  const refreshAnalysis = () => {
    if (entries.length === 0) {
      setAnalysisResults(defaultAnalysisResults);
      return;
    }

    // Filter entries based on selected time range
    const now = new Date();
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      switch (selectedTimeRange) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return entryDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          return entryDate >= monthAgo;
        case 'quarter':
          const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          return entryDate >= quarterAgo;
        case 'year':
          const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          return entryDate >= yearAgo;
        default:
          return true;
      }
    });

    if (filteredEntries.length === 0) {
      setAnalysisResults(defaultAnalysisResults);
      return;
    }

    const correlations = calculateDomainCorrelations(filteredEntries);

    // Find top performing and needs attention domains
    let topPerformingDomain: { domain: DomainKey; insight: string } | null = null;
    let needsAttentionDomain: { domain: DomainKey; insight: string } | null = null;
    let maxScore = -1;
    let minScore = 11;

    const domains = Object.keys(DOMAIN_CONFIG) as DomainKey[];
    const latestEntry = filteredEntries[filteredEntries.length - 1];

    domains.forEach(domain => {
      const currentScore = latestEntry[domain] as number || 0;
      if (currentScore > maxScore) {
        maxScore = currentScore;
        topPerformingDomain = {
          domain,
          insight: `Consistently high performance in ${DOMAIN_CONFIG[domain].label.toLowerCase()}`
        };
      }
      if (currentScore < minScore && currentScore > 0) {
        minScore = currentScore;
        needsAttentionDomain = {
          domain,
          insight: `Focus needed in ${DOMAIN_CONFIG[domain].label.toLowerCase()}`
        };
      }
    });

    // Initialize variabilityInsights with default values for all domains
    const variabilityInsights: Record<DomainKey, { level: 'low' | 'moderate' | 'high'; score: number; insight: string }> = 
      Object.keys(DOMAIN_CONFIG).reduce((acc, domain) => {
        const domainKey = domain as DomainKey;
        const variability = calculateDomainVariability(filteredEntries, domainKey);
        acc[domainKey] = {
          level: variability.level,
          score: variability.score,
          insight: getVariabilityInsight(domainKey, variability.level)
        };
        return acc;
      }, {} as Record<DomainKey, { level: 'low' | 'moderate' | 'high'; score: number; insight: string }>);

    setAnalysisResults({
      correlations: correlations.map(corr => ({
        domain1: corr.source as DomainKey,
        domain2: corr.target as DomainKey,
        strength: corr.strength,
        positive: corr.positive,
        insight: `${DOMAIN_CONFIG[corr.source as DomainKey].label} and ${DOMAIN_CONFIG[corr.target as DomainKey].label} show a ${corr.positive ? 'positive' : 'negative'} correlation with ${corr.strength.toFixed(2)} strength.`
      })),
      variabilityInsights,
      overallInsight: filteredEntries.length > 0 
        ? 'Analysis complete. Review your domain relationships and patterns above.'
        : 'Start tracking your progress to see insights.',
      topPerformingDomain,
      needsAttentionDomain
    });
  };

  return (
    <ProgressContext.Provider value={{
      entries,
      addEntry,
      updateEntry,
      analysisResults,
      setAnalysisResults,
      refreshAnalysis,
      selectedTimeRange,
      setSelectedTimeRange
    }}>
      {children}
    </ProgressContext.Provider>
  );
}; 