import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, Plus, Activity, Brain, Users, Briefcase, Star, LogOut } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RatingGuideModal } from './RatingGuideModal';
import { useProgress } from '../context/ProgressContext';
import { DomainData, DomainKey } from '../types/analytics';
import { DOMAIN_CONFIG } from '../config/domains';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface ProgressEntry {
  health: number;
  mental: number;
  social: number;
  career: number;
  growth: number;
  date: string;
}

// Domain configuration with colors and icons
const DOMAIN_CONFIG_LOCAL = {
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
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<any>;
  label?: string;
}

// Custom tooltip component for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white bg-opacity-90 p-4 rounded-xl shadow-sm border border-gray-100">
        <p className="text-gray-700 font-medium mb-2">{formatDate(label || '')}</p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const [isRatingGuideOpen, setIsRatingGuideOpen] = useState(false);
  const { entries, addEntry } = useProgress();
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentRatings, setCurrentRatings] = useState({
    health: 8.5,
    mental: 6.0,
    social: 6.5,
    career: 7.5,
    growth: 8.0
  });
  
  const [previousRatings, setPreviousRatings] = useState({
    health: 9.0,
    mental: 6.0,
    social: 7.0,
    career: 7.0,
    growth: 7.5
  });
  
  // State for today's ratings
  const [todayRatings, setTodayRatings] = useState({
    health: 5.0,
    mental: 5.0,
    social: 5.0,
    career: 5.0,
    growth: 5.0
  });

  // Animation states
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [pulseDomains, setPulseDomains] = useState({
    health: false,
    mental: false,
    social: false,
    career: false,
    growth: false
  });

  // Reference to chart container for animations
  const chartRef = useRef<HTMLDivElement | null>(null);
  
  // Load entries and current ratings
  useEffect(() => {
    if (entries.length > 0) {
      // Generate chart data from entries
      const lastTenEntries = entries.slice(-10);
      setChartData(lastTenEntries as any[]);
      
      // Set current ratings from the latest entry
      const latestEntry = entries[entries.length - 1];
      setCurrentRatings({
        health: latestEntry.health || 5,
        mental: latestEntry.mental || 5,
        social: latestEntry.social || 5,
        career: latestEntry.career || 5,
        growth: latestEntry.growth || 5
      });
      
      // Set previous ratings from the second latest entry if available
      if (entries.length > 1) {
        const previousEntry = entries[entries.length - 2];
        setPreviousRatings({
          health: previousEntry.health || 5,
          mental: previousEntry.mental || 5,
          social: previousEntry.social || 5,
          career: previousEntry.career || 5,
          growth: previousEntry.growth || 5
        });
      }
    }
  }, [entries]);
  
  // Generate sample data for the chart
  const generateExampleData = () => {
    const today = new Date();
    const exampleData = [];
    
    for (let i = 9; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      exampleData.push({
        date: date.toISOString().split('T')[0],
        health: Math.round((Math.random() * 3 + 7) * 10) / 10,
        mental: Math.round((Math.random() * 2 + 6) * 10) / 10,
        social: Math.round((Math.random() * 2 + 7) * 10) / 10,
        career: Math.round((Math.random() * 2 + 7) * 10) / 10,
        growth: Math.round((Math.random() * 2 + 7) * 10) / 10
      });
    }
    
    return exampleData;
  };
  
  // Simulate value changes for live-like experience
  const simulateValueChanges = () => {
    // Small random changes to current ratings
    const smallChange = () => (Math.random() * 0.4 - 0.2);
    
    setCurrentRatings(prev => ({
      health: Math.max(1, Math.min(10, Math.round((prev.health + smallChange()) * 10) / 10)),
      mental: Math.max(1, Math.min(10, Math.round((prev.mental + smallChange()) * 10) / 10)),
      social: Math.max(1, Math.min(10, Math.round((prev.social + smallChange()) * 10) / 10)),
      career: Math.max(1, Math.min(10, Math.round((prev.career + smallChange()) * 10) / 10)),
      growth: Math.max(1, Math.min(10, Math.round((prev.growth + smallChange()) * 10) / 10))
    }));
  };
  
  // Simulate random domain pulses
  const simulateDomainPulse = () => {
    const domains = ['health', 'mental', 'social', 'career', 'growth'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    
    setPulseDomains(prev => ({
      ...prev,
      [randomDomain]: true
    }));
    
    setTimeout(() => {
      setPulseDomains(prev => ({
        ...prev,
        [randomDomain]: false
      }));
    }, 2000);
  };
  
  // Handle saving new progress entry
  const handleSaveProgress = () => {
    // Show saving state
    setIsSaving(true);
    
    // Get current date in user's local timezone
    const now = new Date();
    // Format as YYYY-MM-DD with timezone consideration
    const localDate = now.getFullYear() + '-' + 
                     String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(now.getDate()).padStart(2, '0');
    
    // Create new entry with today's date
    const newEntry: DomainData = {
      ...todayRatings,
      id: uuidv4(),
      date: localDate
    };
    
    // Add entry to context (which will update localStorage)
    addEntry(newEntry);
    
    // Animate chart
    if (chartRef.current) {
      chartRef.current.classList.add('chart-pulse');
      setTimeout(() => {
        if (chartRef.current) {
          chartRef.current.classList.remove('chart-pulse');
        }
      }, 1000);
    }
    
    // Animate all domains
    setPulseDomains({
      health: true,
      mental: true,
      social: true,
      career: true,
      growth: true
    });
    
    setTimeout(() => {
      setPulseDomains({
        health: false,
        mental: false,
        social: false,
        career: false,
        growth: false
      });
    }, 2000);
    
    // Show success message
    setIsSaving(false);
    setShowSavedMessage(true);
    setTimeout(() => {
      setShowSavedMessage(false);
    }, 3000);
  };
  
  // Handle rating changes
  const handleRatingChange = (domain: keyof typeof todayRatings, value: number) => {
    setTodayRatings(prev => ({
      ...prev,
      [domain]: value
    }));
    
    // Pulse the changed domain
    setPulseDomains(prev => ({
      ...prev,
      [domain]: true
    }));
    
    setTimeout(() => {
      setPulseDomains(prev => ({
        ...prev,
        [domain]: false
      }));
    }, 1000);
  };
  
  // Calculate change indicators (positive or negative changes)
  const calculateChange = (domain: keyof typeof currentRatings) => {
    const current = currentRatings[domain];
    const previous = previousRatings[domain];
    const diff = Math.round((current - previous) * 10) / 10;
    
    return diff === 0 ? "+0.0" : diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Rating Guide Button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your progress across key life areas</p>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setIsRatingGuideOpen(true)}
            className="flex items-center px-4 py-2 text-gray-700 bg-white rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Rating Guide
          </button>
        </div>
      </div>
      
      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Physical Health Card */}
        <div 
          className={`card bg-white bg-opacity-85 backdrop-blur-sm p-6 
                     transition-all duration-300 hover:-translate-y-1 hover:shadow-md 
                     ${activeCard === 'health' ? 'health-glow scale-[1.02]' : ''}`}
          onMouseEnter={() => setActiveCard('health')}
          onMouseLeave={() => setActiveCard(null)}
        >
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                            health-bg-light mr-4 transition-all duration-300
                            ${pulseDomains.health ? 'health-glow scale-110' : ''}`}>
              <Activity className="w-6 h-6 text-[var(--color-health)]" />
            </div>
            <span className="text-lg font-medium text-gray-700">Physical Health</span>
          </div>
          
          <div className="mt-6">
            <div className="text-4xl font-bold text-gray-800 animate-value-change">
              {currentRatings.health.toFixed(1)}
            </div>
            <div className={`text-sm mt-1 ${calculateChange('health').startsWith('+') && calculateChange('health') !== '+0.0' ? 'text-green-600' : calculateChange('health') === '+0.0' ? 'text-gray-500' : 'text-red-500'}`}>
              {calculateChange('health')} from last entry
            </div>
          </div>
        </div>
        
        {/* Mental Wellbeing Card */}
        <div 
          className={`card bg-white bg-opacity-85 backdrop-blur-sm p-6 
                     transition-all duration-300 hover:-translate-y-1 hover:shadow-md 
                     ${activeCard === 'mental' ? 'mental-glow scale-[1.02]' : ''}`}
          onMouseEnter={() => setActiveCard('mental')}
          onMouseLeave={() => setActiveCard(null)}
        >
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                            mental-bg-light mr-4 transition-all duration-300
                            ${pulseDomains.mental ? 'mental-glow scale-110' : ''}`}>
              <Brain className="w-6 h-6 text-[var(--color-mental)]" />
            </div>
            <span className="text-lg font-medium text-gray-700">Mental Wellbeing</span>
          </div>
          
          <div className="mt-6">
            <div className="text-4xl font-bold text-gray-800 animate-value-change">
              {currentRatings.mental.toFixed(1)}
            </div>
            <div className={`text-sm mt-1 ${calculateChange('mental').startsWith('+') && calculateChange('mental') !== '+0.0' ? 'text-green-600' : calculateChange('mental') === '+0.0' ? 'text-gray-500' : 'text-red-500'}`}>
              {calculateChange('mental')} from last entry
            </div>
          </div>
        </div>
        
        {/* Social Life Card */}
        <div 
          className={`card bg-white bg-opacity-85 backdrop-blur-sm p-6 
                     transition-all duration-300 hover:-translate-y-1 hover:shadow-md 
                     ${activeCard === 'social' ? 'social-glow scale-[1.02]' : ''}`}
          onMouseEnter={() => setActiveCard('social')}
          onMouseLeave={() => setActiveCard(null)}
        >
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center 
                            social-bg-light mr-4 transition-all duration-300
                            ${pulseDomains.social ? 'social-glow scale-110' : ''}`}>
              <Users className="w-6 h-6 text-[var(--color-social)]" />
            </div>
            <span className="text-lg font-medium text-gray-700">Social Life</span>
          </div>
          
          <div className="mt-6">
            <div className="text-4xl font-bold text-gray-800 animate-value-change">
              {currentRatings.social.toFixed(1)}
            </div>
            <div className={`text-sm mt-1 ${calculateChange('social').startsWith('+') && calculateChange('social') !== '+0.0' ? 'text-green-600' : calculateChange('social') === '+0.0' ? 'text-gray-500' : 'text-red-500'}`}>
              {calculateChange('social')} from last entry
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Over Time Chart */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-medium text-gray-800 mb-4">Progress Over Time</h2>
        <div className="h-80" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              className="animate-fade"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fill: '#666', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#ddd' }}
              />
              <YAxis 
                domain={[0, 12]} 
                tick={{ fill: '#666', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#ddd' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {Object.entries(DOMAIN_CONFIG).map(([domain, config]) => (
                <Line
                  key={domain}
                  type="monotone"
                  dataKey={domain}
                  name={config.label}
                  stroke={config.color}
                  strokeWidth={2.5}
                  dot={{ stroke: config.color, strokeWidth: 2, r: 3, fill: 'white' }}
                  activeDot={{ r: 6, stroke: config.color, strokeWidth: 2, fill: 'white' }}
                  animationDuration={1000}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Rate Your Progress Today Section */}
      <div className="card p-6">
        <h2 className="text-xl font-medium text-gray-800 mb-6">Rate Your Progress Today</h2>
        
        <div className="space-y-6">
          {/* Physical Health Slider */}
          <div className="flex items-center">
            <div className="w-40 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                              health-bg-light mr-3 transition-all duration-300
                              ${pulseDomains.health ? 'health-glow scale-110' : ''}`}>
                <Activity className="w-4 h-4 text-[var(--color-health)]" />
              </div>
              <span className="font-medium text-gray-700">Physical Health</span>
            </div>
            <div className="flex-1 mx-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.1"
                value={todayRatings.health}
                onChange={(e) => handleRatingChange('health', parseFloat(e.target.value))}
                className="w-full styled-slider health-slider" 
                style={{ 
                  '--thumb-color': 'var(--color-health)',
                  '--track-color': 'var(--color-health-light)'
                } as React.CSSProperties}
              />
            </div>
            <div className="w-12 text-right font-medium text-[var(--color-health)]">
              {todayRatings.health.toFixed(1)}
            </div>
          </div>
          
          {/* Mental Wellbeing Slider */}
          <div className="flex items-center">
            <div className="w-40 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                              mental-bg-light mr-3 transition-all duration-300
                              ${pulseDomains.mental ? 'mental-glow scale-110' : ''}`}>
                <Brain className="w-4 h-4 text-[var(--color-mental)]" />
              </div>
              <span className="font-medium text-gray-700">Mental Wellbeing</span>
            </div>
            <div className="flex-1 mx-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.1"
                value={todayRatings.mental}
                onChange={(e) => handleRatingChange('mental', parseFloat(e.target.value))}
                className="w-full styled-slider mental-slider" 
                style={{ 
                  '--thumb-color': 'var(--color-mental)',
                  '--track-color': 'var(--color-mental-light)'
                } as React.CSSProperties}
              />
            </div>
            <div className="w-12 text-right font-medium text-[var(--color-mental)]">
              {todayRatings.mental.toFixed(1)}
            </div>
          </div>
          
          {/* Social Life Slider */}
          <div className="flex items-center">
            <div className="w-40 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                              social-bg-light mr-3 transition-all duration-300
                              ${pulseDomains.social ? 'social-glow scale-110' : ''}`}>
                <Users className="w-4 h-4 text-[var(--color-social)]" />
              </div>
              <span className="font-medium text-gray-700">Social Life</span>
            </div>
            <div className="flex-1 mx-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.1"
                value={todayRatings.social}
                onChange={(e) => handleRatingChange('social', parseFloat(e.target.value))}
                className="w-full styled-slider social-slider" 
                style={{ 
                  '--thumb-color': 'var(--color-social)',
                  '--track-color': 'var(--color-social-light)'
                } as React.CSSProperties}
              />
            </div>
            <div className="w-12 text-right font-medium text-[var(--color-social)]">
              {todayRatings.social.toFixed(1)}
            </div>
          </div>
          
          {/* Career Growth Slider */}
          <div className="flex items-center">
            <div className="w-40 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                              career-bg-light mr-3 transition-all duration-300
                              ${pulseDomains.career ? 'career-glow scale-110' : ''}`}>
                <Briefcase className="w-4 h-4 text-[var(--color-career)]" />
              </div>
              <span className="font-medium text-gray-700">Career Growth</span>
            </div>
            <div className="flex-1 mx-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.1"
                value={todayRatings.career}
                onChange={(e) => handleRatingChange('career', parseFloat(e.target.value))}
                className="w-full styled-slider career-slider" 
                style={{ 
                  '--thumb-color': 'var(--color-career)',
                  '--track-color': 'var(--color-career-light)'
                } as React.CSSProperties}
              />
            </div>
            <div className="w-12 text-right font-medium text-[var(--color-career)]">
              {todayRatings.career.toFixed(1)}
            </div>
          </div>
          
          {/* Personal Growth Slider */}
          <div className="flex items-center">
            <div className="w-40 flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                              growth-bg-light mr-3 transition-all duration-300
                              ${pulseDomains.growth ? 'growth-glow scale-110' : ''}`}>
                <Star className="w-4 h-4 text-[var(--color-growth)]" />
              </div>
              <span className="font-medium text-gray-700">Personal Growth</span>
            </div>
            <div className="flex-1 mx-4">
              <input 
                type="range" 
                min="1" 
                max="10" 
                step="0.1"
                value={todayRatings.growth}
                onChange={(e) => handleRatingChange('growth', parseFloat(e.target.value))}
                className="w-full styled-slider growth-slider" 
                style={{ 
                  '--thumb-color': 'var(--color-growth)',
                  '--track-color': 'var(--color-growth-light)'
                } as React.CSSProperties}
              />
            </div>
            <div className="w-12 text-right font-medium text-[var(--color-growth)]">
              {todayRatings.growth.toFixed(1)}
            </div>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end mt-8 relative">
          {showSavedMessage && (
            <div className="absolute right-0 bottom-full mb-2 p-2 bg-green-50 text-green-600 rounded-lg animate-fade-in">
              Progress saved successfully!
            </div>
          )}
          
          <button
            onClick={handleSaveProgress}
            disabled={isSaving}
            className={`px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg 
                      transition-all shadow-sm hover:shadow-md hover:translate-y-[-1px]
                      ${isSaving ? 'opacity-75' : ''}`}
          >
            {isSaving ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              'Save Progress'
            )}
          </button>
        </div>
      </div>

      {/* Rating Guide Modal */}
      <RatingGuideModal 
        isOpen={isRatingGuideOpen} 
        onClose={() => setIsRatingGuideOpen(false)}
      />
    </div>
  );
} 