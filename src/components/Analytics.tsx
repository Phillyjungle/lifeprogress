import React, { useEffect, useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
import { DOMAIN_CONFIG } from '../config/domains';
import { DomainData, DomainCorrelation, AnalysisResults, DomainInsight, DomainChange, DomainKey } from '../types/analytics';
import { getDomainColor, getDomainLabel, calculateDomainVariability, formatDomainData, getDomainValue, DomainSelection, ALL_DOMAINS } from '../utils/domainUtils';
import { calculateWeeklyAverages, calculateDomainCorrelations, filterEntriesByPeriod } from '../utils/analyticsUtils';
import { Loader2, TrendingUp, TrendingDown, BarChart2, LineChart as LineChartIcon, ThumbsUp } from 'lucide-react';
import { AnalyticsInsights } from './AnalyticsInsights';
import { useProgress } from '../context/ProgressContext';
import { format } from 'date-fns';

interface Props {
  className?: string;
}

type ChartType = 'line' | 'area' | 'bar';

interface DomainTrend {
  current: number;
  previous: number;
  change: number;
}

interface ExtendedDomainInsight {
  domain: DomainKey;
  insight: string;
  trend: DomainTrend;
  average: number;
  variability: number;
}

interface VariabilityInsight {
  level: 'low' | 'moderate' | 'high';
  score: number;
  insight: string;
}

export const Analytics: React.FC<Props> = ({ className }) => {
  const {
    entries,
    analysisResults,
    setAnalysisResults,
    selectedTimeRange,
    setSelectedTimeRange
  } = useProgress();

  const [selectedDomain, setSelectedDomain] = useState<DomainKey | 'all'>('all');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [domainInsights, setDomainInsights] = useState<Record<DomainKey, ExtendedDomainInsight>>({} as Record<DomainKey, ExtendedDomainInsight>);
  const [recentChange, setRecentChange] = useState<DomainChange | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  const weeklyData = useMemo(() => calculateWeeklyAverages(entries), [entries]);

  const areaChartData = useMemo(() => {
    return weeklyData.map((week: Record<string, any>) => ({
      week: week.week,
      ...Object.keys(DOMAIN_CONFIG).reduce<Record<DomainKey, number>>((acc, domain) => ({
        ...acc,
        [domain as DomainKey]: week[domain as DomainKey] || 0
      }), {} as Record<DomainKey, number>)
    }));
  }, [weeklyData]);

  // Filter domains based on selection
  const visibleDomains = useMemo(() => {
    if (selectedDomain === ALL_DOMAINS) {
      return Object.keys(DOMAIN_CONFIG) as DomainKey[];
    }
    return [selectedDomain];
  }, [selectedDomain]);

  const renderDomainIcon = (domain: DomainKey) => {
    const config = DOMAIN_CONFIG[domain];
    const Icon = config.icon;
    return (
      <div 
        className="rounded-full p-2" 
        style={{ backgroundColor: config.color + '20' }}
      >
        {Icon && <Icon className="w-5 h-5" style={{ color: config.color }} />}
      </div>
    );
  };

  useEffect(() => {
    if (!entries.length) return;

    const newCorrelations = calculateDomainCorrelations(entries);
    const domains = Object.keys(DOMAIN_CONFIG) as DomainKey[];
    
    // Initialize variabilityInsights with default values for all domains
    const variabilityInsights: Record<DomainKey, VariabilityInsight> = {
      health: { level: 'low', score: 0, insight: '' },
      mental: { level: 'low', score: 0, insight: '' },
      social: { level: 'low', score: 0, insight: '' },
      career: { level: 'low', score: 0, insight: '' },
      growth: { level: 'low', score: 0, insight: '' }
    };
    
    // Calculate variability insights
    domains.forEach(domain => {
      const variability = calculateDomainVariability(entries, domain);
      const domainLabel = getDomainLabel(domain).toLowerCase();
      let insight = '';
      
      if (variability.level === 'high') {
        insight = `Your ${domainLabel} shows significant variation. Consider establishing more consistent routines.`;
      } else if (variability.level === 'moderate') {
        insight = `Your ${domainLabel} has some fluctuation. Focus on maintaining stable practices.`;
      } else {
        insight = `Your ${domainLabel} is very stable. Keep up your consistent approach!`;
      }
      
      variabilityInsights[domain] = {
        level: variability.level,
        score: variability.score,
        insight
      };
    });

    // Find top performing and needs attention domains
    let topPerformingDomain: { domain: DomainKey; insight: string } | null = null;
    let needsAttentionDomain: { domain: DomainKey; insight: string } | null = null;
    let maxScore = -1;
    let minScore = 11;

    domains.forEach(domain => {
      const currentScore = entries[entries.length - 1]?.[domain] as number || 0;
      if (currentScore > maxScore) {
        maxScore = currentScore;
        topPerformingDomain = {
          domain,
          insight: `Consistently high performance in ${getDomainLabel(domain).toLowerCase()}`
        };
      }
      if (currentScore < minScore && currentScore > 0) {
        minScore = currentScore;
        needsAttentionDomain = {
          domain,
          insight: `Focus needed in ${getDomainLabel(domain).toLowerCase()}`
        };
      }
    });

    // Convert correlations to DomainCorrelation format
    const formattedCorrelations: DomainCorrelation[] = newCorrelations.map(corr => ({
      domain1: corr.source as DomainKey,
      domain2: corr.target as DomainKey,
      strength: corr.strength,
      positive: corr.positive,
      insight: `${DOMAIN_CONFIG[corr.source as DomainKey].label} and ${DOMAIN_CONFIG[corr.target as DomainKey].label} show a ${corr.positive ? 'positive' : 'negative'} correlation with ${corr.strength.toFixed(2)} strength.`
    }));

    const newAnalysisResults: AnalysisResults = {
      correlations: formattedCorrelations,
      variabilityInsights,
      overallInsight: 'Analysis complete. Review your domain relationships and patterns above.',
      topPerformingDomain,
      needsAttentionDomain
    };

    setAnalysisResults(newAnalysisResults);

    // Calculate domain insights
    const insights: Record<DomainKey, ExtendedDomainInsight> = {} as Record<DomainKey, ExtendedDomainInsight>;
    
    domains.forEach(domain => {
      const currentEntry = entries[entries.length - 1];
      const previousEntry = entries[entries.length - 2];
      
      const current = getDomainValue(currentEntry, domain) || 0;
      const previous = previousEntry ? getDomainValue(previousEntry, domain) || 0 : current;
      
      const domainValues = entries
        .map(entry => getDomainValue(entry, domain))
        .filter((value): value is number => value !== null);
      
      const average = domainValues.length
        ? domainValues.reduce((sum, val) => sum + val, 0) / domainValues.length
        : 0;

      const variability = calculateDomainVariability(entries, domain).score;
      
      insights[domain] = {
        domain,
        insight: `${getDomainLabel(domain)} shows ${variability > 0.7 ? 'high' : variability > 0.3 ? 'moderate' : 'low'} variability`,
        average,
        variability,
        trend: {
          current,
          previous,
          change: current - previous
        }
      };
    });

    setDomainInsights(insights);

    // Set recent change
    if (entries.length >= 2) {
      const latestEntry = entries[entries.length - 1];
      const previousEntry = entries[entries.length - 2];
      let maxChange = 0;
      let changeDomain: DomainKey | null = null;
      let oldValue = 0;
      let newValue = 0;

      domains.forEach(domain => {
        const current = getDomainValue(latestEntry, domain);
        const previous = getDomainValue(previousEntry, domain);
        
        if (current !== null && previous !== null) {
          const change = Math.abs(current - previous);
          if (change > maxChange) {
            maxChange = change;
            changeDomain = domain;
            oldValue = previous;
            newValue = current;
          }
        }
      });

      if (changeDomain) {
        setRecentChange({
          domain: changeDomain,
          oldValue,
          newValue,
          difference: newValue - oldValue
        });
      }
    }
  }, [entries, setAnalysisResults]);

  // Update chart data when entries or time range changes
  useEffect(() => {
    if (!entries.length) return;

    const filteredEntries = filterEntriesByPeriod(entries, selectedTimeRange);
    
    // Force re-render by creating a new date object for each entry
    const formattedData = filteredEntries.map((entry: DomainData) => {
      // Parse the date string to ensure proper date handling
      const entryDate = new Date(entry.date);
      
      return {
        // Format date for display
        name: format(entryDate, 'MMM d'),
        // Include the raw date for sorting
        rawDate: entry.date,
        // Include domain values
        ...Object.keys(DOMAIN_CONFIG).reduce((acc, domain) => ({
          ...acc,
          [domain]: Number(entry[domain as DomainKey]).toFixed(1)
        }), {})
      };
    });

    // Sort by date to ensure chronological order
    const sortedData = formattedData.sort((a, b) => 
      new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
    );

    setChartData(sortedData);
  }, [entries, selectedTimeRange]);

  // Early return if no entries
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">No data available yet. Start tracking your progress to see insights.</p>
      </div>
    );
  }

  // Early return if no analysis results
  if (!analysisResults) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-text-secondary)]">Loading analysis results...</p>
      </div>
    );
  }

  const renderChart = () => {
    const ChartComponent = chartType === 'line' ? LineChart : BarChart;
    
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fill: 'var(--color-text)' }} />
          <YAxis domain={[0, 10]} tick={{ fill: 'var(--color-text)' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-border)'
            }}
          />
          <Legend />
          {visibleDomains.map((domain) => (
            chartType === 'line' ? (
              <Line
                key={domain}
                type="linear"
                dataKey={domain}
                stroke={getDomainColor(domain)}
                name={getDomainLabel(domain)}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            ) : (
              <Bar
                key={domain}
                dataKey={domain}
                fill={getDomainColor(domain)}
                name={getDomainLabel(domain)}
              />
            )
          ))}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Time Period Selection */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeRange(period as 'week' | 'month' | 'quarter' | 'year')}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${selectedTimeRange === period
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`
              p-2 rounded-lg transition-colors
              ${chartType === 'line'
                ? 'bg-[var(--color-primary)] text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <LineChartIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`
              p-2 rounded-lg transition-colors
              ${chartType === 'bar'
                ? 'bg-[var(--color-primary)] text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <BarChart2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Domain Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`
            px-4 py-2 rounded-lg transition-colors
            ${selectedDomain === 'all'
              ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]'
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          All Domains
        </button>
        {Object.entries(DOMAIN_CONFIG).map(([domain, config]) => (
          <button
            key={domain}
            onClick={() => setSelectedDomain(domain as DomainKey)}
            className={`
              px-4 py-2 rounded-lg transition-colors whitespace-nowrap
              ${selectedDomain === domain
                ? 'bg-[var(--color-primary-15)]'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
            style={{
              color: selectedDomain === domain ? config.color : undefined
            }}
          >
            {config.label}
          </button>
        ))}
      </div>
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Domain Progress Trends</h3>
          <div className="h-[400px]">
            {renderChart()}
          </div>
        </div>
        
        {/* Domain Balance Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Current Domain Balance</h3>
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(DOMAIN_CONFIG).map(([domain, config]) => {
                    const latestEntry = entries[entries.length - 1] || {};
                    const value = Number(latestEntry[domain as DomainKey]) || 0;
                    const total = Object.entries(DOMAIN_CONFIG).reduce((sum, [d]) => {
                      const domainValue = Number(latestEntry[d as DomainKey]) || 0;
                      return sum + domainValue;
                    }, 0);
                    return {
                      name: config.label,
                      value: value,
                      percentage: total > 0 ? (value / total) * 100 : 0,
                      color: config.color
                    };
                  })}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {Object.entries(DOMAIN_CONFIG).map(([domain, config]) => (
                    <Cell key={domain} fill={config.color} />
                  ))}
                </Pie>
                <Tooltip 
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                        <p className="font-medium" style={{ color: data.color }}>{data.name}</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          Score: {data.value.toFixed(1)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">
                          {data.percentage.toFixed(1)}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Weekly Progress Area Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Weekly Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                {Object.keys(DOMAIN_CONFIG).map((domain) => (
                  <Area
                    key={domain}
                    type="monotone"
                    dataKey={domain}
                    stackId="1"
                    stroke={getDomainColor(domain as DomainKey)}
                    fill={getDomainColor(domain as DomainKey)}
                    fillOpacity={0.3}
                    name={getDomainLabel(domain as DomainKey)}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Domain Relationships */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Domain Relationships</h3>
        {analysisResults.correlations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysisResults.correlations.map((correlation, index) => {
              const sourceConfig = DOMAIN_CONFIG[correlation.domain1];
              const targetConfig = DOMAIN_CONFIG[correlation.domain2];
              
              if (!sourceConfig || !targetConfig) return null;
            
            return (
                <div 
                  key={`${correlation.domain1}-${correlation.domain2}-${index}`} 
                  className="p-4 rounded-lg bg-gradient-to-br from-gray-900/5 to-gray-900/20 dark:from-gray-800 dark:to-gray-700 border border-gray-100/20 dark:border-gray-600/20 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="rounded-full p-2 relative" 
                      style={{ 
                        backgroundColor: sourceConfig.color + '20',
                        boxShadow: `0 0 20px ${sourceConfig.color}40`
                      }}
                    >
                      {sourceConfig.icon && <sourceConfig.icon className="w-5 h-5" style={{ color: sourceConfig.color }} />}
                      <div className="absolute inset-0 rounded-full" style={{ 
                        background: `radial-gradient(circle at center, ${sourceConfig.color}10 0%, transparent 70%)` 
                      }} />
                    </div>
                    <div className="flex flex-col items-center">
                      {correlation.positive ? (
                        <TrendingUp className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {Math.abs(correlation.strength).toFixed(2)}
                      </span>
                    </div>
                    <div 
                      className="rounded-full p-2 relative" 
                      style={{ 
                        backgroundColor: targetConfig.color + '20',
                        boxShadow: `0 0 20px ${targetConfig.color}40`
                      }}
                    >
                      {targetConfig.icon && <targetConfig.icon className="w-5 h-5" style={{ color: targetConfig.color }} />}
                      <div className="absolute inset-0 rounded-full" style={{ 
                        background: `radial-gradient(circle at center, ${targetConfig.color}10 0%, transparent 70%)` 
                      }} />
                  </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{sourceConfig.label}</span> and{' '}
                    <span className="font-medium">{targetConfig.label}</span> show a{' '}
                    <span className={correlation.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {correlation.positive ? 'positive' : 'negative'}
                    </span>{' '}
                    relationship
                    {correlation.strength >= 0.7 ? ' (strong)' : ' (moderate)'}
                  </p>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No significant relationships found between domains yet.
          </div>
        )}
        </div>
        
      {/* Pattern Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Pattern Analysis</h3>
        {Object.keys(analysisResults.variabilityInsights).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(analysisResults.variabilityInsights).map(([domain, insight]) => {
              const domainConfig = DOMAIN_CONFIG[domain as DomainKey];
              const Icon = domainConfig?.icon;
              
              if (!domainConfig || !insight) return null;
                
                return (
                <div key={domain} className="p-4 rounded-lg bg-gradient-to-br from-gray-900/5 to-gray-900/20 dark:from-gray-800 dark:to-gray-700 border border-gray-100/20 dark:border-gray-600/20 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center relative"
                        style={{ 
                          backgroundColor: getDomainColor(domain as DomainKey) + '20',
                          boxShadow: `0 0 20px ${getDomainColor(domain as DomainKey)}40`
                        }}
                      >
                        {Icon && (
                          <Icon 
                            className="w-5 h-5 relative z-10"
                            style={{ color: getDomainColor(domain as DomainKey) }}
                          />
                        )}
                        <div className="absolute inset-0 rounded-full" style={{ 
                          background: `radial-gradient(circle at center, ${getDomainColor(domain as DomainKey)}10 0%, transparent 70%)` 
                        }} />
                      </div>
                      <div>
                        <span className="font-medium block">{domainConfig.label}</span>
                        <span className="text-sm text-gray-500">
                          Score: {insight.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      insight.level === 'low' ? 'bg-green-100/80 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      insight.level === 'moderate' ? 'bg-yellow-100/80 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100/80 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {insight.level} variability
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {insight.insight || `Your ${domainConfig.label.toLowerCase()} shows ${insight.level} variability.`}
                  </p>
                  </div>
                );
              })}
            </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Not enough data to analyze patterns yet.
          </div>
        )}
      </div>
      
      {/* Personal Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6">Personal Insights</h3>
        <div className="space-y-6">
          {/* Overall Insight */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-gray-900/5 to-gray-900/20 dark:from-gray-800 dark:to-gray-700 border border-gray-100/20 dark:border-gray-600/20 backdrop-blur-sm">
            <p className="text-gray-700 dark:text-gray-300">
              {analysisResults.overallInsight || 'Start tracking your domains to receive personalized insights about your progress and patterns.'}
            </p>
          </div>

          {/* Top Performing & Needs Attention */}
          {(analysisResults.topPerformingDomain || analysisResults.needsAttentionDomain) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysisResults.topPerformingDomain && (
                <div className="p-4 rounded-lg bg-green-50/80 dark:bg-green-900/20 border border-green-100/50 dark:border-green-900/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center relative"
                      style={{ 
                        backgroundColor: getDomainColor(analysisResults.topPerformingDomain.domain) + '20',
                        boxShadow: `0 0 20px ${getDomainColor(analysisResults.topPerformingDomain.domain)}40`
                      }}
                    >
                      {(() => {
                        const Icon = DOMAIN_CONFIG[analysisResults.topPerformingDomain.domain].icon;
                        return Icon ? (
                          <Icon 
                            className="w-5 h-5 relative z-10"
                            style={{ color: getDomainColor(analysisResults.topPerformingDomain.domain) }}
                          />
                        ) : null;
                      })()}
                      <div className="absolute inset-0 rounded-full" style={{ 
                        background: `radial-gradient(circle at center, ${getDomainColor(analysisResults.topPerformingDomain.domain)}10 0%, transparent 70%)` 
                      }} />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-400">Top Performing Area</h4>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {getDomainLabel(analysisResults.topPerformingDomain.domain)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {analysisResults.topPerformingDomain.insight}
                  </p>
                </div>
              )}

              {analysisResults.needsAttentionDomain && (
                <div className="p-4 rounded-lg bg-yellow-50/80 dark:bg-yellow-900/20 border border-yellow-100/50 dark:border-yellow-900/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center relative"
                      style={{ 
                        backgroundColor: getDomainColor(analysisResults.needsAttentionDomain.domain) + '20',
                        boxShadow: `0 0 20px ${getDomainColor(analysisResults.needsAttentionDomain.domain)}40`
                      }}
                    >
                      {(() => {
                        const Icon = DOMAIN_CONFIG[analysisResults.needsAttentionDomain.domain].icon;
                        return Icon ? (
                          <Icon 
                            className="w-5 h-5 relative z-10"
                            style={{ color: getDomainColor(analysisResults.needsAttentionDomain.domain) }}
                          />
                        ) : null;
                      })()}
                      <div className="absolute inset-0 rounded-full" style={{ 
                        background: `radial-gradient(circle at center, ${getDomainColor(analysisResults.needsAttentionDomain.domain)}10 0%, transparent 70%)` 
                      }} />
                    </div>
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-400">Area Needing Attention</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {getDomainLabel(analysisResults.needsAttentionDomain.domain)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {analysisResults.needsAttentionDomain.insight}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 