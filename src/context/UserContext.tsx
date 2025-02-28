import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for our context data
type Theme = 'light' | 'dark';

interface UserProfile {
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
}

interface UserContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  showAccountModal: boolean;
  setShowAccountModal: (show: boolean) => void;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  theme: 'light',
  setTheme: () => {},
  profile: {
    name: 'John Coleman',
    email: 'jaquayviuscoleman1@gmail.com',
    avatar: null,
    bio: 'Passionate about personal growth and tracking my life journey.'
  },
  updateProfile: () => {},
  showAccountModal: false,
  setShowAccountModal: () => {}
});

// Custom hook for using the context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Load initial state from localStorage if available
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
  });
  
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
      name: 'John Coleman',
      email: 'jaquayviuscoleman1@gmail.com',
      avatar: null,
      bio: 'Passionate about personal growth and tracking my life journey.'
    };
  });
  
  const [showAccountModal, setShowAccountModal] = useState(false);
  
  // Apply theme to document when theme changes
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Save profile changes to localStorage
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);
  
  // Set theme with local storage persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // Update profile with partial data
  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Context value
  const value = {
    theme,
    setTheme,
    profile,
    updateProfile,
    showAccountModal,
    setShowAccountModal
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 