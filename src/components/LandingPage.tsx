import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Brain, Users, Briefcase, Star } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { Auth } from './Auth';

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Redirect to dashboard if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:from-[#1a1b1e] dark:to-[#2c2e33]">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-[#4361ee10] rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-[#4cc9f010] rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            Life Progress Tracker
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Track and visualize your personal growth across multiple life domains
          </p>
        </div>

        {/* Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {[
            { icon: Activity, label: 'Physical Health', color: '#4361ee' },
            { icon: Brain, label: 'Mental Wellbeing', color: '#4cc9f0' },
            { icon: Users, label: 'Social Life', color: '#ff8fab' },
            { icon: Briefcase, label: 'Career Growth', color: '#f77f00' },
            { icon: Star, label: 'Personal Growth', color: '#2a9d8f' },
          ].map(({ icon: Icon, label, color }) => (
            <div 
              key={label}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200"
              style={{ borderTop: `3px solid ${color}` }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: `${color}20` }}
              >
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {label}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track your progress and set goals
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="space-x-4">
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
              className="px-6 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <Auth 
              mode={authMode} 
              onClose={() => setShowAuthModal(false)}
              onSuccess={() => {
                setShowAuthModal(false);
                navigate('/');
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 