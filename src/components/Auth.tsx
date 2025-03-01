import React, { useState } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthProps {
  onLogin: (userData: User) => void;
}

export function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '{}');
    let userData: User;
    
    if (existingUsers[email]) {
      // If user exists, use their existing ID
      userData = existingUsers[email];
    } else {
      // If new user, create new ID
      userData = {
        id: Date.now().toString(),
        email: email
      };
      // Save to users registry
      existingUsers[email] = userData;
      localStorage.setItem('users', JSON.stringify(existingUsers));
    }
    
    // Save current user
    localStorage.setItem('currentUser', JSON.stringify(userData));
    onLogin(userData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <div className="w-full max-w-md bg-[var(--color-bg-secondary)] rounded-[var(--card-border-radius)] p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-6">Life Progress Tracker</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[var(--color-text-secondary)] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-[var(--input-border-radius)] border border-[var(--color-border)]
                focus:outline-none focus:border-[var(--color-primary)]"
              placeholder="Enter your email"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-[var(--color-primary)] text-[var(--color-text-light)] 
              rounded-[var(--button-border-radius)] hover:bg-[var(--color-primary-light)]
              transition-colors duration-300"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}