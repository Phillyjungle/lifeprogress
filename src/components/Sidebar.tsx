import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, BarChart2, Target, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useUser } from '../context/UserContext';

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
  background: linear-gradient(90deg, #e35d46, #f77f00);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
`;

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { profile } = useUser();
  
  // Check if the current path matches the given path
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Navigation items with icons
  const navItems = [
    { 
      title: 'Dashboard', 
      path: '/', 
      icon: Home 
    },
    { 
      title: 'Analytics', 
      path: '/analytics', 
      icon: BarChart2 
    },
    { 
      title: 'Goal Tracking', 
      path: '/goals', 
      icon: Target 
    },
    { 
      title: 'Settings', 
      path: '/settings', 
      icon: Settings 
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
    
      {/* Sidebar for both mobile and desktop */}
      <div 
        className={`
          fixed md:static top-0 left-0 z-40 h-screen 
          bg-white shadow-md md:shadow-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-64 flex-shrink-0 overflow-y-auto
        `}
      >
        {/* Brand/Logo */}
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Life Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Track your progress</p>
        </div>
        
        {/* Navigation */}
        <nav className="mt-6">
          <ul className="space-y-2 px-3">
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
                    <span className="ml-3">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Bottom section - can contain profile, logout, etc */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--color-primary-15)] flex items-center justify-center text-[var(--color-primary)] font-medium">
                JC
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{profile.name}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile - closes sidebar when clicking outside */}
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