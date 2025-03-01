import React, { useState, useMemo, useEffect } from 'react';
import { Activity, Brain, Users, Briefcase, TrendingUp, AlertTriangle, HelpCircle, LogOut, 
  LayoutDashboard, History, BarChart2, Target, Settings, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ProgressEntry, ProgressData } from './types';
import { calculateQuantitativeMetrics, calculateInsightsAndSuggestions } from './utils/analytics';
import { Auth } from './components/Auth';
import RatingGuide from './components/RatingGuide';
import { Modal } from './components/Modal';
import { ProgressHistory } from './components/ProgressHistory';
import { Analytics } from './components/Analytics';
import { GoalTracking } from './components/GoalTracking';
import { Settings as SettingsComponent } from './components/Settings';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { AccountModal } from './components/AccountModal';
import { UserProvider, useUser } from './context/UserContext';

interface User {
  id: string;
  email: string;
}

interface ProgressEntry {
  date: string;
  health: number;
  mental: number;
  social: number;
  career: number;
  growth: number;
}

// Add these styles for the glowing icons
const iconStyles = {
  health: {
    glow: '#4361ee',
    background: 'rgba(67, 97, 238, 0.15)',
  },
  mental: {
    glow: '#4cc9f0',
    background: 'rgba(76, 201, 240, 0.15)',
  },
  social: {
    glow: '#e63946',
    background: 'rgba(230, 57, 70, 0.15)',
  },
  career: {
    glow: '#f77f00',
    background: 'rgba(247, 127, 0, 0.15)',
  },
  growth: {
    glow: '#2a9d8f',
    background: 'rgba(42, 157, 143, 0.15)',
  },
};

// Global styles with refined UI design specification
const globalStyles = `
:root {
  /* Primary Colors */
  --color-primary: #e35d46;
  --color-primary-hover: #d04b34;
  --color-primary-15: rgba(227, 93, 70, 0.15);
  
  /* Background Colors */
  --color-background: #f5f3ee;
  --color-card: #ffffff;
  
  /* Domain Colors */
  --color-health: #4361ee;
  --color-health-light: rgba(67, 97, 238, 0.15);
  --color-health-glow: rgba(67, 97, 238, 0.3);
  
  --color-mental: #4cc9f0;
  --color-mental-light: rgba(76, 201, 240, 0.15);
  --color-mental-glow: rgba(76, 201, 240, 0.3);
  
  --color-social: #ff8fab;
  --color-social-light: rgba(255, 143, 171, 0.15);
  --color-social-glow: rgba(255, 143, 171, 0.3);
  
  --color-career: #f77f00;
  --color-career-light: rgba(247, 127, 0, 0.15);
  --color-career-glow: rgba(247, 127, 0, 0.3);
  
  --color-growth: #2a9d8f;
  --color-growth-light: rgba(42, 157, 143, 0.15);
  --color-growth-glow: rgba(42, 157, 143, 0.3);
  
  /* Text Colors */
  --color-text: #4a4a4a;
  --color-text-secondary: #6e7173;
  --color-text-tertiary: #8c8f93;
  
  /* Border and Shadow */
  --color-border: rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.08);
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Spacing */
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
}

/* Base Styles */
html, body, #root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: var(--color-text);
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  line-height: 1.5;
  font-size: 16px;
}

/* Create an earthy, warm background with subtle gradients */
body {
  background-image: 
    radial-gradient(at 10% 20%, rgba(227, 93, 70, 0.05) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(255, 228, 205, 0.07) 0px, transparent 50%);
  background-attachment: fixed;
}

main {
  background-color: var(--color-background);
}

/* Card Style */
.card {
  background-color: var(--color-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  transition: box-shadow 0.2s, transform 0.2s;
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

/* Button Styles */
button, .button {
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  outline: none;
}

button:focus, .button:focus {
  outline: 2px solid var(--color-primary-15);
}

.button-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
}

.button-primary:hover {
  background-color: var(--color-primary-hover);
}

.button-secondary {
  background-color: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.button-secondary:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.5em;
  line-height: 1.3;
}

h1 { font-size: 2rem; }
h2 { font-size: 1.5rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.125rem; }

p {
  margin-bottom: 1rem;
  color: var(--color-text-secondary);
}

/* Form Elements */
input, select, textarea {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 0 3px var(--color-primary-15);
}

/* Range Input Styling */
input[type="range"] {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: var(--radius-full);
  background: #e9ecef;
  border: none;
  outline: none;
  transition: all 0.3s;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.3s;
}

input[type="range"]::-moz-range-thumb:hover {
  transform: scale(1.1);
}

/* Domain Specific Utilities */
.health-color { color: var(--color-health); }
.health-bg { background-color: var(--color-health); }
.health-bg-light { background-color: var(--color-health-light); }
.health-glow { box-shadow: 0 0 15px var(--color-health-glow); }

.mental-color { color: var(--color-mental); }
.mental-bg { background-color: var(--color-mental); }
.mental-bg-light { background-color: var(--color-mental-light); }
.mental-glow { box-shadow: 0 0 15px var(--color-mental-glow); }

.social-color { color: var(--color-social); }
.social-bg { background-color: var(--color-social); }
.social-bg-light { background-color: var(--color-social-light); }
.social-glow { box-shadow: 0 0 15px var(--color-social-glow); }

.career-color { color: var(--color-career); }
.career-bg { background-color: var(--color-career); }
.career-bg-light { background-color: var(--color-career-light); }
.career-glow { box-shadow: 0 0 15px var(--color-career-glow); }

.growth-color { color: var(--color-growth); }
.growth-bg { background-color: var(--color-growth); }
.growth-bg-light { background-color: var(--color-growth-light); }
.growth-glow { box-shadow: 0 0 15px var(--color-growth-glow); }

/* Sidebar specific styles */
.sidebar-nav-item {
  transition: all 0.2s ease;
  border-radius: var(--radius-md);
}

.sidebar-nav-item.active {
  background-color: var(--color-primary);
  color: white;
}

.sidebar-nav-item:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.03);
}

/* Animations and Transitions */
.animate-fade {
  animation: fade-in 0.3s ease-in-out;
}

.transition-all {
  transition: all 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Chart Custom Styles */
.recharts-curve.recharts-line-curve {
  stroke-width: 3;
}

.recharts-dot {
  fill: white;
  stroke-width: 2;
}

.recharts-default-tooltip {
  background-color: var(--color-card) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--shadow-md) !important;
  border: 1px solid var(--color-border) !important;
  padding: var(--space-md) !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

/* Dynamic chart animations */
.chart-pulse {
  animation: chart-pulse 1s ease;
}

@keyframes chart-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* Card glow animations */
@keyframes glow-pulse {
  0% { box-shadow: 0 0 5px var(--glow-color, rgba(0, 0, 0, 0.1)); }
  50% { box-shadow: 0 0 20px var(--glow-color, rgba(0, 0, 0, 0.2)); }
  100% { box-shadow: 0 0 5px var(--glow-color, rgba(0, 0, 0, 0.1)); }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Domain card glow effects */
.health-glow {
  --glow-color: var(--color-health-glow);
  box-shadow: 0 0 15px var(--color-health-glow);
  transition: box-shadow 0.3s ease;
}

.mental-glow {
  --glow-color: var(--color-mental-glow);
  box-shadow: 0 0 15px var(--color-mental-glow);
  transition: box-shadow 0.3s ease;
}

.social-glow {
  --glow-color: var(--color-social-glow);
  box-shadow: 0 0 15px var(--color-social-glow);
  transition: box-shadow 0.3s ease;
}

.career-glow {
  --glow-color: var(--color-career-glow);
  box-shadow: 0 0 15px var(--color-career-glow);
  transition: box-shadow 0.3s ease;
}

.growth-glow {
  --glow-color: var(--color-growth-glow);
  box-shadow: 0 0 15px var(--color-growth-glow);
  transition: box-shadow 0.3s ease;
}

/* Dynamic animations */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}

.animate-value-change {
  transition: all 0.5s ease;
}

/* Slider custom styling */
.styled-slider {
  --track-height: 8px;
  
  -webkit-appearance: none;
  appearance: none;
  height: var(--track-height);
  border-radius: calc(var(--track-height) / 2);
  background: linear-gradient(to right, var(--track-color, #e5e7eb) 0%, var(--track-color, #e5e7eb) 100%);
  outline: none;
}

.styled-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--thumb-color, #3b82f6);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.styled-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.styled-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--thumb-color, #3b82f6);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.styled-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
}

/* Dark Mode Theme */
.dark-theme {
  --color-background: #1a1a1a;
  --color-card: #2d2d2d;
  
  --color-text: #e0e0e0;
  --color-text-secondary: #b0b0b0;
  --color-text-tertiary: #909090;
  
  --color-border: rgba(255, 255, 255, 0.1);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.dark-theme .bg-white {
  background-color: var(--color-card) !important;
}

.dark-theme .text-gray-800 {
  color: var(--color-text) !important;
}

.dark-theme .text-gray-700 {
  color: var(--color-text) !important;
}

.dark-theme .text-gray-600 {
  color: var(--color-text-secondary) !important;
}

.dark-theme .text-gray-500 {
  color: var(--color-text-tertiary) !important;
}

.dark-theme .border-gray-200,
.dark-theme .border-gray-100 {
  border-color: var(--color-border) !important;
}

.dark-theme .bg-gray-50,
.dark-theme .bg-gray-100 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.dark-theme .bg-opacity-85 {
  background-color: rgba(45, 45, 45, 0.85) !important;
}

.dark-theme .hover\:bg-gray-100:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.dark-theme .recharts-cartesian-grid-bg {
  fill: rgba(0, 0, 0, 0.2) !important;
}

.dark-theme .recharts-cartesian-grid line {
  stroke: rgba(255, 255, 255, 0.1) !important;
}

.dark-theme .recharts-tooltip-wrapper .recharts-default-tooltip {
  background-color: #3d3d3d !important;
  border-color: #555 !important;
  color: #e0e0e0 !important;
}

.dark-theme input,
.dark-theme select,
.dark-theme textarea {
  background-color: #3d3d3d !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #e0e0e0 !important;
}

/* Add these styles to fix Analytics background in light theme */
.analytics-container, 
.analytics-panel,
.analytics-chart-container {
  background-color: var(--color-card) !important;
  color: var(--color-text) !important;
}

/* Ensure charts respect theme */
.recharts-wrapper,
.recharts-surface {
  background-color: transparent !important;
}

.recharts-cartesian-grid-bg {
  fill: var(--color-background) !important;
}

.recharts-cartesian-grid line {
  stroke: var(--color-border) !important;
}

.recharts-tooltip-wrapper .recharts-default-tooltip {
  background-color: var(--color-card) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
}
`;

function AppContent() {
  const { theme } = useUser();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [entries, setEntries] = useState<ProgressEntry[]>(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) return [];
    
    const userData = JSON.parse(savedUser);
    const savedEntries = localStorage.getItem(`entries_${userData.id}`);
    return savedEntries ? JSON.parse(savedEntries) : [];
  });

  const [formData, setFormData] = useState<Omit<ProgressEntry, 'date'>>({
    health: 5,
    mental: 5,
    social: 5,
    career: 5,
    growth: 5,
  });
  
  // Rating guide modal state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [currentGuideTab, setCurrentGuideTab] = useState('health');

  // Add state for current values
  const [currentValues, setCurrentValues] = useState({
    health: 8.5,
    mental: 6.0,
    social: 6.5,
    career: 7.0,
    growth: 7.5
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'Progress History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'goals', label: 'Goal Tracking', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [user]);

  useEffect(() => {
    if (user && entries.length > 0) {
      localStorage.setItem(`entries_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user]);

  useEffect(() => {
    // Add global styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    const savedEntries = localStorage.getItem(`entries_${userData.id}`);
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  };

  const handleLogout = () => {
    if (user) {
      // Save current entries before logging out
      localStorage.setItem(`entries_${user.id}`, JSON.stringify(entries));
      localStorage.removeItem('currentUser');
    }
    setUser(null);
    setEntries([]);
    setCurrentPage('dashboard');
  };

  const metrics = useMemo(() => 
    calculateQuantitativeMetrics(entries), [entries]
  );

  const insights = useMemo(() => 
    calculateInsightsAndSuggestions(metrics), [metrics]
  );

  // Calculate changes from last entry
  const getChangeFromLastEntry = (domain: keyof typeof currentValues) => {
    if (entries.length < 2) return 0;
    const lastEntry = entries[entries.length - 1];
    const previousEntry = entries[entries.length - 2];
    return lastEntry[domain] - previousEntry[domain];
  };

  // Handle slider changes
  const handleSliderChange = (domain: keyof typeof currentValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValues(prev => ({
      ...prev,
      [domain]: newValue
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newEntry: ProgressEntry = {
      ...currentValues,
      date: new Date().toISOString().split('T')[0]
    };
    
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    
    // Save immediately to localStorage
    localStorage.setItem(`entries_${user.id}`, JSON.stringify(updatedEntries));
  };

  // Open guide for specific category
  const openGuideForCategory = (category: string) => {
    setCurrentGuideTab(category);
    setIsGuideOpen(true);
  };

  const chartColors = {
    health: 'var(--color-primary)',
    mental: 'var(--color-accent)',
    social: 'var(--color-success)',
    career: 'var(--color-warning)',
    growth: 'var(--color-primary-light)',
  };

  const metricsList = [
    { key: 'health', label: 'Physical Health', icon: Activity },
    { key: 'mental', label: 'Mental Wellbeing', icon: Brain },
    { key: 'social', label: 'Social Life', icon: Users },
    { key: 'career', label: 'Career Growth', icon: Briefcase },
    { key: 'growth', label: 'Personal Growth', icon: TrendingUp },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'analytics':
        return <Analytics entries={entries} />;
      case 'history':
        return <ProgressHistory entries={entries} />;
      case 'goals':
        return <GoalTracking entries={entries} />;
      case 'dashboard':
      default:
        return (
          <div className="max-w-[1200px] mx-auto space-y-4 md:space-y-6">
            {/* Page Title */}
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h2>
              <p className="text-[var(--color-text-secondary)]">Track your progress across key life areas</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {renderSummaryCards()}
            </div>

            {/* Progress Chart */}
            <div className="bg-[var(--color-bg-secondary)] rounded-[var(--card-border-radius)] p-6 
              border border-[var(--color-border)] shadow-lg">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Progress Over Time</h3>
              <div className="h-[350px] bg-[var(--color-bg-primary)] rounded-lg p-4">
                <ResponsiveContainer>
                  <LineChart data={entries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-text-secondary)" />
                    <YAxis stroke="var(--color-text-secondary)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--card-border-radius)',
                        boxShadow: '0 2px 8px rgba(194, 90, 58, 0.1)',
                      }}
                    />
                    <Legend />
                    <ReferenceLine y={5} stroke="var(--color-border)" strokeDasharray="3 3" label="Average" />
                    {Object.entries(chartColors).map(([key, color]) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rating Form */}
            {renderRatingForm()}
          </div>
        );
    }
  };

  // Render summary cards
  const renderSummaryCards = () => {
    const domains = [
      { id: 'health', label: 'Physical Health', icon: Activity },
      { id: 'mental', label: 'Mental Wellbeing', icon: Brain },
      { id: 'social', label: 'Social Life', icon: Users }
    ];

    return domains.map((domain, index) => (
      <div 
        key={domain.id} 
        className="bg-white rounded-lg p-6 shadow-sm card-hover summary-card"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center relative"
            style={{
              background: iconStyles[domain.id as keyof typeof iconStyles].background,
              boxShadow: `0 0 20px ${iconStyles[domain.id as keyof typeof iconStyles].glow}40`,
            }}
          >
            {/* Glow effect */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${iconStyles[domain.id as keyof typeof iconStyles].glow}20 0%, transparent 70%)`,
                filter: 'blur(4px)',
              }}
            />
            {/* Icon with reflection */}
            <domain.icon 
              className="w-6 h-6 relative z-10 transition-transform duration-300 hover:scale-110"
              style={{ 
                color: iconStyles[domain.id as keyof typeof iconStyles].glow,
                filter: `drop-shadow(0 0 8px ${iconStyles[domain.id as keyof typeof iconStyles].glow}80)`,
              }} 
            />
          </div>
          <h3 className="text-lg font-semibold">{domain.label}</h3>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-[var(--color-primary)]">
            {currentValues[domain.id as keyof typeof currentValues].toFixed(1)}
          </div>
          <div className={`text-sm ${
            getChangeFromLastEntry(domain.id as keyof typeof currentValues) >= 0 
              ? 'text-[var(--color-success)]' 
              : 'text-[var(--color-error)]'
          }`}>
            {getChangeFromLastEntry(domain.id as keyof typeof currentValues) >= 0 ? '+' : ''}
            {getChangeFromLastEntry(domain.id as keyof typeof currentValues).toFixed(1)} from last entry
          </div>
        </div>
      </div>
    ));
  };

  // Render rating form
  const renderRatingForm = () => {
    const domains = [
      { id: 'health', label: 'Physical Health', icon: Activity },
      { id: 'mental', label: 'Mental Wellbeing', icon: Brain },
      { id: 'social', label: 'Social Life', icon: Users },
      { id: 'career', label: 'Career Growth', icon: Briefcase },
      { id: 'growth', label: 'Personal Growth', icon: TrendingUp }
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold mb-6">Rate Your Progress Today</h3>
          <div className="space-y-6">
            {domains.map(domain => (
              <div key={domain.id} className="space-y-2">
                <label className="flex items-center gap-2 text-[var(--color-text-primary)]">
                  <div className="relative">
                    <domain.icon 
                      className="w-5 h-5 transition-transform duration-300 hover:scale-110"
                      style={{ 
                        color: iconStyles[domain.id as keyof typeof iconStyles].glow,
                        filter: `drop-shadow(0 0 6px ${iconStyles[domain.id as keyof typeof iconStyles].glow}60)`,
                      }} 
                    />
                    {/* Subtle glow effect */}
                    <div
                      className="absolute inset-0 -z-10"
                      style={{
                        background: `radial-gradient(circle at center, ${iconStyles[domain.id as keyof typeof iconStyles].glow}20 0%, transparent 70%)`,
                        filter: 'blur(3px)',
                      }}
                    />
                  </div>
                  {domain.label}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={currentValues[domain.id as keyof typeof currentValues]}
                    onChange={handleSliderChange(domain.id as keyof typeof currentValues)}
                    className="flex-1"
                  />
                  <span className="w-12 text-right font-semibold">
                    {currentValues[domain.id as keyof typeof currentValues].toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-[var(--color-primary)] text-white rounded-full hover:bg-[var(--color-primary-light)] transition-all duration-300"
            >
              Save Progress
            </button>
          </div>
        </div>
      </form>
    );
  };

  return (
    <div className={`flex min-h-screen bg-[var(--color-background)] ${theme}-theme`}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics entries={entries} />} />
          <Route path="/goals" element={<GoalTracking entries={entries} />} />
          <Route path="/settings" element={<SettingsComponent />} />
        </Routes>
      </main>
      <AccountModal />
      {/* Rating Guide Modal */}
      <Modal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)}>
        <RatingGuide initialTab={currentGuideTab} onClose={() => setIsGuideOpen(false)} />
      </Modal>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Add global styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;