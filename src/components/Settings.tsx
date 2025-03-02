import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Bell, Moon, Sun, Database, Shield, LogOut, 
  Camera, Check, X, Save, ArrowRight, Zap, 
  Sliders, Mail, AlertTriangle, HelpCircle,
  Activity, Brain, Users, Briefcase, Star
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

// Domain configuration for consistent styling
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

type SectionRefs = {
  profile: React.RefObject<HTMLDivElement>;
  notifications: React.RefObject<HTMLDivElement>;
  appearance: React.RefObject<HTMLDivElement>;
  domains: React.RefObject<HTMLDivElement>;
  data: React.RefObject<HTMLDivElement>;
  account: React.RefObject<HTMLDivElement>;
};

type DomainKey = keyof typeof DOMAIN_CONFIG;

type DomainPreferences = {
  [K in DomainKey]: boolean;
};

type Settings = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReports: boolean;
  reminderTime: string;
  dataPrivacy: string;
  domainPreferences: DomainPreferences;
};

type IconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
  style?: React.CSSProperties;
};

export function Settings() {
  const { theme, setTheme, profile, updateProfile, setShowAccountModal, signOut } = useUser();
  const navigate = useNavigate();
  
  // State for settings
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    reminderTime: '20:00',
    dataPrivacy: 'private',
    domainPreferences: {
      health: true,
      mental: true,
      social: true,
      career: true,
      growth: true
    }
  });
  
  // Animation and UI states
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [animateSection, setAnimateSection] = useState<string | null>(null);
  
  // Refs for animations
  const sectionRefs: SectionRefs = {
    profile: useRef<HTMLDivElement>(null),
    notifications: useRef<HTMLDivElement>(null),
    appearance: useRef<HTMLDivElement>(null),
    domains: useRef<HTMLDivElement>(null),
    data: useRef<HTMLDivElement>(null),
    account: useRef<HTMLDivElement>(null)
  };
  
  // Add this to your component
  const signOutButtonRef = useRef(null);
  
  // Add this effect to your component
  useEffect(() => {
    // This will run after the component mounts
    console.log("Setting up direct event listener");
    
    // Wait a bit to ensure the DOM is fully rendered
    setTimeout(() => {
      // Find the button using a data attribute
      const signOutButton = document.querySelector('button[data-testid="sign-out-button"]');
      
      if (signOutButton) {
        console.log("Found sign out button:", signOutButton);
        
        // Add a direct DOM event listener
        signOutButton.addEventListener('click', function(e) {
          console.log("Sign out button clicked via direct DOM listener");
          e.preventDefault();
          e.stopPropagation();
          
          // Clear storage and redirect
          localStorage.clear();
          window.location.href = '/';
        });
      } else {
        console.error("Could not find sign out button in DOM");
      }
    }, 1000);
  }, []);
  
  // Handle navigation to sections with animation
  const navigateToSection = (section: keyof SectionRefs) => {
    setActiveSection(section);
    setAnimateSection(section);
    
    setTimeout(() => {
      setAnimateSection(null);
    }, 700);
    
    // Scroll to section on mobile
    if (window.innerWidth < 768) {
      sectionRefs[section]?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  
  // Handle profile update
  const handleProfileUpdate = (field: string, value: string) => {
    updateProfile({
      [field]: value
    });
  };
  
  // Handle settings update
  const updateSetting = (field: string, value: any) => {
    setSettings({
      ...settings,
      [field]: value
    });
  };
  
  // Toggle domain preference
  const toggleDomain = (domain: DomainKey) => {
    setSettings({
      ...settings,
      domainPreferences: {
        ...settings.domainPreferences,
        [domain]: !settings.domainPreferences[domain]
      }
    });
  };
  
  // Save all settings
  const saveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedMessage(true);
      
      // Hide saved message after 3 seconds
      setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
      
      // Save settings to localStorage
      localStorage.setItem('settings', JSON.stringify(settings));
    }, 1200);
  };
  
  const handleSignOut = () => {
    // Clear user data from context
    signOut();
    
    // Clear localStorage
    localStorage.removeItem('userData');
    localStorage.removeItem('userSettings');
    localStorage.removeItem('progressEntries');
    
    // Navigate to home or login page
    navigate('/');
    
    // Reload to ensure clean state (optional)
    // window.location.reload();
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-gray-100 sticky top-6">
            <nav className="space-y-1">
              <button
                onClick={() => navigateToSection('profile')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors
                        ${activeSection === 'profile' 
                          ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]'
                          : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <User className="w-5 h-5 mr-3" />
                <span>Profile</span>
              </button>
              
              <button
                onClick={() => navigateToSection('notifications')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors
                        ${activeSection === 'notifications' 
                          ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]'
                          : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Bell className="w-5 h-5 mr-3" />
                <span>Notifications</span>
              </button>
              
              <button
                onClick={() => navigateToSection('appearance')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors
                        ${activeSection === 'appearance' 
                          ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]'
                          : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Sliders className="w-5 h-5 mr-3" />
                <span>Appearance</span>
              </button>
              
              <button
                onClick={() => navigateToSection('domains')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors
                        ${activeSection === 'domains' 
                          ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]'
                          : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Zap className="w-5 h-5 mr-3" />
                <span>Domains</span>
              </button>
              
              <button
                onClick={() => navigateToSection('data')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors
                        ${activeSection === 'data' 
                          ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]'
                          : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Database className="w-5 h-5 mr-3" />
                <span>Data Management</span>
              </button>
              
              <button
                onClick={() => navigateToSection('account')}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors
                        ${activeSection === 'account' 
                          ? 'bg-[var(--color-primary-15)] text-[var(--color-primary)]'
                          : 'text-gray-700 hover:bg-gray-100'}`}
              >
                <Shield className="w-5 h-5 mr-3" />
                <span>Account</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Profile Section */}
          <div 
            ref={sectionRefs.profile}
            className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100
                      ${animateSection === 'profile' ? 'animate-pulse' : ''}`}
            style={{ display: activeSection === 'profile' ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Your Profile</h2>
              <div className="text-sm text-gray-500">Manage your personal information</div>
            </div>
            
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt={profile?.name || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-3xl font-semibold text-gray-400">
                      {profile?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profile?.name || ''} 
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={profile?.email || ''} 
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea 
                      value={profile?.bio || ''} 
                      onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Notifications Section */}
          <div 
            ref={sectionRefs.notifications}
            className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100
                      ${animateSection === 'notifications' ? 'animate-pulse' : ''}`}
            style={{ display: activeSection === 'notifications' ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
              <div className="text-sm text-gray-500">Manage how you receive notifications</div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-700 font-medium">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive weekly summaries and important updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.emailNotifications} 
                    onChange={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-700 font-medium">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive daily reminders to track your progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.pushNotifications} 
                    onChange={() => updateSetting('pushNotifications', !settings.pushNotifications)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-700 font-medium">Weekly Reports</h3>
                  <p className="text-sm text-gray-500">Receive detailed weekly progress reports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settings.weeklyReports} 
                    onChange={() => updateSetting('weeklyReports', !settings.weeklyReports)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                </label>
              </div>
              
              <div>
                <h3 className="text-gray-700 font-medium mb-2">Daily Reminder Time</h3>
                <input 
                  type="time" 
                  value={settings.reminderTime} 
                  onChange={(e) => updateSetting('reminderTime', e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                />
              </div>
            </div>
          </div>
          
          {/* Appearance Section */}
          <div 
            ref={sectionRefs.appearance}
            className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100
                      ${animateSection === 'appearance' ? 'animate-pulse' : ''}`}
            style={{ display: activeSection === 'appearance' ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Appearance</h2>
              <div className="text-sm text-gray-500">Customize your experience</div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-700 font-medium mb-3">Theme</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="theme" 
                      value="light"
                      checked={theme === 'light'}
                      onChange={() => setTheme('light')}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <Sun className="w-5 h-5 mr-2 text-amber-500" />
                      <span>Light</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="theme" 
                      value="dark"
                      checked={theme === 'dark'}
                      onChange={() => setTheme('dark')}
                      className="mr-2"
                    />
                    <div className="flex items-center">
                      <Moon className="w-5 h-5 mr-2 text-indigo-400" />
                      <span>Dark</span>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Theme preview cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg border ${theme === 'light' ? 'border-[var(--color-primary)]' : 'border-gray-200'} shadow-sm bg-white`}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Light Theme</h4>
                  <div className="h-20 rounded-md bg-gray-50 border border-gray-100"></div>
                </div>
                
                <div className={`p-4 rounded-lg border ${theme === 'dark' ? 'border-[var(--color-primary)]' : 'border-gray-200'} shadow-sm bg-gray-800`}>
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Dark Theme</h4>
                  <div className="h-20 rounded-md bg-gray-700 border border-gray-600"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Domains Section */}
          <div 
            ref={sectionRefs.domains}
            className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100
                      ${animateSection === 'domains' ? 'animate-pulse' : ''}`}
            style={{ display: activeSection === 'domains' ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Domain Preferences</h2>
              <div className="text-sm text-gray-500">Manage which life domains to track</div>
            </div>
            
            <div className="space-y-4">
              {Object.entries(DOMAIN_CONFIG).map(([domain, config]) => (
                <div key={domain} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${config.iconBgColor}` }}>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'white' }}>
                      <config.icon className="w-5 h-5" style={{ color: config.color }} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium" style={{ color: config.color }}>{config.label}</h3>
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={settings.domainPreferences[domain as DomainKey]} 
                      onChange={() => toggleDomain(domain as DomainKey)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"
                         style={{ backgroundColor: settings.domainPreferences[domain as DomainKey] ? config.color : 'rgba(0,0,0,0.1)' }}></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Data Management Section */}
          <div 
            ref={sectionRefs.data}
            className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100
                      ${animateSection === 'data' ? 'animate-pulse' : ''}`}
            style={{ display: activeSection === 'data' ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Data Management</h2>
              <div className="text-sm text-gray-500">Manage your data and privacy</div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-gray-700 font-medium mb-3">Privacy Level</h3>
                <select 
                  value={settings.dataPrivacy} 
                  onChange={(e) => updateSetting('dataPrivacy', e.target.value)}
                  className="w-full md:w-auto p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-colors"
                >
                  <option value="private">Private (local device only)</option>
                  <option value="cloud">Cloud Synced (encrypted)</option>
                  <option value="anonymous">Anonymous Sharing (for research)</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-5 h-5 mr-2 text-gray-700" />
                  <span>Export All Data</span>
                </button>
                
                <button className="flex items-center justify-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Upload className="w-5 h-5 mr-2 text-gray-700" />
                  <span>Import Data</span>
                </button>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <button 
                  ref={signOutButtonRef}
                  onClick={handleSignOut}
                  data-testid="sign-out-button"
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span>Delete All Data</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Account Section */}
          <div 
            ref={sectionRefs.account}
            className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100
                      ${animateSection === 'account' ? 'animate-pulse' : ''}`}
            style={{ display: activeSection === 'account' ? 'block' : 'none' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Account</h2>
              <div className="text-sm text-gray-500">Manage your account settings</div>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-600 flex items-start">
                <HelpCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  Your account is currently using local storage only. Sign up for an account to sync your data across devices.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-gray-700 font-medium">Account Actions</h3>
                <div className="space-y-2">
                  <button 
                    className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors w-full md:w-auto"
                    onClick={() => setShowAccountModal(true)}
                  >
                    <User className="w-5 h-5 mr-2" />
                    <span>Create Account</span>
                  </button>
                  
                  <button 
                    onClick={handleSignOut}
                    data-testid="sign-out-button"
                    className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">
                  Account created on: January 15, 2023
                </p>
                <p className="text-sm text-gray-500">
                  App version: 1.0.0
                </p>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="sticky bottom-6 bg-white bg-opacity-90 backdrop-blur-sm p-4 rounded-xl shadow-md border border-gray-100 flex justify-between items-center">
            {showSavedMessage && (
              <div className="animate-fade-in text-green-600 bg-green-50 px-3 py-1 rounded-lg flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Settings saved successfully!
              </div>
            )}
            
            <div className="flex-1"></div>
            
            <button
              onClick={saveSettings}
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
                <div className="flex items-center">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Download(props: IconProps) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  );
}

function Upload(props: IconProps) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );
} 