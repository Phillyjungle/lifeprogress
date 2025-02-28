import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { 
  Activity, Brain, Users, Briefcase, Star, 
  Calendar, TrendingUp, TrendingDown, ChevronDown, 
  ArrowUpRight, ArrowDownRight, Zap, Info, 
  AlertTriangle, ThumbsUp, BarChart2, PieChart
} from 'lucide-react';

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
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function Analytics() {
  // State variables for time period selection
  const [period, setPeriod] = useState('month');
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [showChartAnimation, setShowChartAnimation] = useState(false);
  const [domainInsights, setDomainInsights] = useState({});
  const [domainTrends, setDomainTrends] = useState({});
  const [weeklyAverages, setWeeklyAverages] = useState([]);
  const [domainBalance, setDomainBalance] = useState({});
  const [rawData, setRawData] = useState([]);
  const [analysisResults, setAnalysisResults] = useState({
    variabilityInsights: {},
    correlations: [],
    suggestions: [],
    overallInsight: '',
    topPerformingDomain: '',
    needsAttentionDomain: ''
  });
  const [showInsightAnimation, setShowInsightAnimation] = useState(false);
  
  // Refs for chart animations
  const chartRef = useRef(null);
  const insightRef = useRef(null);
  
  // Simulate data loading on mount and period change
  useEffect(() => {
    loadAnalyticsData();
  }, [period, selectedDomain]);
  
  // Function to load analytics data
  const loadAnalyticsData = () => {
    setIsChartLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const generatedData = generateMockData(period);
      setRawData(generatedData);
      
      // Calculate insights from the data
      calculateInsights(generatedData);
      analyzeDataPatterns(generatedData);
      
      // Calculate weekly averages
      const weeklyData = calculateWeeklyAverages(generatedData);
      setWeeklyAverages(weeklyData);
      
      // Calculate domain balance
      const balance = calculateDomainBalance(generatedData);
      setDomainBalance(balance);
      
      setIsChartLoading(false);
      
      // Trigger chart animation
      setShowChartAnimation(true);
      setTimeout(() => {
        setShowChartAnimation(false);
      }, 800);
      
      // Trigger insight animation after a delay
      setTimeout(() => {
        setShowInsightAnimation(true);
        setTimeout(() => {
          setShowInsightAnimation(false);
        }, 800);
      }, 500);
    }, 800);
  };
  
  // Function to analyze data for patterns
  const analyzeDataPatterns = (data) => {
    // Calculate variability for each domain
    const variability = {};
    const domainMeans = {};
    const domainMins = {};
    const domainMaxes = {};
    const domainVariances = {};
    
    // Get last 7 entries for each domain to calculate recent trends
    const recentData = data.slice(-7);
    
    Object.keys(DOMAIN_CONFIG).forEach(domain => {
      // Calculate statistics for each domain
      const values = data.map(entry => entry[domain]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      // Store calculated values
      domainMeans[domain] = mean;
      domainMins[domain] = min;
      domainMaxes[domain] = max;
      domainVariances[domain] = variance;
      
      // Classify variability
      if (stdDev < 0.8) {
        variability[domain] = { level: 'low', value: stdDev };
      } else if (stdDev < 1.5) {
        variability[domain] = { level: 'moderate', value: stdDev };
      } else {
        variability[domain] = { level: 'high', value: stdDev };
      }
    });
    
    // Find correlations between domains
    const correlations = [];
    const domains = Object.keys(DOMAIN_CONFIG);
    
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const domain1 = domains[i];
        const domain2 = domains[j];
        
        const correlation = calculateCorrelation(
          data.map(entry => entry[domain1]),
          data.map(entry => entry[domain2])
        );
        
        if (Math.abs(correlation) > 0.6) {
          correlations.push({
            domains: [domain1, domain2],
            strength: correlation,
            positive: correlation > 0
          });
        }
      }
    }
    
    // Generate personalized suggestions
    const suggestions = generateSuggestions(variability, domainMeans, correlations);
    
    // Determine top and bottom performing domains
    const sortedByMean = Object.entries(domainMeans)
      .sort(([, a], [, b]) => b - a);
    
    const topPerforming = sortedByMean[0][0];
    const needsAttention = sortedByMean[sortedByMean.length - 1][0];
    
    // Generate overall insight
    const overallInsight = generateOverallInsight(domainMeans, variability);
    
    // Update analysis results
    setAnalysisResults({
      variabilityInsights: variability,
      correlations,
      suggestions,
      overallInsight,
      topPerformingDomain: topPerforming,
      needsAttentionDomain: needsAttention
    });
  };
  
  // Function to calculate correlation between two arrays
  const calculateCorrelation = (array1, array2) => {
    const n = array1.length;
    if (n !== array2.length || n === 0) return 0;
    
    let sum1 = 0;
    let sum2 = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;
    let pSum = 0;
    
    for (let i = 0; i < n; i++) {
      sum1 += array1[i];
      sum2 += array2[i];
      sum1Sq += array1[i] ** 2;
      sum2Sq += array2[i] ** 2;
      pSum += array1[i] * array2[i];
    }
    
    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 ** 2 / n) * (sum2Sq - sum2 ** 2 / n));
    
    if (den === 0) return 0;
    return num / den;
  };
  
  // Function to generate suggestions based on analysis
  const generateSuggestions = (variability, means, correlations) => {
    const suggestions = [];
    
    // Add suggestions based on variability
    Object.entries(variability).forEach(([domain, data]) => {
      const { level } = data;
      const domainName = DOMAIN_CONFIG[domain].label;
      
      if (level === 'high') {
        suggestions.push({
          domain,
          text: `Try to bring more consistency to your ${domainName.toLowerCase()}. High variability can indicate stress or irregular patterns.`,
          icon: AlertTriangle
        });
      } else if (level === 'low' && means[domain] < 5) {
        suggestions.push({
          domain,
          text: `Your ${domainName.toLowerCase()} shows consistent low scores. Consider specific actions to improve this area.`,
          icon: Info
        });
      } else if (level === 'low' && means[domain] > 7) {
        suggestions.push({
          domain,
          text: `Great job maintaining consistent high scores in ${domainName.toLowerCase()}! Keep it up.`,
          icon: ThumbsUp
        });
      }
    });
    
    // Add suggestions based on correlations
    correlations.forEach(({ domains, strength, positive }) => {
      const domain1 = DOMAIN_CONFIG[domains[0]].label;
      const domain2 = DOMAIN_CONFIG[domains[1]].label;
      
      if (positive && strength > 0.7) {
        suggestions.push({
          domains: domains,
          text: `${domain1} and ${domain2} show a strong positive relationship. Improvements in one area likely benefit the other.`,
          icon: TrendingUp
        });
      } else if (!positive && strength < -0.7) {
        suggestions.push({
          domains: domains,
          text: `${domain1} and ${domain2} appear to have an inverse relationship. You might need to balance attention between these areas.`,
          icon: BarChart2
        });
      }
    });
    
    return suggestions;
  };
  
  // Function to generate overall insight
  const generateOverallInsight = (means, variability) => {
    const avgMean = Object.values(means).reduce((sum, val) => sum + val, 0) / Object.values(means).length;
    
    if (avgMean > 7) {
      return "You're doing exceptionally well across all areas. Your consistent high ratings suggest you've found an effective balance in your life.";
    } else if (avgMean > 5) {
      return "You're maintaining a good balance overall. Look for opportunities to leverage your strengths to improve lower-rated areas.";
    } else {
      return "There are several areas where focused effort could improve your overall well-being. Start with small goals in your lowest-rated domain.";
    }
  };
  
  // Function to calculate insights for each domain
  const calculateInsights = (data) => {
    // Skip calculation if no data
    if (!data || data.length === 0) return;
    
    const insights = {};
    const trends = {};
    
    // Calculate insights for each domain
    Object.keys(DOMAIN_CONFIG).forEach(domain => {
      // Get values for this domain
      const values = data.map(entry => entry[domain]);
      
      // Calculate insights
      insights[domain] = {
        average: values.reduce((sum, val) => sum + val, 0) / values.length,
        peak: Math.max(...values),
        low: Math.min(...values),
        recentTrend: values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0
      };
      
      // Calculate trends
      if (values.length >= 2) {
        const current = values[values.length - 1];
        const previous = values.length > 10 ? 
                          values[values.length - 11] : values[0];
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
  };
  
  // Function to calculate weekly averages
  const calculateWeeklyAverages = (data) => {
    // Group by week
    const weekMap = {};
    
    data.forEach(entry => {
      const date = new Date(entry.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().substr(0, 10);
      
      if (!weekMap[weekKey]) {
        weekMap[weekKey] = {
          week: weekKey,
          count: 0,
          health: 0,
          mental: 0,
          social: 0,
          career: 0,
          growth: 0
        };
      }
      
      weekMap[weekKey].count++;
      Object.keys(DOMAIN_CONFIG).forEach(domain => {
        weekMap[weekKey][domain] += entry[domain];
      });
    });
    
    // Calculate averages
    return Object.values(weekMap)
      .map(week => {
        const result = { week: week.week };
        Object.keys(DOMAIN_CONFIG).forEach(domain => {
          result[domain] = week[domain] / week.count;
        });
        return result;
      })
      .sort((a, b) => new Date(a.week) - new Date(b.week))
      .slice(-4); // Get last 4 weeks
  };
  
  // Function to calculate domain balance
  const calculateDomainBalance = (data) => {
    // Get latest entry
    const latest = data[data.length - 1];
    
    if (!latest) return {};
    
    const balance = {};
    let total = 0;
    
    Object.keys(DOMAIN_CONFIG).forEach(domain => {
      balance[domain] = latest[domain];
      total += latest[domain];
    });
    
    // Calculate percentages
    Object.keys(balance).forEach(key => {
      balance[key] = (balance[key] / total) * 100;
    });
    
    return balance;
  };
  
  // Generate mock data for visualization
  const generateMockData = (timePeriod) => {
    const data = [];
    let days;
    
    switch (timePeriod) {
      case 'week':
        days = 7;
        break;
      case 'month':
        days = 30;
        break;
      case 'quarter':
        days = 90;
        break;
      case 'year':
        days = 365;
        break;
      default:
        days = 30;
    }
    
    // Set baseline values for each domain with some randomness
    const baselineValues = {
      health: 6 + Math.random() * 2,
      mental: 5 + Math.random() * 2,
      social: 5.5 + Math.random() * 2,
      career: 7 + Math.random() * 2,
      growth: 6 + Math.random() * 2
    };
    
    // Generate data points with some trends and variability
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      const entry = {
        date: date.toISOString().substr(0, 10)
      };
      
      // Generate values for each domain with some trend and randomness
      Object.keys(baselineValues).forEach(domain => {
        // Add some trend
        const trend = Math.sin(i / (days / 4)) * 0.5;
        
        // Add some domain-specific patterns
        let domainEffect = 0;
        
        if (domain === 'social' && i % 7 === 5) {
          // Social peaks on weekends (day 5 = Saturday)
          domainEffect = 1;
        } else if (domain === 'mental' && i % 7 === 0) {
          // Mental dips slightly on Mondays
          domainEffect = -0.5;
        } else if (domain === 'career' && i % 30 >= 20 && i % 30 <= 25) {
          // Career has more variability at end of month
          domainEffect = (Math.random() - 0.5) * 2;
        }
        
        // Calculate final value with randomness
        let value = baselineValues[domain] + trend + domainEffect + (Math.random() - 0.5);
        
        // Ensure value is within 1-10 range
        value = Math.max(1, Math.min(10, value));
        value = Math.round(value * 10) / 10; // Round to 1 decimal place
        
        entry[domain] = value;
      });
      
      data.push(entry);
    }
    
    return data;
  };
  
  // Filter data for selected domain
  const getFilteredChartData = () => {
    if (selectedDomain === 'all') {
      return rawData;
    }
    
    return rawData.map(entry => {
      return {
        date: entry.date,
        [selectedDomain]: entry[selectedDomain]
      };
    });
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Insights</h1>
      
      <div className="bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <div className="text-sm text-gray-500 mb-2">View data by</div>
            <div className="relative inline-block">
              <button 
                className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 flex items-center"
                onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              >
                <Calendar className="w-4 h-4 mr-2" />
                <span className="capitalize">{period}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              
              {periodDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-md border border-gray-100 z-10 min-w-[120px]">
                  {['week', 'month', 'quarter', 'year'].map(p => (
                    <button
                      key={p}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 capitalize
                              ${period === p ? 'text-[var(--color-primary)]' : 'text-gray-700'}`}
                      onClick={() => {
                        setPeriod(p);
                        setPeriodDropdownOpen(false);
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-2">Filter by domain</div>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 rounded-lg text-sm border transition-colors
                          ${selectedDomain === 'all' 
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'}`}
                onClick={() => setSelectedDomain('all')}
              >
                All
              </button>
              
              {Object.entries(DOMAIN_CONFIG).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <button
                    key={key}
                    className={`px-3 py-1 rounded-lg text-sm border transition-colors flex items-center
                              ${selectedDomain === key 
                                ? 'text-white border-transparent' 
                                : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'}`}
                    style={{ 
                      backgroundColor: selectedDomain === key ? config.color : '',
                      borderColor: selectedDomain === key ? config.color : ''
                    }}
                    onClick={() => setSelectedDomain(key)}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">{config.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Main chart */}
        <div ref={chartRef} className={`h-80 ${showChartAnimation ? 'chart-pulse' : ''}`}>
          {isChartLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-b-2 border-[var(--color-primary)] rounded-full"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getFilteredChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={[0, 10]} 
                  ticks={[0, 2, 4, 6, 8, 10]}
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip 
                  formatter={(value) => [value, '']}
                  labelFormatter={(label) => formatDate(label)}
                />
                <Legend />
                
                {(selectedDomain === 'all' ? Object.keys(DOMAIN_CONFIG) : [selectedDomain]).map(domain => {
                  const config = DOMAIN_CONFIG[domain];
                  return (
                    <Line
                      key={domain}
                      type="monotone"
                      dataKey={domain}
                      name={config.label}
                      stroke={config.color}
                      strokeWidth={2}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                      dot={{ r: 4, strokeWidth: 2, stroke: '#fff' }}
                      isAnimationActive={true}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      
      {/* Insights section */}
      <div 
        ref={insightRef}
        className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-6
                  ${showInsightAnimation ? 'animate-pulse' : ''}`}
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Insights</h2>
        
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-blue-800">{analysisResults.overallInsight}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Variability Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Pattern Analysis</h3>
            
            {Object.entries(analysisResults.variabilityInsights).map(([domain, data]) => {
              const { level, value } = data;
              const config = DOMAIN_CONFIG[domain];
              const Icon = config.icon;
              
              return (
                <div key={domain} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div 
                    className="p-2 rounded-lg mr-3"
                    style={{ backgroundColor: config.iconBgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-gray-800">{config.label}</span>
                      <span 
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full
                                  ${level === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : level === 'moderate' 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-green-100 text-green-800'}`}
                      >
                        {level === 'high' ? 'High variability' : level === 'moderate' ? 'Moderate variability' : 'Stable'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {level === 'high' 
                        ? 'Shows significant fluctuations. Consider identifying triggers for low days.'
                        : level === 'moderate'
                          ? 'Shows some variability, but within a normal range.'
                          : 'Very consistent ratings. You have a stable routine in this area.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Suggestions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-700">Personalized Suggestions</h3>
            
            <div className="space-y-3">
              {analysisResults.suggestions.slice(0, 3).map((suggestion, index) => {
                const Icon = suggestion.icon;
                const domain = suggestion.domain || (suggestion.domains && suggestion.domains[0]);
                const config = domain ? DOMAIN_CONFIG[domain] : null;
                
                return (
                  <div 
                    key={index} 
                    className="p-4 bg-gray-50 rounded-lg"
                    style={{ 
                      borderLeft: config ? `4px solid ${config.color}` : '4px solid #e5e7eb'
                    }}
                  >
                    <div className="flex items-start">
                      <div className="p-1 rounded-full bg-white mr-3">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <p className="text-sm text-gray-700">{suggestion.text}</p>
                    </div>
                  </div>
                );
              })}
              
              {analysisResults.suggestions.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-sm">
                  Continue tracking your progress to receive personalized suggestions.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Correlation insights */}
        {analysisResults.correlations.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Domain Relationships</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analysisResults.correlations.map((correlation, index) => {
                const [domain1, domain2] = correlation.domains;
                const config1 = DOMAIN_CONFIG[domain1];
                const config2 = DOMAIN_CONFIG[domain2];
                const Icon1 = config1.icon;
                const Icon2 = config2.icon;
                
                return (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className="p-1 rounded-lg" style={{ backgroundColor: config1.iconBgColor }}>
                          <Icon1 className="w-4 h-4" style={{ color: config1.color }} />
                        </div>
                        <span className="mx-2 text-xs font-medium">{config1.label}</span>
                      </div>
                      
                      {correlation.positive ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      
                      <div className="flex items-center">
                        <span className="mx-2 text-xs font-medium">{config2.label}</span>
                        <div className="p-1 rounded-lg" style={{ backgroundColor: config2.iconBgColor }}>
                          <Icon2 className="w-4 h-4" style={{ color: config2.color }} />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      {correlation.positive 
                        ? 'These domains tend to improve together'
                        : 'These domains tend to move in opposite directions'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Additional charts section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Weekly averages chart */}
        <div className="bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Weekly Averages</h3>
          
          <div className="h-64">
            {isChartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-b-2 border-[var(--color-primary)] rounded-full"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAverages} margin={{ top: 5, right: 5, left: 0, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="week" 
                    tickFormatter={(date) => {
                      const d = new Date(date);
                      return `W${Math.ceil((d.getDate() + d.getDay()) / 7)}`;
                    }}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    ticks={[0, 2, 4, 6, 8, 10]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}`, '']}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
                    }}
                  />
                  <Legend />
                  
                  {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                    <Bar 
                      key={key}
                      dataKey={key}
                      name={config.label}
                      fill={config.color}
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* Domain balance chart */}
        <div className="bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Domain Balance</h3>
          
          <div className="h-64">
            {isChartLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-b-2 border-[var(--color-primary)] rounded-full"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={[domainBalance]}
                  margin={{ top: 5, right: 5, left: 0, bottom: 30 }}
                >
                  <YAxis 
                    domain={[0, 100]} 
                    ticks={[0, 20, 40, 60, 80, 100]}
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}%`, '']}
                  />
                  <Legend />
                  
                  {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
                    <Area
                      key={key}
                      dataKey={key}
                      name={config.label}
                      stroke={config.color}
                      fill={config.color}
                      fillOpacity={0.6}
                      isAnimationActive={true}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      
      {/* Domain insights cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
        {Object.keys(DOMAIN_CONFIG).map(domain => {
          const config = DOMAIN_CONFIG[domain];
          const insight = domainInsights[domain] || {};
          const trend = domainTrends[domain] || {};
          const Icon = config.icon;
          
          return (
            <div 
              key={domain}
              className={`bg-gray-50 rounded-lg p-3 border border-gray-100 transition-all
                        ${showInsightAnimation && domain === analysisResults.topPerformingDomain 
                          ? 'border-green-300 shadow-md' : ''}
                        ${showInsightAnimation && domain === analysisResults.needsAttentionDomain
                          ? 'border-amber-300 shadow-md' : ''}`}
            >
              <div className="flex items-center mb-2">
                <Icon className="w-4 h-4 mr-1" style={{ color: config.color }} />
                <h3 className="text-sm font-medium" style={{ color: config.color }}>
                  {config.label}
                </h3>
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Current</span>
                  <span className="font-medium">
                    {trend.current?.toFixed(1) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Change</span>
                  <span className={`font-medium flex items-center ${trend.improving ? 'text-green-500' : 'text-red-500'}`}>
                    {trend.percentChange ? `${trend.percentChange > 0 ? '+' : ''}${trend.percentChange.toFixed(1)}%` : 'N/A'}
                    {trend.improving ? 
                      <ArrowUpRight className="w-3 h-3 ml-1" /> : 
                      <ArrowDownRight className="w-3 h-3 ml-1" />
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Peak</span>
                  <span className="font-medium">
                    {insight.peak?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 