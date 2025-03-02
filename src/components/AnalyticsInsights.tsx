import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, ThumbsUp } from 'lucide-react';
import { DomainData, DomainInsight, AnalysisResults, DomainChange, DomainCorrelation } from '../types/analytics';
import { DOMAIN_CONFIG } from '../config/domains';
import {
  DomainKey,
  DomainSelection,
  ALL_DOMAINS,
  getDomainLabel,
  getDomainColor,
  shouldDisplayDomain,
  getDomainValue
} from '../utils/domainUtils';

interface AnalyticsInsightsProps {
  domainData: DomainData | null;
  recentChange: DomainChange | null;
  domainInsights: Record<DomainKey, DomainInsight>;
  correlationData: DomainCorrelation[];
  analysisResults: AnalysisResults;
  selectedDomain: DomainSelection;
  onDomainSelect: (domain: DomainSelection) => void;
}

export function AnalyticsInsights({
  domainData,
  recentChange,
  domainInsights,
  correlationData,
  analysisResults,
  selectedDomain,
  onDomainSelect
}: AnalyticsInsightsProps) {
  const insightTextRef = useRef<HTMLDivElement>(null);
  const [isLightTheme, setIsLightTheme] = useState(true);

  // Initialize analysisResults with default values if properties are undefined
  const safeAnalysisResults = {
    variabilityInsights: analysisResults?.variabilityInsights || {},
    correlations: analysisResults?.correlations || [],
    suggestions: analysisResults?.suggestions || [],
    overallInsight: analysisResults?.overallInsight || '',
    topPerformingDomain: analysisResults?.topPerformingDomain || null,
    needsAttentionDomain: analysisResults?.needsAttentionDomain || null
  };

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark-theme');
      setIsLightTheme(!isDark);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-8">
      {/* Personal Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Personal Insights</h3>
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <p className="text-gray-700 dark:text-gray-300">{safeAnalysisResults.overallInsight}</p>
        </div>
      </div>

      {/* Personalized Suggestions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Personalized Suggestions</h3>
        <div className="space-y-4">
          {safeAnalysisResults.suggestions.map((suggestion, index) => (
            <div key={index} className="p-4 rounded-lg border border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-3">
                <ThumbsUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                <p className="text-gray-700 dark:text-gray-300">{suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing & Needs Attention */}
      {(safeAnalysisResults.topPerformingDomain || safeAnalysisResults.needsAttentionDomain) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {safeAnalysisResults.topPerformingDomain && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Top Performing Area</h3>
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getDomainColor(safeAnalysisResults.topPerformingDomain) + '20' }}
                  >
                    <span style={{ color: getDomainColor(safeAnalysisResults.topPerformingDomain) }}>
                      {getDomainLabel(safeAnalysisResults.topPerformingDomain)[0]}
                    </span>
                  </div>
                  <span className="font-medium">{getDomainLabel(safeAnalysisResults.topPerformingDomain)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Keep up the great work in this area! Your consistent high performance here shows your dedication.
                </p>
              </div>
            </div>
          )}

          {safeAnalysisResults.needsAttentionDomain && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6">Area Needing Attention</h3>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getDomainColor(safeAnalysisResults.needsAttentionDomain) + '20' }}
                  >
                    <span style={{ color: getDomainColor(safeAnalysisResults.needsAttentionDomain) }}>
                      {getDomainLabel(safeAnalysisResults.needsAttentionDomain)[0]}
                    </span>
                  </div>
                  <span className="font-medium">{getDomainLabel(safeAnalysisResults.needsAttentionDomain)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Consider focusing more attention on this area. Small improvements here can lead to better overall balance.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Domain Selection */}
      <div className="flex flex-wrap gap-2">
        <button
          className={`px-3 py-1 text-xs rounded-full ${
            selectedDomain === ALL_DOMAINS ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]' : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
          }`}
          onClick={() => onDomainSelect(ALL_DOMAINS)}
        >
          All Domains
        </button>
        {(Object.entries(DOMAIN_CONFIG) as [DomainKey, typeof DOMAIN_CONFIG[DomainKey]][]).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              className={`px-3 py-1 text-xs rounded-full flex items-center ${
                selectedDomain === key ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]' : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
              }`}
              onClick={() => onDomainSelect(key)}
            >
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(DOMAIN_CONFIG) as [DomainKey, typeof DOMAIN_CONFIG[DomainKey]][]).map(([domain, config]) => {
          if (!shouldDisplayDomain(domain, selectedDomain)) return null;

          const insight = domainInsights[domain];
          const variabilityInsight = safeAnalysisResults.variabilityInsights[domain];
          const currentValue = domainData ? getDomainValue(domainData, domain) : null;
          const status = determineStatus(domain, currentValue, recentChange);
          const Icon = config.icon;

          return (
            <div
              key={domain}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
              style={{
                borderLeft: `4px solid ${getDomainColor(domain)}`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${getDomainColor(domain)}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: getDomainColor(domain) }} />
                  </div>
                  <h3 className="text-lg font-semibold">{getDomainLabel(domain)}</h3>
                </div>
                <div
                  className={`px-2 py-1 rounded text-sm font-medium ${
                    status === 'Improving' ? 'bg-green-100 text-green-800' :
                    status === 'Declining' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {status}
                </div>
              </div>

              <div className="space-y-4">
                {insight && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Current Score</span>
                      <span className="font-medium">{insight.trend.current.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500">Average</span>
                      <span className="font-medium">{insight.average.toFixed(1)}</span>
                    </div>
                    {variabilityInsight && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Variability</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          variabilityInsight?.level === 'low' ? 'bg-green-100 text-green-700' :
                          variabilityInsight?.level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                          variabilityInsight?.level === 'high' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {variabilityInsight?.level || 'moderate'} variability
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {variabilityInsight?.insight && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {variabilityInsight.insight}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Correlation Insights */}
      {correlationData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Pattern Analysis</h3>
          <div className="space-y-4">
            {correlationData.map((correlation, index) => {
              const sourceLabel = getDomainLabel(correlation.source);
              const targetLabel = getDomainLabel(correlation.target);
              const strengthClass = correlation.strength >= 0.7 ? 'text-green-600' : 'text-blue-600';

              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`mt-1 ${strengthClass}`}>
                    {correlation.positive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">{sourceLabel}</span> and{' '}
                    <span className="font-medium">{targetLabel}</span> show a{' '}
                    {correlation.positive ? 'positive' : 'negative'} correlation
                    {correlation.strength >= 0.7 ? ' (strong)' : ' (moderate)'}.
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function determineStatus(domain: DomainKey, currentValue: number | null, recentChange: DomainChange | null): 'No Data' | 'Improving' | 'Declining' | 'Stable' {
  if (!currentValue) return 'No Data';
  if (!recentChange || recentChange.domain !== domain) return 'Stable';
  return recentChange.difference > 0 ? 'Improving' : 'Declining';
}