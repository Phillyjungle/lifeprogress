import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { X } from 'lucide-react';

interface AuthProps {
  mode?: 'login' | 'signup';
  onClose?: () => void;
  onSuccess?: () => void;
}

export function Auth({ mode = 'login', onClose, onSuccess }: AuthProps) {
  const { signIn } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple validation
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      // In a real app, you would make an API call here
      // For demo purposes, we'll just simulate a successful login/signup
      const userData = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: null,
        bio: ''
      };

      signIn(userData);
      onSuccess?.();
    } catch (err) {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        {mode === 'login' ? 'Welcome Back' : 'Create Account'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:bg-gray-700 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:bg-gray-700 dark:text-white"
            placeholder="Enter your password"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {mode === 'login' ? 'Log In' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}