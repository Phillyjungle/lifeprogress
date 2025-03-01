import React, { useEffect, useRef, useState } from 'react';
import { Activity, Brain, Users, Briefcase, Star, TrendingUp, TrendingDown, AlertTriangle, ThumbsUp, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { typewriterEffect } from '../utils/textEffects';

// Domain icons configuration with theme support
const DOMAIN_CONFIG = {
  health: {
    label: 'Physical Health',
    color: '#4361ee',
    glowColor: 'rgba(67, 97, 238, 0.5)',
    icon: Activity
  },
  mental: {
    label: 'Mental Wellbeing',
    color: '#4cc9f0',
    glowColor: 'rgba(76, 201, 240, 0.5)',
    icon: Brain
  },
  social: {
    label: 'Social Life',
    color: '#ff8fab',
    glowColor: 'rgba(255, 143, 171, 0.5)',
    icon: Users
  },
  career: {
    label: 'Career Growth',
    color: '#f77f00',
    glowColor: 'rgba(247, 127, 0, 0.5)',
    icon: Briefcase
  },
  growth: {
    label: 'Personal Growth',
    color: '#2a9d8f',
    glowColor: 'rgba(42, 157, 143, 0.5)',
    icon: Star
  }
};

export function AnalyticsInsights({ domainData, recentChange }) {
  const insightTextRef = useRef(null);
  const [previousData, setPreviousData] = useState(null);
  const [animatingInsight, setAnimatingInsight] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  
  // Track significant changes in domain data
  useEffect(() => {
    if (!domainData) return;
    
    if (!previousData) {
      setPreviousData(domainData);
      return;
    }
    
    // Compare current with previous to detect changes
    const changes = [];
    Object.keys(domainData).forEach(domain => {
      if (previousData[domain] && Math.abs(domainData[domain] - previousData[domain]) >= 1) {
        changes.push({
          domain,
          oldValue: previousData[domain],
          newValue: domainData[domain],
          difference: domainData[domain] - previousData[domain]
        });
      }
    });
    
    // Generate and animate new insight if there are significant changes
    if (changes.length > 0 && insightTextRef.current) {
      setAnimatingInsight(true);
      const newInsight = generateInsightText(changes, domainData);
      
      // Use typewriter effect for new insight
      const cleanup = typewriterEffect(insightTextRef.current, newInsight, 20);
      
      setTimeout(() => {
        setAnimatingInsight(false);
        setPreviousData(domainData);
      }, newInsight.length * 20 + 500);
      
      return cleanup;
    }
  }, [domainData, previousData]);
  
  // Detect theme on mount and when it changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark-theme');
      setIsLightTheme(!isDark);
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Function to generate insight text based on recent changes
  const generateInsightText = (changes, currentData) => {
    if (changes.length === 0) {
      // Default insight for no significant changes
      const averageScore = Object.values(currentData).reduce((sum, val) => sum + val, 0) / Object.values(currentData).length;
      
      if (averageScore >= 7) {
        return "You're doing exceptionally well across all areas. Your consistent high ratings suggest you've found an effective balance in your life.";
      } else if (averageScore >= 5) {
        return "You're maintaining a good balance overall. Continue with your current approach while looking for small improvements.";
      } else {
        return "There's room for improvement across several areas. Focus on making incremental progress rather than dramatic changes.";
      }
    }
    
    // Generate insights for specific changes
    if (changes.length === 1) {
      const change = changes[0];
      const domainName = getDomainLabel(change.domain);
      
      if (change.difference > 0) {
        return `Your ${domainName} score has improved by ${change.difference.toFixed(1)} points! ${getPositiveInsight(change.domain, change.newValue)}`;
      } else {
        return `Your ${domainName} score has decreased by ${Math.abs(change.difference).toFixed(1)} points. ${getNegativeInsight(change.domain, change.newValue)}`;
      }
    } else {
      // Multiple domains changed
      const improved = changes.filter(c => c.difference > 0);
      const declined = changes.filter(c => c.difference < 0);
      
      if (improved.length > 0 && declined.length === 0) {
        return `Great progress! You've improved in ${improved.length} areas: ${improved.map(c => getDomainLabel(c.domain)).join(', ')}. Keep up the momentum!`;
      } else if (declined.length > 0 && improved.length === 0) {
        return `You've experienced a decline in ${declined.length} areas: ${declined.map(c => getDomainLabel(c.domain)).join(', ')}. Consider what factors might be affecting these domains.`;
      } else {
        return `Mixed changes in your scores: improvements in ${improved.map(c => getDomainLabel(c.domain)).join(', ')} and declines in ${declined.map(c => getDomainLabel(c.domain)).join(', ')}. Focus on maintaining your gains while addressing areas that need attention.`;
      }
    }
  };
  
  // Domain-specific positive insights
  const getPositiveInsight = (domain, value) => {
    const insights = {
      health: [
        "Your physical health habits are paying off. Keep maintaining your routine.",
        "Exercise and healthy habits are becoming more consistent in your life.",
        "You're building strength and endurance with your consistent approach."
      ],
      mental: [
        "Your mental wellbeing practices are showing results. Continue your mindfulness routine.",
        "Stress management techniques are working well for you.",
        "Your emotional resilience is growing stronger with practice."
      ],
      social: [
        "Your social connections are flourishing. Continue nurturing these relationships.",
        "Making time for meaningful interactions is improving your social wellbeing.",
        "Your efforts to connect with others are creating a stronger support network."
      ],
      career: [
        "Your professional development is on an upward trajectory.",
        "Your career focus is yielding positive results. Keep setting clear goals.",
        "Your work-life balance strategies are supporting your career growth."
      ],
      growth: [
        "Your commitment to personal development is showing clear results.",
        "Learning and growing consistently is becoming a strength for you.",
        "Your self-improvement efforts are creating positive momentum."
      ]
    };
    
    // Select a random insight from the domain
    const domainInsights = insights[domain] || insights.growth;
    return domainInsights[Math.floor(Math.random() * domainInsights.length)];
  };
  
  // Domain-specific negative insights
  const getNegativeInsight = (domain, value) => {
    const insights = {
      health: [
        "Consider setting aside more time for physical activity this week.",
        "Small adjustments to your daily routine could help improve your physical wellbeing.",
        "Remember that consistent small efforts have a bigger impact than occasional intense ones."
      ],
      mental: [
        "It might help to incorporate more mindfulness or relaxation practices into your day.",
        "Consider what sources of stress you can address or manage differently.",
        "Even brief moments of calm can help restore mental balance during challenging periods."
      ],
      social: [
        "Try reaching out to one person you haven't connected with recently.",
        "Quality social interactions, even brief ones, can significantly impact your wellbeing.",
        "Consider both in-person and virtual ways to strengthen your social connections."
      ],
      career: [
        "Reflect on your current work challenges and identify one small step toward improvement.",
        "Setting clear boundaries might help restore your professional energy.",
        "Consider what skills you might develop to feel more confident in your career path."
      ],
      growth: [
        "Small learning opportunities add up over time - look for brief moments to grow.",
        "Reconnecting with activities that inspire you might reignite your personal growth.",
        "Remember that growth isn't always linear - periods of plateau are normal."
      ]
    };
    
    // Select a random insight from the domain
    const domainInsights = insights[domain] || insights.growth;
    return domainInsights[Math.floor(Math.random() * domainInsights.length)];
  };
  
  // Domain scores to get overall status
  const scores = domainData ? Object.entries(DOMAIN_CONFIG).map(([key]) => domainData[key] || 0) : [];
  const average = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  
  // Determine domain with highest and lowest score
  let highestDomain = '';
  let highestScore = 0;
  let lowestDomain = '';
  let lowestScore = 10;
  
  if (domainData) {
    Object.entries(DOMAIN_CONFIG).forEach(([key, config]) => {
      const score = domainData[key] || 0;
      if (score > highestScore) {
        highestScore = score;
        highestDomain = key;
      }
      if (score < lowestScore && score > 0) {
        lowestScore = score;
        lowestDomain = key;
      }
    });
  }
  
  const domainPatterns = {
    health: {
      status: 'stable',
      insight: 'Very consistent ratings. You have a stable routine in this area.'
    },
    mental: {
      status: 'stable',
      insight: 'Very consistent ratings. You have a stable routine in this area.'
    },
    social: {
      status: 'improving',
      insight: 'Your social connections are gradually improving. Continue this trend.'
    },
    career: {
      status: 'fluctuating',
      insight: 'Your career metrics show some variability. This could indicate changing priorities.'
    },
    growth: {
      status: 'improving',
      insight: 'Your personal growth is trending upward. Your efforts are paying off.'
    }
  };
  
  const suggestions = [
    'Great job maintaining consistent high scores in Physical Health! Keep it up.',
    'Great job maintaining consistent high scores in Social Life! Keep it up.',
    'Try setting short-term Personal Growth goals to maintain your momentum.',
    'Your Career Growth shows potential for improvement - consider setting specific objectives.'
  ];
  
  // Calculate variability levels for each domain
  const domainVariability = {
    health: { level: 'moderate', insight: 'Your Physical Health has moderate ups and downs. Work on stabilizing the most effective practices.' },
    mental: { level: 'moderate', insight: 'Your Mental Wellbeing has moderate ups and downs. Work on stabilizing the most effective practices.' },
    social: { level: 'moderate', insight: 'Your Social Life has moderate ups and downs. Work on stabilizing the most effective practices.' },
    career: { level: 'low', insight: 'Your Career Growth scores are very stable. You\'ve found a consistent approach.' },
    growth: { level: 'moderate', insight: 'Your Personal Growth has moderate ups and downs. Work on stabilizing the most effective practices.' }
  };
  
  // Domain correlations data
  const correlationData = [
    { source: 'health', target: 'growth', positive: true },
    { source: 'health', target: 'social', positive: true },
    { source: 'mental', target: 'social', positive: false },
    { source: 'social', target: 'growth', positive: true }
  ];

  // Get the background color for cards based on theme
  const getCardBgColor = () => {
    return isLightTheme ? 'var(--color-card, #f0f0f0)' : 'var(--color-slate-blue, #4f5a74)';
  };

  // Get badge styles based on variability level
  const getVariabilityBadgeStyle = (level) => {
    if (isLightTheme) {
      return level === 'low' 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-amber-100 text-amber-800 border border-amber-200';
    } else {
      return level === 'low' 
        ? 'bg-green-700 text-white' 
        : 'bg-amber-700 text-white';
    }
  };

  return (
    <div className="analytics-insights">
      {/* Apply styling with theme support */}
      <style jsx>{`
        /* Theme-aware variables */
        .analytics-insights {
          --text-primary: var(--color-text);
          --text-secondary: var(--color-text-secondary);
          --card-bg: var(--color-card);
          --domain-card-bg: #4f5a74;
          --badge-text: #ffffff;
        }

        /* Light theme overrides */
        :global(.light-theme) .analytics-insights {
          --domain-card-bg: #5c677f;
          --badge-text: #ffffff;
        }

        .domain-card {
          background-color: var(--domain-card-bg);
          border-radius: 12px;
          margin-bottom: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .domain-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .domain-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          margin-right: 16px;
        }

        :global(.dark-theme) .domain-icon {
          box-shadow: 0 0 15px var(--glow-color);
        }

        :global(.light-theme) .domain-icon {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .status-badge {
          padding: 5px 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--badge-text);
        }

        .status-badge.moderate {
          background-color: rgb(180, 83, 9);
        }

        .status-badge.low {
          background-color: rgb(22, 101, 52);
        }

        .status-badge.high {
          background-color: rgb(159, 18, 57);
        }

        .correlation-badge {
          background-color: rgb(22, 101, 52);
          color: var(--badge-text);
          padding: 5px 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
        }

        .section-heading {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .domain-heading {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .domain-insight {
          font-size: 16px;
          color: var(--text-primary);
          opacity: 0.9;
          line-height: 1.5;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .domain-heading {
            font-size: 18px;
          }
          
          .domain-insight {
            font-size: 14px;
          }
          
          .section-heading {
            font-size: 22px;
          }
          
          .domain-card {
            padding: 12px;
          }
        }

        @keyframes pulse-glow {
          0% {
            filter: drop-shadow(0 0 2px currentColor);
            opacity: 0.9;
          }
          50% {
            filter: drop-shadow(0 0 10px currentColor);
            opacity: 1;
          }
          100% {
            filter: drop-shadow(0 0 2px currentColor);
            opacity: 0.9;
          }
        }
        
        .domain-icon {
          animation: pulse-glow 2s infinite ease-in-out;
        }
        
        /* Stagger the animations */
        .domain-icon-health {
          animation-delay: 0s;
        }
        .domain-icon-mental {
          animation-delay: 0.4s;
        }
        .domain-icon-social {
          animation-delay: 0.8s;
        }
        .domain-icon-career {
          animation-delay: 1.2s;
        }
        .domain-icon-growth {
          animation-delay: 1.6s;
        }
        
        /* More intense glow for relationship icons */
        .relationship-icon {
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 5px currentColor);
          animation: pulse-glow 3s infinite ease-in-out;
        }
      `}</style>

      <div className="mb-8">
        <h2 className="section-heading">Pattern Analysis</h2>
        
        {Object.entries(domainVariability).map(([domain, insight]) => {
          const config = DOMAIN_CONFIG[domain];
          const Icon = config?.icon || Activity;
          
          return (
            <div 
              key={domain} 
              className="mb-4 rounded-lg overflow-hidden"
              style={{ 
                backgroundColor: isLightTheme ? 'rgba(236, 230, 220, 0.8)' : 'var(--color-slate-blue, #4f5a74)'
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <div className="relative">
                      <Icon 
                        className={`w-6 h-6 mr-2 domain-icon domain-icon-${domain}`}
                        style={{ color: config.color }}
                      />
                      {/* Additional glow effect behind icon */}
                      <div 
                        className="absolute inset-0 -z-10 rounded-full blur-md"
                        style={{ 
                          backgroundColor: `${config.color}30`, 
                          transform: 'scale(1.5)',
                          opacity: isLightTheme ? 0.5 : 0.8
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-semibold text-[var(--color-text)]">{config.label}</h3>
                  </div>
                  
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getVariabilityBadgeStyle(insight.level)}`}>
                    {insight.level.charAt(0).toUpperCase() + insight.level.slice(1)} Variability
                  </span>
                </div>
                
                <p className="text-[var(--color-text)] mt-2">{insight.insight}</p>
              </div>
            </div>
          );
        })}
        
        <h2 className="section-heading mt-8">Domain Relationships</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {correlationData.map((corr, index) => {
            const sourceConfig = DOMAIN_CONFIG[corr.source];
            const targetConfig = DOMAIN_CONFIG[corr.target];
            const SourceIcon = sourceConfig?.icon;
            const TargetIcon = targetConfig?.icon;
            
            return (
              <div 
                key={index} 
                className="p-5 rounded-lg" 
                style={{ 
                  backgroundColor: isLightTheme ? 'rgba(236, 230, 220, 0.8)' : 'var(--color-slate-blue, #4f5a74)'
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="relative">
                      <SourceIcon 
                        className="relationship-icon w-5 h-5" 
                        style={{ 
                          color: sourceConfig.color,
                          animationDelay: `${index * 0.3}s`
                        }}
                      />
                      <div 
                        className="absolute inset-0 -z-10 rounded-full blur-md"
                        style={{ 
                          backgroundColor: `${sourceConfig.color}30`, 
                          transform: 'scale(1.5)',
                          opacity: isLightTheme ? 0.5 : 0.8
                        }}
                      />
                    </div>
                    <div className="mx-2 text-[var(--color-text)]">⟺</div>
                    <div className="relative">
                      <TargetIcon 
                        className="relationship-icon w-5 h-5" 
                        style={{ 
                          color: targetConfig.color,
                          animationDelay: `${index * 0.3 + 0.15}s`
                        }}
                      />
                      <div 
                        className="absolute inset-0 -z-10 rounded-full blur-md"
                        style={{ 
                          backgroundColor: `${targetConfig.color}30`, 
                          transform: 'scale(1.5)',
                          opacity: isLightTheme ? 0.5 : 0.8
                        }}
                      />
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    corr.positive 
                      ? (isLightTheme ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-green-700 text-white') 
                      : (isLightTheme ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-red-700 text-white')
                  }`}>
                    {corr.positive ? 'Positive' : 'Negative'} correlation
                  </span>
                </div>
                
                <p className="text-[var(--color-text)]">
                  {corr.positive
                    ? `As your ${sourceConfig.label} improves, your ${targetConfig.label} tends to improve as well.`
                    : `When your ${sourceConfig.label} increases, your ${targetConfig.label} tends to decrease.`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper to determine domain status
function determineStatus(domain, data, recentChange) {
  if (!data || !data[domain]) return 'No Data';
  
  const hasRecentChange = recentChange && recentChange.domain === domain;
  if (hasRecentChange) {
    return recentChange.difference > 0 ? 'Improving' : 'Declining';
  }
  
  // Default to stable if no recent change
  return 'Stable';
}

// Get domain-specific text based on status
function getDomainData(domain, status) {
  if (status === 'Stable') {
    return 'Very consistent ratings. You have a stable routine in this area.';
  } else if (status === 'Improving') {
    return 'Your scores are trending upward. Your recent changes are having a positive impact.';
  } else if (status === 'Declining') {
    return 'Your scores have been decreasing recently. Consider what factors might be affecting this area.';
  } else {
    return 'Not enough data yet to establish a pattern.';
  }
}

// Generate CSS class for glow effect based on score
function getGlowClass(score) {
  if (score >= 7) return 'score-glow-high';
  if (score >= 4) return 'score-glow-medium';
  return 'score-glow-low';
}

// Get domain-specific background color
function getDomainColor(domain) {
  const colors = {
    health: 'bg-blue-600',
    mental: 'bg-cyan-600',
    social: 'bg-pink-600',
    career: 'bg-orange-600',
    growth: 'bg-emerald-600'
  };
  return colors[domain] || 'bg-gray-600';
}

// Get status-specific color
function getStatusColor(status) {
  if (status === 'Improving') return 'bg-green-900 text-green-300';
  if (status === 'Declining') return 'bg-red-900 text-red-300';
  return 'bg-gray-700 text-gray-300';
}

// Helper to get domain label
function getDomainLabel(domain) {
  const labels = {
    health: 'Physical Health',
    mental: 'Mental Wellbeing',
    social: 'Social Life',
    career: 'Career Growth',
    growth: 'Personal Growth'
  };
  return labels[domain] || domain;
}

// Generate personalized suggestions
function generateSuggestions(data, recentChange) {
  if (!data) return [];
  
  const suggestions = [];
  const domains = Object.keys(data);
  
  // Add domain-specific suggestions
  domains.forEach(domain => {
    const score = data[domain];
    const isRecentlyChanged = recentChange && recentChange.domain === domain;
    
    // Generate suggestion based on score and recent change
    if (score >= 7) {
      suggestions.push({
        text: `Great job maintaining consistent high scores in ${getDomainLabel(domain)}! Keep it up.`,
        icon: <ThumbsUp className="w-5 h-5" />,
        iconColor: 'text-green-400',
        borderColor: 'border-green-600',
        isNew: isRecentlyChanged && recentChange.difference > 0
      });
    } else if (score < 4) {
      let suggestionText = '';
      switch(domain) {
        case 'health':
          suggestionText = 'Try incorporating a short daily walk or stretch to boost your physical wellbeing.';
          break;
        case 'mental':
          suggestionText = 'Consider adding a 5-minute daily meditation to improve mental clarity.';
          break;
        case 'social':
          suggestionText = 'Reaching out to one friend per week could help strengthen your social connections.';
          break;
        case 'career':
          suggestionText = 'Setting aside 15 minutes for learning could boost your career satisfaction.';
          break;
        case 'growth':
          suggestionText = 'Try journaling for 5 minutes daily to enhance your personal growth journey.';
          break;
        default:
          suggestionText = `Consider small daily habits to improve your ${getDomainLabel(domain)}.`;
      }
      
      suggestions.push({
        text: suggestionText,
        icon: <AlertTriangle className="w-5 h-5" />,
        iconColor: 'text-amber-400',
        borderColor: 'border-amber-600',
        isNew: isRecentlyChanged
      });
    }
  });
  
  // Add suggestions about balance if there's a big difference between domains
  const scores = Object.values(data);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  
  if (maxScore - minScore > 3) {
    const highDomain = Object.keys(data).find(key => data[key] === maxScore);
    const lowDomain = Object.keys(data).find(key => data[key] === minScore);
    
    suggestions.push({
      text: `There's a significant difference between your ${getDomainLabel(highDomain)} and ${getDomainLabel(lowDomain)} scores. Consider how you might bring more balance to these areas.`,
      icon: <Zap className="w-5 h-5" />,
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-600',
      isNew: false
    });
  }
  
  return suggestions.slice(0, 3); // Limit to 3 suggestions
}

// Sliders icon component
function Sliders(props) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="4" y1="21" x2="4" y2="14"></line>
      <line x1="4" y1="10" x2="4" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12" y2="3"></line>
      <line x1="20" y1="21" x2="20" y2="16"></line>
      <line x1="20" y1="12" x2="20" y2="3"></line>
      <line x1="1" y1="14" x2="7" y2="14"></line>
      <line x1="9" y1="8" x2="15" y2="8"></line>
      <line x1="17" y1="16" x2="23" y2="16"></line>
    </svg>
  );
} 