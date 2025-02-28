import React, { useEffect, useRef, useState } from 'react';
import { Activity, Brain, Users, Briefcase, Star, TrendingUp, TrendingDown, AlertTriangle, ThumbsUp } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { typewriterEffect } from '../utils/textEffects';

// Domain icons configuration
const DOMAIN_ICONS = {
  health: Activity,
  mental: Brain,
  social: Users,
  career: Briefcase,
  growth: Star
};

export function AnalyticsInsights({ domainData, recentChange }) {
  const insightTextRef = useRef(null);
  const [previousData, setPreviousData] = useState(null);
  const [animatingInsight, setAnimatingInsight] = useState(false);
  
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
  
  return (
    <div className="pt-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-100">Personal Insights</h2>
      
      {/* Primary insight text */}
      <div className="bg-blue-50 bg-opacity-5 backdrop-blur-sm rounded-xl p-6 mb-6">
        <p 
          ref={insightTextRef}
          className={`text-blue-100 text-lg ${animatingInsight ? 'opacity-90' : 'opacity-100'}`}
        >
          {!domainData ? "Start tracking your progress to see personalized insights." : 
            "You're doing exceptionally well across all areas. Your consistent high ratings suggest you've found an effective balance in your life."}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pattern analysis section */}
        <div>
          <h3 className="text-xl font-medium mb-4 text-gray-100">Pattern Analysis</h3>
          
          {domainData && Object.keys(DOMAIN_ICONS).map(domain => {
            const Icon = DOMAIN_ICONS[domain];
            const score = domainData[domain] || 0;
            const status = determineStatus(domain, domainData, recentChange);
            const statusBgColor = getStatusColor(status);
            const glowClass = getGlowClass(score);
            
            return (
              <div 
                key={domain}
                className={`mb-4 rounded-lg p-4 bg-gray-800 bg-opacity-60 border border-gray-700
                          ${recentChange && recentChange.domain === domain ? 'animate-pulse-once' : ''}`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded ${getDomainColor(domain)} ${glowClass}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-base font-medium text-gray-100">
                        {getDomainLabel(domain)}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${statusBgColor}`}>
                        {status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-300 mt-1">
                      {getDomainData(domain, status)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Personalized suggestions */}
        <div>
          <h3 className="text-xl font-medium mb-4 text-gray-100">Personalized Suggestions</h3>
          
          {domainData ? generateSuggestions(domainData, recentChange).map((suggestion, index) => (
            <div 
              key={index}
              className={`mb-4 rounded-lg p-4 bg-gray-800 bg-opacity-60 border ${suggestion.borderColor || 'border-gray-700'}
                        ${suggestion.isNew ? 'animate-slide-in' : ''}`}
            >
              <div className="flex items-start">
                <div className={`mt-1 ${suggestion.iconColor}`}>
                  {suggestion.icon}
                </div>
                <div className="ml-3">
                  <p className="text-gray-200">{suggestion.text}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="mb-4 rounded-lg p-4 bg-gray-800 bg-opacity-60 border border-gray-700">
              <p className="text-gray-300">Track your progress to receive personalized suggestions.</p>
            </div>
          )}
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
      icon: <Sliders className="w-5 h-5" />,
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