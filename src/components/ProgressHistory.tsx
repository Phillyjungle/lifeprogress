import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ProgressEntry } from '../types';

interface ProgressHistoryProps {
  entries: ProgressEntry[];
}

export function ProgressHistory({ entries }: ProgressHistoryProps) {
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Progress History</h2>
        <p className="text-[var(--color-text-secondary)]">View your past progress entries</p>
      </div>

      <div className="bg-[var(--color-bg-secondary)] rounded-[var(--card-border-radius)] p-6 
        border border-[var(--color-border)] shadow-lg">
        {sortedEntries.length === 0 ? (
          <p className="text-center text-[var(--color-text-secondary)] py-8">
            No entries yet. Start tracking your progress!
          </p>
        ) : (
          <div className="space-y-4">
            {sortedEntries.map((entry, index) => (
              <div 
                key={entry.date + index}
                className="border-b border-[var(--color-border)] last:border-0 pb-4 last:pb-0"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                  <span className="font-medium text-[var(--color-text-primary)]">
                    {format(new Date(entry.date), 'MMMM d, yyyy')}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-[var(--color-bg-primary)] rounded-lg">
                    <span>Physical Health</span>
                    <span className="font-semibold text-[var(--color-primary)]">{entry.health}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--color-bg-primary)] rounded-lg">
                    <span>Mental Wellbeing</span>
                    <span className="font-semibold text-[var(--color-primary)]">{entry.mental}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--color-bg-primary)] rounded-lg">
                    <span>Social Life</span>
                    <span className="font-semibold text-[var(--color-primary)]">{entry.social}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--color-bg-primary)] rounded-lg">
                    <span>Career Growth</span>
                    <span className="font-semibold text-[var(--color-primary)]">{entry.career}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[var(--color-bg-primary)] rounded-lg">
                    <span>Personal Growth</span>
                    <span className="font-semibold text-[var(--color-primary)]">{entry.growth}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 