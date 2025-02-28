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

function App() {
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

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-[var(--color-primary)]">
            Life Progress Tracker
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-300 nav-item
                ${currentPage === id 
                  ? 'bg-[var(--color-primary)] text-[var(--color-text-light)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-15)]'
                }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-20 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)] px-6 flex items-center justify-end gap-4">
          <button className="button-hover flex items-center gap-2 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-full hover:bg-[var(--color-primary-15)]">
            <HelpCircle className="w-4 h-4" />
            Rating Guide
          </button>
          <span className="text-[var(--color-text-secondary)]">{user.email}</span>
          <button 
            onClick={handleLogout}
            className="button-hover flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-light)] rounded-full hover:bg-[var(--color-primary-light)]"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </header>

        <main className="flex-1 p-6 bg-[var(--color-bg-primary)] overflow-y-auto">
          <div className="max-w-7xl mx-auto page-transition">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Rating Guide Modal */}
      <Modal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)}>
        <RatingGuide initialTab={currentGuideTab} onClose={() => setIsGuideOpen(false)} />
      </Modal>
    </div>
  );
}

export default App;