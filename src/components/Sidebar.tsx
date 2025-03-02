import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, BarChart2, Target, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import {
  LayoutDashboard,
  Crown,
  Zap
} from 'lucide-react';

// Add CSS for the background pattern and styling
const sidebarStyles = `
.sidebar-bg {
  background-color: #f8f9fa;
  background-image: 
    radial-gradient(at 10% 20%, rgba(255, 228, 230, 0.2) 0px, transparent 50%),
    radial-gradient(at 90% 80%, rgba(198, 246, 255, 0.2) 0px, transparent 50%);
}

.nav-link {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.nav-link.active {
  background-color: rgba(227, 93, 70, 0.1);
  color: #e35d46;
  font-weight: 500;
}

.nav-link:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.05);
}

.app-title {
  position: relative;
  display: inline-block;
  color: #2ecc71; /* Green text color */
  font-weight: bold;
  text-shadow: 0 0 10px rgba(46, 204, 113, 0.3); /* Subtle green glow */
  transition: all 0.3s ease;
}

.app-title:hover {
  text-shadow: 0 0 15px rgba(46, 204, 113, 0.5); /* Enhanced glow on hover */
}

.header-container {
  background-color: rgba(46, 204, 113, 0.1); /* Very light green background */
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.header-container:hover {
  background-color: rgba(46, 204, 113, 0.15); /* Slightly darker on hover */
}
`;

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { profile, isPremium } = useUser();
  
  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation items with icons
  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/'
    },
    {
      label: 'Analytics',
      icon: BarChart2,
      path: '/analytics'
    },
    {
      label: 'Goals',
      icon: Target,
      path: '/goals'
    },
    {
      label: 'Premium Features',
      icon: Crown,
      path: '/premium-features',
      highlight: !isPremium()
    },
    {
      label: 'Subscription',
      icon: Zap,
      path: '/subscription'
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings'
    }
  ];

  // Add the styles to the document
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = sidebarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>
    
      {/* Sidebar Container */}
      <div 
        className={`
          fixed md:static top-0 left-0 z-40
          h-screen w-64 flex flex-col
          bg-white shadow-md md:shadow-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header Section */}
        <div className="p-6">
          <div className="header-container">
            <h1 className="text-xl font-bold text-gray-800 app-title">Life Tracker</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Track your progress</p>
        </div>
        
        {/* Navigation Section - with flex-grow to push profile to bottom */}
        <nav className="flex-grow overflow-y-auto px-3">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${active 
                        ? 'bg-[var(--color-primary)] text-white font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon 
                      className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500'}`} 
                    />
                    <span className="ml-3">{item.label}</span>
                    {item.highlight && (
                      <span className="ml-auto text-xs font-medium text-[var(--color-primary)]">
                        Upgrade
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Profile Section - now properly spaced from navigation */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary-15)] flex items-center justify-center text-[var(--color-primary)] font-medium">
              {profile?.name?.charAt(0) || 'G'}
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {profile?.name || 'Guest'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {profile?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar; 