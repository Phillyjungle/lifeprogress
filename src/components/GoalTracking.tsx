import React, { useState } from 'react';
import { Target, Clock, CheckCircle, AlertTriangle, Plus, ChevronRight, Trophy } from 'lucide-react';
import { ProgressEntry } from '../types';

interface Goal {
  id: string;
  domain: string;
  title: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  type: 'improvement' | 'habit' | 'milestone' | 'balance';
  steps: {
    id: string;
    description: string;
    completed: boolean;
  }[];
  createdAt: string;
  status: 'on_track' | 'needs_attention' | 'completed' | 'at_risk';
}

interface GoalTrackingProps {
  entries: ProgressEntry[];
}

export function GoalTracking({ entries }: GoalTrackingProps) {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedGoals = localStorage.getItem('goals');
    return savedGoals ? JSON.parse(savedGoals) : [];
  });
  const [showNewGoalForm, setShowNewGoalForm] = useState(false);

  const domains = [
    { id: 'health', label: 'Physical Health', color: 'var(--color-primary)' },
    { id: 'mental', label: 'Mental Wellbeing', color: 'var(--color-accent)' },
    { id: 'social', label: 'Social Life', color: 'var(--color-success)' },
    { id: 'career', label: 'Career Growth', color: 'var(--color-warning)' },
    { id: 'growth', label: 'Personal Growth', color: 'var(--color-primary-light)' },
  ];

  const calculateProgress = (goal: Goal) => {
    const progress = (goal.currentValue / goal.targetValue) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'on_track':
        return <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />;
      case 'needs_attention':
        return <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />;
      case 'at_risk':
        return <AlertTriangle className="w-5 h-5 text-[var(--color-error)]" />;
      case 'completed':
        return <Trophy className="w-5 h-5 text-[var(--color-primary)]" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Goal Tracking</h2>
          <p className="text-[var(--color-text-secondary)]">Set and monitor your progress goals</p>
        </div>
        <button
          onClick={() => setShowNewGoalForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-full
            hover:bg-[var(--color-primary-light)] transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          New Goal
        </button>
      </div>

      {/* Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map(domain => (
          <div
            key={domain.id}
            className="bg-[var(--color-bg-secondary)] rounded-[var(--card-border-radius)] p-6 
              border border-[var(--color-border)] shadow-lg"
          >
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">{domain.label}</h3>
            <div className="space-y-4">
              {goals.filter(g => g.domain === domain.id).map(goal => (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(goal.status)}
                      <span className="font-medium">{goal.title}</span>
                    </div>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {goal.currentValue}/{goal.targetValue}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)]"
                      style={{ width: `${calculateProgress(goal)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                    <span>{calculateProgress(goal).toFixed(0)}% Complete</span>
                    <span>{new Date(goal.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {goals.filter(g => g.domain === domain.id).length === 0 && (
                <p className="text-center text-[var(--color-text-secondary)] py-4">
                  No goals set for this domain
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Active Goals */}
      <div className="bg-[var(--color-bg-secondary)] rounded-[var(--card-border-radius)] p-6 
        border border-[var(--color-border)] shadow-lg">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Active Goals</h3>
        <div className="space-y-4">
          {goals.map(goal => (
            <div
              key={goal.id}
              className="p-4 bg-[var(--color-bg-primary)] rounded-lg hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Target className="w-5 h-5 text-[var(--color-primary)]" />
                  <div>
                    <h4 className="font-medium">{goal.title}</h4>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {domains.find(d => d.id === goal.domain)?.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-text-secondary)]" />
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  {getStatusIcon(goal.status)}
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)]"
                    style={{ width: `${calculateProgress(goal)}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">
                    {goal.steps.filter(s => s.completed).length}/{goal.steps.length} steps completed
                  </span>
                  <button className="text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          {/* Add your new goal form here */}
        </div>
      )}
    </div>
  );
} 