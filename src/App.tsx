import React, { useState, useMemo, useEffect } from 'react';
import { Activity, Brain, Users, Briefcase, TrendingUp, AlertTriangle, HelpCircle, LogOut, 
  LayoutDashboard, History, BarChart2, Target, Settings, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DomainData } from './types/analytics';
import { generateSampleData } from './utils/analyticsUtils';
import { Auth } from './components/Auth';
import RatingGuide from './components/RatingGuide';
import { Modal } from './components/Modal';
import { ProgressHistory } from './components/ProgressHistory';
import { Analytics } from './components/Analytics';
import { GoalTracking } from './components/GoalTracking';
import { Settings as SettingsComponent } from './components/Settings';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { AccountModal } from './components/AccountModal';
import { UserProvider, useUser } from './context/UserContext';
import { LandingPage } from './components/LandingPage';
import { SubscriptionUpgrade } from './components/SubscriptionUpgrade';
import { PremiumAnalytics } from './components/PremiumAnalytics';

interface User {
  id: string;
  email: string;
}

// Define ProgressEntry to include both DomainData and specific required fields
interface ProgressEntry {
  date: string;
  timestamp: string;
  health: number;
  mental: number;
  social: number;
  career: number;
  growth: number;
  [key: string]: number | string; // Allow additional string-indexed fields
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

function MainAppLayout({ entries }: { entries: ProgressEntry[] }) {
  const { theme } = useUser();
  
  return (
    <div className={`flex min-h-screen bg-[var(--color-background)] ${theme}-theme`}>
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics entries={entries} />} />
          <Route path="/goals" element={<GoalTracking entries={entries} />} />
          <Route path="/settings" element={<SettingsComponent />} />
          <Route path="/subscription" element={<SubscriptionUpgrade />} />
          <Route path="/premium-features" element={<PremiumAnalytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <AccountModal />
    </div>
  );
}

function AppContent() {
  const { user } = useUser();
  const [entries, setEntries] = useState<ProgressEntry[]>(() => {
    const savedEntries = localStorage.getItem('progressEntries');
    if (savedEntries) {
      return JSON.parse(savedEntries);
    }
    // Generate sample data if no entries exist
    const sampleData = generateSampleData();
    localStorage.setItem('progressEntries', JSON.stringify(sampleData));
    return sampleData;
  });

  // Add global styles
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <Routes>
      <Route path="/*" element={
        user ? <MainAppLayout entries={entries} /> : <LandingPage />
      } />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;