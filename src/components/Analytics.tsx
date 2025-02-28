import React, { useState, useEffect } from 'react';
import { 
  Activity, Brain, Users, Briefcase, Star,
  AlertTriangle, CheckCircle, TrendingUp, Loader2,
  HelpCircle, X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Type definitions
interface ProgressEntry {
  health: number;
  mental: number;
  social: number;
  career: number;
  growth: number;
  date: string;
}

interface Metrics {
  mean_progress: number;
  final_progress: number;
  volatility: number;
  trend: number;
}

interface Insight {
  type: 'warning' | 'success';
  message: string;
}

interface Suggestion {
  domain: string;
  type: string;
  action: string;
  description: string;
}

interface DomainAnalysis {
  metrics: Metrics;
  insights: Insight[];
  suggestions: Suggestion[];
  timeline: Array<{date: string; value: number}>;
}

interface AnalyticsProps {
  entries: ProgressEntry[];
}

// Domain Configuration
const DOMAIN_CONFIG = {
  health: {
    label: 'Physical Health',
    color: '#4361ee',
    glow: '#4361ee',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-400',
    icon: Activity,
    iconGlow: 'rgba(67, 97, 238, 0.6)'
  },
  mental: {
    label: 'Mental Wellbeing',
    color: '#4cc9f0',
    glow: '#4cc9f0',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-cyan-400',
    icon: Brain,
    iconGlow: 'rgba(76, 201, 240, 0.6)'
  },
  social: {
    label: 'Social Life',
    color: '#e63946',
    glow: '#e63946',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-red-400',
    icon: Users,
    iconGlow: 'rgba(230, 57, 70, 0.6)'
  },
  career: {
    label: 'Career Growth',
    color: '#f77f00',
    glow: '#f77f00',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-400',
    icon: Briefcase,
    iconGlow: 'rgba(247, 127, 0, 0.6)'
  },
  growth: {
    label: 'Personal Growth',
    color: '#2a9d8f',
    glow: '#2a9d8f',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-teal-400',
    icon: Star,
    iconGlow: 'rgba(42, 157, 143, 0.6)'
  }
};

// Add these styles to your index.css
const styles = `
@keyframes iconGlow {
  0% { filter: brightness(1) drop-shadow(0 0 5px var(--glow-color)); }
  50% { filter: brightness(1.3) drop-shadow(0 0 15px var(--glow-color)); }
  100% { filter: brightness(1) drop-shadow(0 0 5px var(--glow-color)); }
}

@keyframes textGlow {
  0% { text-shadow: 0 0 5px var(--glow-color); }
  50% { text-shadow: 0 0 15px var(--glow-color); }
  100% { text-shadow: 0 0 5px var(--glow-color); }
}

.icon-glow {
  animation: iconGlow 2s infinite;
}

.text-glow {
  animation: textGlow 2s infinite;
}

.domain-icon {
  transition: all 0.3s ease;
}

.domain-icon:hover {
  transform: scale(1.1);
}
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const DomainCard: React.FC<{domain: string; data: DomainAnalysis}> = ({ domain, data }) => {
  const config = DOMAIN_CONFIG[domain as keyof typeof DOMAIN_CONFIG];
  const Icon = config.icon;
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const startRandomGlow = () => {
      const shouldGlow = Math.random() > 0.7;
      if (shouldGlow) {
        setIsGlowing(true);
        setTimeout(() => setIsGlowing(false), 2000);
      }
    };

    const interval = setInterval(startRandomGlow, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div 
        className={`bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} p-4 rounded-t-xl text-white relative overflow-hidden`}
        style={{
          '--glow-color': config.iconGlow
        } as React.CSSProperties}
      >
        <div className="flex items-center gap-3">
          <div 
            className={`domain-icon p-2 rounded-lg relative backdrop-blur-sm
              ${isGlowing ? 'icon-glow' : ''}`}
            style={{
              background: `rgba(255, 255, 255, 0.2)`,
              boxShadow: `0 0 20px ${config.iconGlow}`,
            }}
          >
            <Icon 
              className="w-6 h-6 relative z-10"
              style={{ 
                filter: `drop-shadow(0 0 8px ${config.iconGlow})`,
              }}
            />
            {/* Glow overlay */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: `radial-gradient(circle at center, ${config.iconGlow} 0%, transparent 70%)`,
                filter: 'blur(4px)',
                opacity: isGlowing ? 0.8 : 0.4,
                transition: 'opacity 0.3s ease',
              }}
            />
          </div>
          <h3 
            className={`text-lg font-semibold ${isGlowing ? 'text-glow' : ''}`}
            style={{
              textShadow: `0 0 10px ${config.iconGlow}`,
            }}
          >
            {config.label}
          </h3>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Mean Progress</div>
            <div className="text-xl font-semibold">{data.metrics.mean_progress.toFixed(1)}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Volatility</div>
            <div className="text-xl font-semibold">{data.metrics.volatility.toFixed(2)}</div>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.timeline}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={config.color}
                strokeWidth={2}
                dot={false}
              />
              <XAxis hide dataKey="date" />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {data.insights.map((insight, index) => (
            <div 
              key={index}
              className={`flex items-start gap-2 p-2 rounded-lg ${
                insight.type === 'warning' 
                  ? 'bg-red-50 text-red-700' 
                  : 'bg-green-50 text-green-700'
              }`}
            >
              {insight.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <p className="text-sm">{insight.message}</p>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        {data.suggestions.length > 0 && (
          <div className="border-t pt-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Suggestions</h4>
            <div className="space-y-2">
              {data.suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm">{suggestion.action}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Update the empty state with enhanced glow
const EmptyState = () => {
  const [isGlowing, setIsGlowing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center py-12 text-gray-500">
      <div 
        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center relative
          ${isGlowing ? 'random-glow' : ''}`}
        style={{
          background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
          boxShadow: isGlowing 
            ? '0 0 30px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.4)'
            : '0 0 20px rgba(99, 102, 241, 0.4)',
          transition: 'box-shadow 0.3s ease',
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            filter: 'blur(4px)',
            opacity: isGlowing ? 1 : 0.6,
            transition: 'opacity 0.3s ease',
          }}
        />
        <TrendingUp 
          className={`w-8 h-8 relative z-10 ${isGlowing ? 'icon-glow' : ''}`}
          style={{ 
            color: '#6366f1',
            filter: `drop-shadow(0 0 ${isGlowing ? '12px' : '8px'} rgba(99, 102, 241, 0.6))`,
            transition: 'filter 0.3s ease',
          }}
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
      <p>Start tracking your progress to see detailed analytics.</p>
    </div>
  );
};

// Add RatingGuide Modal Component
const RatingGuideModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 relative">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Rating Guide</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">How to Rate Your Progress</h3>
            
            <div className="grid gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">10 - Exceptional</div>
                <p className="text-gray-600">Best possible outcome, exceeded all expectations</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">7-9 - Very Good</div>
                <p className="text-gray-600">Above average, significant progress made</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">4-6 - Average</div>
                <p className="text-gray-600">Meeting basic expectations, steady progress</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">1-3 - Needs Improvement</div>
                <p className="text-gray-600">Below expectations, requires attention</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">0 - No Progress</div>
                <p className="text-gray-600">No effort or progress made in this area</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function Analytics({ entries }: AnalyticsProps) {
  const [analysis, setAnalysis] = useState<Record<string, DomainAnalysis> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRatingGuideOpen, setIsRatingGuideOpen] = useState(false);

  useEffect(() => {
    const analyzeData = async () => {
      if (!entries.length) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Transform entries into analysis data
        const analysisData = Object.keys(DOMAIN_CONFIG).reduce((acc, domain) => {
          const values = entries.map(entry => entry[domain as keyof ProgressEntry] as number);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const final = values[values.length - 1];
          const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
          const volatility = Math.sqrt(variance);
          const trend = values.length > 1 ? (final - values[0]) / values.length : 0;

          acc[domain] = {
            metrics: {
              mean_progress: mean,
              final_progress: final,
              volatility: volatility,
              trend: trend
            },
            insights: generateInsights(mean, volatility, trend, DOMAIN_CONFIG[domain as keyof typeof DOMAIN_CONFIG].label),
            suggestions: generateSuggestions(mean, volatility, trend, domain),
            timeline: entries.map(entry => ({
              date: entry.date,
              value: entry[domain as keyof ProgressEntry] as number
            }))
          };
          return acc;
        }, {} as Record<string, DomainAnalysis>);

        setAnalysis(analysisData);
      } finally {
        setLoading(false);
      }
    };

    analyzeData();
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (!entries.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Add Rating Guide Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsRatingGuideOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-[var(--color-primary)] hover:bg-[var(--color-primary-15)] rounded-lg transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          Rating Guide
        </button>
      </div>

      {/* Rating Guide Modal */}
      <RatingGuideModal 
        isOpen={isRatingGuideOpen}
        onClose={() => setIsRatingGuideOpen(false)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(analysis || {}).map(([domain, data]) => (
          <DomainCard key={domain} domain={domain} data={data} />
        ))}
      </div>
    </div>
  );
}

// Helper functions
function generateInsights(mean: number, volatility: number, trend: number, domainLabel: string): Insight[] {
  const insights: Insight[] = [];
  
  if (volatility > 2.0) {
    insights.push({
      type: 'warning',
      message: `High variability in ${domainLabel}. Consider more consistent routines.`
    });
  }
  
  if (trend > 0.5) {
    insights.push({
      type: 'success',
      message: `Strong positive trend in ${domainLabel}. Keep it up!`
    });
  } else if (trend < -0.5) {
    insights.push({
      type: 'warning',
      message: `Declining trend in ${domainLabel}. Time to reassess.`
    });
  }
  
  return insights;
}

function generateSuggestions(mean: number, volatility: number, trend: number, domain: string): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (volatility > 2.0) {
    suggestions.push({
      domain,
      type: 'consistency',
      action: 'Establish a regular routine',
      description: 'Reduce variability through consistent habits'
    });
  }
  
  if (trend < 0) {
    suggestions.push({
      domain,
      type: 'improvement',
      action: 'Set smaller, achievable goals',
      description: 'Break down progress into manageable steps'
    });
  }
  
  return suggestions;
} 