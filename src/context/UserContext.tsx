import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define types for our context data
type Theme = 'light' | 'dark';
type SubscriptionTier = 'free' | 'premium';

interface UserProfile {
  name: string;
  email: string;
  avatar: string | null;
  bio: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: string | null;
  features: string[];
}

interface UserContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  showAccountModal: boolean;
  setShowAccountModal: (show: boolean) => void;
  signIn: (userData: any) => void;
  signOut: () => void;
  user: any;
  toggleTheme: () => void;
  // Subscription-related functions
  isPremium: () => boolean;
  hasFeature: (featureName: string) => boolean;
  upgradeSubscription: (tier: SubscriptionTier) => Promise<boolean>;
  mockStripeCheckout: (tier: SubscriptionTier) => Promise<boolean>;
}

// Create the context with default values
const UserContext = createContext<UserContextType>({
  theme: 'light',
  setTheme: () => {},
  profile: {
    name: 'John Coleman',
    email: 'jaquayviuscoleman1@gmail.com',
    avatar: null,
    bio: 'Passionate about personal growth and tracking my life journey.',
    subscriptionTier: 'free',
    subscriptionExpiresAt: null,
    features: ['basic_tracking', 'basic_analytics']
  },
  updateProfile: () => {},
  showAccountModal: false,
  setShowAccountModal: () => {},
  signIn: () => {},
  signOut: () => {},
  user: null,
  toggleTheme: () => {},
  isPremium: () => false,
  hasFeature: () => false,
  upgradeSubscription: async () => false,
  mockStripeCheckout: async () => false
});

// Custom hook for using the context
export const useUser = () => useContext(UserContext);

// Feature definitions for different subscription tiers
const SUBSCRIPTION_FEATURES = {
  free: [
    'basic_tracking',
    'basic_analytics',
    'basic_goals'
  ],
  premium: [
    'basic_tracking',
    'basic_analytics',
    'basic_goals',
    'advanced_analytics',
    'advanced_goals',
    'data_export',
    'custom_domains',
    'priority_support'
  ]
};

// Mock Stripe prices (for development only)
const MOCK_PRICES = {
  premium: {
    monthly: 'price_mock_premium_monthly',
    yearly: 'price_mock_premium_yearly'
  }
};

// Provider component
export const UserProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setThemeState] = useState<Theme>('light');
  const navigate = useNavigate();
  
  // Load user data from localStorage on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    
    // Load theme preference
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setThemeState(storedTheme as Theme);
      document.documentElement.classList.toggle('dark-theme', storedTheme === 'dark');
    }
  }, []);
  
  // Save profile changes to localStorage
  useEffect(() => {
    localStorage.setItem('userData', JSON.stringify(user));
  }, [user]);
  
  // Set theme with local storage persistence
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${theme}-theme`);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Update profile with partial data
  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates
      };
    });
  };
  
  // Sign in function
  const signIn = (userData: any) => {
    const userWithSubscription = {
      ...userData,
      subscriptionTier: 'free',
      subscriptionExpiresAt: null,
      features: SUBSCRIPTION_FEATURES.free
    };
    setUser(userWithSubscription);
    localStorage.setItem('userData', JSON.stringify(userWithSubscription));
  };
  
  // Sign out function with redirection
  const signOut = () => {
    setUser(null);
    // Don't clear theme preference on logout
    // Only clear user-specific data
    localStorage.removeItem('userData');
    localStorage.removeItem('progressEntries');
    // Redirect to landing page
    navigate('/landing');
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark-theme', newTheme === 'dark');
  };
  
  // Subscription-related functions
  const isPremium = () => {
    return user?.subscriptionTier === 'premium';
  };

  const hasFeature = (featureName: string) => {
    return user?.features?.includes(featureName) || false;
  };

  // Mock function to simulate Stripe checkout
  const mockStripeCheckout = async (tier: SubscriptionTier): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 90% success rate
    const success = Math.random() < 0.9;
    
    if (success) {
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      
      updateProfile({
        subscriptionTier: tier,
        subscriptionExpiresAt: oneMonthFromNow.toISOString(),
        features: SUBSCRIPTION_FEATURES[tier]
      });
    }
    
    return success;
  };

  // Function to upgrade subscription
  const upgradeSubscription = async (tier: SubscriptionTier): Promise<boolean> => {
    try {
      // In a real app, this would create a Stripe Checkout session
      const success = await mockStripeCheckout(tier);
      return success;
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
      return false;
    }
  };
  
  // Context value
  const value: UserContextType = {
    theme: theme,
    setTheme: setThemeState,
    profile: user as UserProfile,
    updateProfile,
    showAccountModal: false,
    setShowAccountModal: () => {},
    signIn,
    signOut,
    user: user,
    toggleTheme,
    isPremium,
    hasFeature,
    upgradeSubscription,
    mockStripeCheckout
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}; 