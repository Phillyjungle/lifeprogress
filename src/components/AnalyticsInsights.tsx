import React from 'react';
import { useProgress } from '../context/ProgressContext';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { DOMAIN_CONFIG } from '../config/domains';
import { DomainKey, DomainCorrelation, VariabilityInsight } from '../types/analytics';

interface Props {
  className?: string;
}

export const AnalyticsInsights: React.FC<Props> = ({ className }) => {
  const { analysisResults } = useProgress();

  if (!analysisResults) {
    return (
      <div className="text-center py-12 text-[var(--color-text-muted)]">
        Loading analysis results...
      </div>
    );
  }

  const { correlations, variabilityInsights, overallInsight, topPerformingDomain, needsAttentionDomain } = analysisResults;

  // Type assertion for Object.entries to preserve key types
  const variabilityEntries = Object.entries(variabilityInsights as Record<DomainKey, VariabilityInsight>);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Domain Relationships */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Domain Relationships</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlations.map((correlation: DomainCorrelation, index: number) => (
            <div
              key={index}
              className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1">
                  <span className="font-medium" style={{ color: DOMAIN_CONFIG[correlation.domain1].color }}>
                    {DOMAIN_CONFIG[correlation.domain1].label}
                  </span>
                  <span className="mx-2">and</span>
                  <span className="font-medium" style={{ color: DOMAIN_CONFIG[correlation.domain2].color }}>
                    {DOMAIN_CONFIG[correlation.domain2].label}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-[var(--color-text-muted)]">Strength:</span>
                  <span className="font-medium">{correlation.strength.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{correlation.insight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pattern Analysis */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Pattern Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {variabilityEntries.map(([domain, insight]) => (
            <div
              key={domain}
              className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="font-medium"
                  style={{ color: DOMAIN_CONFIG[domain as DomainKey].color }}
                >
                  {DOMAIN_CONFIG[domain as DomainKey].label}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    insight.level === 'high'
                      ? 'bg-red-100 text-red-700'
                      : insight.level === 'moderate'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {insight.level} variability
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-muted)]">{insight.insight}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Personal Insights */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Personal Insights</h3>
        <div className="grid grid-cols-1 gap-4">
          {/* Overall Insight */}
          <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
            <p className="text-[var(--color-text)]">{overallInsight || 'Start tracking your progress to see insights.'}</p>
          </div>

          {/* Top Performing Domain */}
          {topPerformingDomain && (
            <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <h4 className="font-medium">Top Performing Domain</h4>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-medium"
                  style={{ color: DOMAIN_CONFIG[topPerformingDomain.domain].color }}
                >
                  {DOMAIN_CONFIG[topPerformingDomain.domain].label}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {topPerformingDomain.insight}
                </span>
              </div>
            </div>
          )}

          {/* Needs Attention Domain */}
          {needsAttentionDomain && (
            <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)]">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                <h4 className="font-medium">Needs Attention</h4>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-medium"
                  style={{ color: DOMAIN_CONFIG[needsAttentionDomain.domain].color }}
                >
                  {DOMAIN_CONFIG[needsAttentionDomain.domain].label}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {needsAttentionDomain.insight}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}; 