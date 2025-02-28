import React from 'react';

export const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className || ''}`}>
    {children}
  </div>
);

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-3">{children}</div>
);

export const CardTitle = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <h3 className={`font-bold text-xl text-slate-900 ${className || ''}`}>{children}</h3>
);

export const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-3">{children}</div>
); 