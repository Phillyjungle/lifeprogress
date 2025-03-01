import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area, 
  PieChart as RechartsPieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import { 
  Activity, Brain, Users, Briefcase, Star, 
  Calendar, TrendingUp, TrendingDown, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Zap, Info, 
  AlertTriangle, ThumbsUp, BarChart2, PieChart, RadioTower
} from 'lucide-react';
import { AnalyticsInsights } from './AnalyticsInsights';

// Importing our domain configuration
const DOMAIN_CONFIG = {
  health: {
    label: 'Physical Health',
    color: '#4361ee',
    icon: Activity,
    iconBgColor: 'rgba(67, 97, 238, 0.1)'
  },
  mental: {
    label: 'Mental Wellbeing',
    color: '#4cc9f0',
    icon: Brain,
    iconBgColor: 'rgba(76, 201, 240, 0.1)'
  },
  social: {
    label: 'Social Life',
    color: '#ff8fab',
    icon: Users,
    iconBgColor: 'rgba(255, 143, 171, 0.1)'
  },
  career: {
    label: 'Career Growth',
    color: '#f77f00',
    icon: Briefcase,
    iconBgColor: 'rgba(247, 127, 0, 0.1)'
  },
  growth: {
    label: 'Personal Growth',
    color: '#2a9d8f',
    icon: Star,
    iconBgColor: 'rgba(42, 157, 143, 0.1)'
  }
};

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Sample data generator function - replace with your actual data loading logic
const generateSampleData = () => {
  const today = new Date();
  const data = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const entry = {
      date: date.toISOString().split('T')[0],
      health: 5 + Math.random() * 2 + (i < 15 ? 1 : 0),
      mental: 6 + Math.random() * 2 - (i < 5 ? 1 : 0),
      social: 4 + Math.random() * 3 + (i < 10 ? 1.5 : 0),
      career: 7 + Math.random() * 1.5,
      growth: 5 + Math.random() * 2 + (i < 20 ? 1 : 0)
    };
    
    data.push(entry);
  }
  
  return data;
};

export function Analytics() {
  // State variables
  const [period, setPeriod] = useState('month');
  const [chartType, setChartType] = useState('line');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [showChartAnimation, setShowChartAnimation] = useState(false);
  const [domainInsights, setDomainInsights] = useState({});
  const [domainTrends, setDomainTrends] = useState({});
  const [weeklyAverages, setWeeklyAverages] = useState([]);
  const [domainBalance, setDomainBalance] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [previousData, setPreviousData] = useState([]);
  const [recentChange, setRecentChange] = useState(null);
  const [analysisResults, setAnalysisResults] = useState({
    variabilityInsights: {},
    correlations: [],
    suggestions: [],
    overallInsight: '',
    topPerformingDomain: '',
    needsAttentionDomain: ''
  });
  
  // Load data on component mount and when period changes
  useEffect(() => {
    const loadAndProcessData = async () => {
      setIsChartLoading(true);
      
      try {
        // In a real app, you would load data from an API or local storage
        // For this example, we'll use sample data
        const data = generateSampleData();
        
        // Store the raw data
        setRawData(data);
        
        // Generate domain insights
        const insights = {};
        const trends = {};
        
        // Process data for each domain
        Object.keys(DOMAIN_CONFIG).forEach(domain => {
          // Calculate domain insights
          const values = data.map(entry => entry[domain]).filter(Boolean);
          
          if (values.length > 0) {
            insights[domain] = {
              peak: Math.max(...values),
              average: values.reduce((sum, val) => sum + val, 0) / values.length,
              min: Math.min(...values),
              variability: calculateVariability(values)
            };
            
            // Calculate trends
            const current = values[values.length - 1];
            const previous = values[values.length - 7] || values[0];
            const percentChange = ((current - previous) / previous) * 100;
            
            trends[domain] = {
              current,
              previous,
              percentChange,
              improving: current > previous
            };
          }
        });
        
        setDomainInsights(insights);
        setDomainTrends(trends);
        
        // Calculate weekly averages
        const weeks = {};
        data.forEach(entry => {
          const date = new Date(entry.date);
          const weekNum = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
          
          if (!weeks[weekNum]) {
            weeks[weekNum] = {
              week: formatDate(entry.date),
              counts: {},
              sums: {}
            };
          }
          
          Object.keys(DOMAIN_CONFIG).forEach(domain => {
            if (entry[domain]) {
              if (!weeks[weekNum].counts[domain]) {
                weeks[weekNum].counts[domain] = 0;
                weeks[weekNum].sums[domain] = 0;
              }
              weeks[weekNum].counts[domain]++;
              weeks[weekNum].sums[domain] += entry[domain];
            }
          });
        });
        
        const weeklyData = Object.values(weeks).map(week => {
          const result = { week: week.week };
          
          Object.keys(DOMAIN_CONFIG).forEach(domain => {
            if (week.counts[domain] > 0) {
              result[domain] = week.sums[domain] / week.counts[domain];
            }
          });
          
          return result;
        });
        
        setWeeklyAverages(weeklyData);
        
        // Calculate domain balance data
        const latestData = data[data.length - 1];
        const balanceData = Object.entries(DOMAIN_CONFIG).map(([key, config]) => ({
          name: config.label,
          value: latestData[key] || 0,
          color: config.color
        }));
        
        setDomainBalance(balanceData);
        
        // Calculate correlation data
        const domains = Object.keys(DOMAIN_CONFIG);
        const correlations = [];
        
        for (let i = 0; i < domains.length; i++) {
          for (let j = i + 1; j < domains.length; j++) {
            const domain1 = domains[i];
            const domain2 = domains[j];
            
            const values1 = data.map(entry => entry[domain1]).filter(Boolean);
            const values2 = data.map(entry => entry[domain2]).filter(Boolean);
            
            // Only calculate if we have enough matching data points
            if (values1.length >= 5 && values1.length === values2.length) {
              const correlation = calculateCorrelation(values1, values2);
              
              if (Math.abs(correlation) > 0.3) {
                correlations.push({
                  source: domain1,
                  target: domain2,
                  correlation: correlation,
                  strength: Math.abs(correlation),
                  positive: correlation > 0
                });
              }
            }
          }
        }
        
        // Set top correlations
        setCorrelationData(correlations);
        
        // Calculate variability and domain analysis
        const variabilityInsights = {};
        let topPerformingDomain = '';
        let topPerformingScore = 0;
        let needsAttentionDomain = '';
        let needsAttentionScore = 10;
        
        Object.entries(insights).forEach(([domain, data]) => {
          let variabilityLevel = 'low';
          if (data.variability > 1.5) variabilityLevel = 'high';
          else if (data.variability > 0.7) variabilityLevel = 'moderate';
          
          variabilityInsights[domain] = {
            level: variabilityLevel,
            score: data.variability,
            insight: getVariabilityInsight(domain, variabilityLevel)
          };
          
          // Identify top performing and needs attention domains
          if (trends[domain]?.current > topPerformingScore) {
            topPerformingScore = trends[domain]?.current;
            topPerformingDomain = domain;
          }
          
          if (trends[domain]?.current < needsAttentionScore) {
            needsAttentionScore = trends[domain]?.current;
            needsAttentionDomain = domain;
          }
        });
        
        // Update analysis results
        setAnalysisResults({
          variabilityInsights,
          correlations: [], // Would calculate correlations in a real app
          suggestions: [
            'Try to maintain a consistent sleep schedule to improve Physical Health stability',
            'Regular social interactions, even brief ones, can boost your Social Life scores',
            'Setting specific goals for Personal Growth can lead to more consistent progress'
          ],
          overallInsight: 'Your overall well-being is trending positively with good balance across domains.',
          topPerformingDomain: topPerformingDomain,
          needsAttentionDomain: needsAttentionDomain
        });
        
        // Check for recent changes
        if (previousData.length > 0 && data.length > 0) {
          const latestData = data[data.length - 1];
          const previousLatestData = previousData[previousData.length - 1];
          
          if (latestData && previousLatestData) {
            // Compare domains to find changes
            Object.keys(DOMAIN_CONFIG).forEach(domain => {
              if (latestData[domain] !== undefined && previousLatestData[domain] !== undefined) {
                const difference = latestData[domain] - previousLatestData[domain];
                
                // If change is significant, record it
                if (Math.abs(difference) >= 1) {
                  setRecentChange({
                    domain,
                    oldValue: previousLatestData[domain],
                    newValue: latestData[domain],
                    difference
                  });
                }
              }
            });
          }
        }
        
        // Store current data for future comparison
        setPreviousData([...data]);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      } finally {
        setIsChartLoading(false);
        
        // Show animation after a brief delay
        setTimeout(() => {
          setShowChartAnimation(true);
        }, 400);
        
        setTimeout(() => {
          setShowChartAnimation(false);
        }, 2000);
      }
    };
    
    loadAndProcessData();
  }, [period]);
  
  // Calculate correlation between two sets of values
  const calculateCorrelation = (x, y) => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };
  
  // Calculate variability (standard deviation)
  const calculateVariability = (values) => {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  };
  
  // Get insight based on variability level
  const getVariabilityInsight = (domain, level) => {
    const domainLabel = DOMAIN_CONFIG[domain]?.label || domain;
    
    if (level === 'high') {
      return `Your ${domainLabel} scores show high variability. Try to establish more consistent routines.`;
    } else if (level === 'moderate') {
      return `Your ${domainLabel} has moderate ups and downs. Work on stabilizing the most effective practices.`;
    } else {
      return `Your ${domainLabel} scores are very stable. You've found a consistent approach.`;
    }
  };
  
  return (
    <div className="py-6 px-4 analytics-container">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Analytics & Insights</h1>
        
        <div className="flex items-center space-x-4">
          {/* Chart type selector */}
          <div className="flex items-center bg-[var(--color-card)] rounded-lg p-1">
            <button 
              className={`p-2 rounded-md ${chartType === 'line' ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
              onClick={() => setChartType('line')}
            >
              <LineChart className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded-md ${chartType === 'bar' ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
              onClick={() => setChartType('bar')}
            >
              <BarChart2 className="w-5 h-5" />
            </button>
            <button 
              className={`p-2 rounded-md ${chartType === 'radar' ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'}`}
              onClick={() => setChartType('radar')}
            >
              <RadioTower className="w-5 h-5" />
            </button>
          </div>
          
          {/* Time period selector */}
          <div className="relative">
            <button 
              className="flex items-center px-4 py-2 bg-[var(--color-card)] rounded-lg text-[var(--color-text)]"
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            >
              <Calendar className="w-4 h-4 mr-2 text-[var(--color-text-secondary)]" />
              <span className="capitalize">{period}</span>
              <ChevronDown className="w-4 h-4 ml-2 text-[var(--color-text-secondary)]" />
            </button>
            
            {periodDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-[var(--color-card)] rounded-lg shadow-lg py-1 z-10">
                {['week', 'month', 'quarter', 'year'].map(option => (
                  <button
                    key={option}
                    className={`block w-full text-left px-4 py-2 hover:bg-[var(--color-primary-15)] ${
                      period === option ? 'text-[var(--color-primary)]' : 'text-[var(--color-text)]'
                    }`}
                    onClick={() => {
                      setPeriod(option);
                      setPeriodDropdownOpen(false);
                    }}
                  >
                    <span className="capitalize">{option}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main chart section */}
      <div className="bg-[var(--color-card)] rounded-lg p-4 mb-6 analytics-chart-container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-lg font-medium text-[var(--color-text)] mb-2 md:mb-0">Domain Progress Trends</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`px-3 py-1 text-xs rounded-full ${
                selectedDomain === 'all' ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]' : 'bg-[var(--color-background)] text-[var(--color-text-secondary)]'
              }`}
              onClick={() => setSelectedDomain('all')}
            >
              All Domains
            </button>
            
            {Object.entries(DOMAIN_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  className={`flex items-center px-3 py-1 text-xs rounded-full ${
                    selectedDomain === key
                      ? 'bg-[var(--color-primary-15)]'
                      : 'bg-[var(--color-background)] hover:bg-[var(--color-primary-15)]'
                  }`}
                  style={{ 
                    backgroundColor: selectedDomain === key ? config.color : undefined,
                    opacity: selectedDomain !== 'all' && selectedDomain !== key ? 0.5 : 1,
                    color: selectedDomain === key ? 'white' : 'var(--color-text)'
                  }}
                  onClick={() => setSelectedDomain(key)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="h-[300px]">
          {isChartLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' && (
                <LineChart
                  data={rawData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: 'var(--color-text-secondary)' }} 
                    tickFormatter={formatDate}
                    stroke="var(--color-border)"
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    tick={{ fill: 'var(--color-text-secondary)' }} 
                    stroke="var(--color-border)"
                  />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(1), '']}
                    labelFormatter={formatDate}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-card)', 
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                  <Legend />
                  {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                    (selectedDomain === 'all' || selectedDomain === key) && (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        name={config.label}
                        stroke={config.color}
                        activeDot={{ r: 8, fill: config.color, strokeWidth: 0 }}
                        strokeWidth={2}
                        dot={{ r: 3, fill: config.color, strokeWidth: 0 }}
                        isAnimationActive={showChartAnimation}
                      />
                    )
                  ))}
                </LineChart>
              )}
              
              {chartType === 'bar' && (
                <BarChart
                  data={weeklyAverages}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="week" tick={{ fill: 'var(--color-text-secondary)' }} stroke="var(--color-border)" />
                  <YAxis domain={[0, 10]} tick={{ fill: 'var(--color-text-secondary)' }} stroke="var(--color-border)" />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(1), '']}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-card)', 
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                  <Legend />
                  {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                    (selectedDomain === 'all' || selectedDomain === key) && (
                      <Bar
                        key={key}
                        dataKey={key}
                        name={config.label}
                        fill={config.color}
                        isAnimationActive={showChartAnimation}
                      />
                    )
                  ))}
                </BarChart>
              )}
              
              {chartType === 'radar' && (
                <RadarChart 
                  outerRadius={90} 
                  width={500} 
                  height={300}
                  data={
                    rawData.length > 0 
                      ? [
                          Object.entries(DOMAIN_CONFIG).reduce((acc, [key, config]) => {
                            acc[key] = rawData[rawData.length - 1][key] || 0;
                            acc.domain = config.label;
                            return acc;
                          }, {})
                        ]
                      : []
                  }
                >
                  <PolarGrid stroke="var(--color-border)" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: 'var(--color-text-secondary)' }} />
                  {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                    (selectedDomain === 'all' || selectedDomain === key) && (
                      <Radar
                        key={key}
                        name={config.label}
                        dataKey={key}
                        stroke={config.color}
                        fill={config.color}
                        fillOpacity={0.6}
                        isAnimationActive={showChartAnimation}
                      />
                    )
                  ))}
                  <Tooltip 
                    formatter={(value) => [value.toFixed(1), '']}
                    contentStyle={{ 
                      backgroundColor: 'var(--color-card)', 
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)'
                    }}
                  />
                </RadarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>
      
      {/* Domain trends quick view */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(DOMAIN_CONFIG).map(([domain, config]) => {
          const Icon = config.icon;
          const trend = domainTrends[domain] || {};
          const insight = domainInsights[domain] || {};
          
          return (
            <div 
              key={domain}
              className={`bg-[var(--color-card)] rounded-lg p-4 border border-transparent
                        ${domain === analysisResults.topPerformingDomain 
                          ? 'border-green-300 shadow-md' : ''}
                        ${domain === analysisResults.needsAttentionDomain
                          ? 'border-amber-300 shadow-md' : ''}`}
            >
              <div className="flex items-center mb-2">
                <Icon className="w-4 h-4 mr-1" style={{ color: config.color }} />
                <h3 className="text-sm font-medium" style={{ color: config.color }}>
                  {config.label}
                </h3>
              </div>
              
              <div className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                <div className="flex justify-between">
                  <span>Current</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {trend.current?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Change</span>
                  <span className={`font-medium flex items-center ${trend.improving ? 'text-green-400' : 'text-red-400'}`}>
                    {trend.percentChange ? `${trend.percentChange > 0 ? '+' : ''}${trend.percentChange.toFixed(1)}%` : 'N/A'}
                    {trend.improving ? 
                      <ArrowUpRight className="w-3 h-3 ml-1" /> : 
                      <ArrowDownRight className="w-3 h-3 ml-1" />
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Peak</span>
                  <span className="font-medium text-[var(--color-text)]">
                    {insight.peak?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Additional visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Domain Balance */}
        <div className="bg-[var(--color-card)] rounded-lg p-4">
          <h3 className="text-md font-medium text-[var(--color-text)] mb-4">Current Domain Balance</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={domainBalance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                  isAnimationActive={showChartAnimation}
                >
                  {domainBalance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value.toFixed(1), '']}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Weekly Comparison */}
        <div className="bg-[var(--color-card)] rounded-lg p-4">
          <h3 className="text-md font-medium text-[var(--color-text)] mb-4">Weekly Progress</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyAverages}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="week" tick={{ fill: 'var(--color-text-secondary)' }} stroke="var(--color-border)" />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--color-text-secondary)' }} stroke="var(--color-border)" />
                <Tooltip 
                  formatter={(value) => [value.toFixed(1), '']}
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)'
                  }}
                />
                <Legend />
                {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={config.label}
                    stroke={config.color}
                    fill={config.color}
                    fillOpacity={0.2}
                    isAnimationActive={showChartAnimation}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Pattern Analysis Section */}
      <div className="bg-[var(--color-card)] rounded-lg p-4 mb-8 analytics-panel">
        <h3 className="text-lg font-medium text-[var(--color-text)] mb-4">Pattern Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysisResults.variabilityInsights).map(([domain, insight]) => {
            const config = DOMAIN_CONFIG[domain];
            const Icon = config?.icon || Activity;
            const statusColor = 
              insight.level === 'high' ? 'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-300' :
              insight.level === 'moderate' ? 'bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-300' :
              'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-300';
            
            return (
              <div key={domain} className="bg-[var(--color-background)] rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="rounded-md p-1" style={{ backgroundColor: config?.iconBgColor }}>
                      <Icon className="w-4 h-4" style={{ color: config?.color }} />
                    </div>
                    <h4 className="ml-2 text-sm font-medium text-[var(--color-text)]">{config?.label}</h4>
                  </div>
                  
                  <div className={`text-xs px-2 py-1 rounded-full capitalize ${statusColor}`}>
                    {insight.level} variability
                  </div>
                </div>
                
                <p className="text-xs text-[var(--color-text-secondary)] mt-2">{insight.insight}</p>
              </div>
            );
          })}
        </div>
        
        {/* Correlation Insights */}
        {correlationData.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-medium text-[var(--color-text)] mb-3">Domain Relationships</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {correlationData.slice(0, 4).map((corr, i) => {
                const sourceConfig = DOMAIN_CONFIG[corr.source];
                const targetConfig = DOMAIN_CONFIG[corr.target];
                const SourceIcon = sourceConfig?.icon || Activity;
                const TargetIcon = targetConfig?.icon || Brain;
                
                const correlationColor = corr.positive ? 
                  'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-300' : 
                  'bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-300';
                
                return (
                  <div key={i} className="bg-[var(--color-background)] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <SourceIcon className="w-4 h-4" style={{ color: sourceConfig?.color }} />
                        <span className="mx-2 text-[var(--color-text)]">⟺</span>
                        <TargetIcon className="w-4 h-4" style={{ color: targetConfig?.color }} />
                      </div>
                      
                      <div className={`text-xs px-2 py-1 rounded-full ${correlationColor}`}>
                        {corr.positive ? 'Positive' : 'Negative'} correlation
                      </div>
                    </div>
                    
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      {corr.positive
                        ? `As your ${sourceConfig?.label} improves, your ${targetConfig?.label} tends to improve as well.`
                        : `When your ${sourceConfig?.label} increases, your ${targetConfig?.label} tends to decrease.`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Personal Insights Section */}
      <div className="mt-8 analytics-panel">
        <AnalyticsInsights 
          domainData={rawData.length > 0 ? rawData[rawData.length - 1] : null}
          recentChange={recentChange}
        />
      </div>
    </div>
  );
} 