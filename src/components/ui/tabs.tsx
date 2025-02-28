import React, { useState } from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [value, setValue] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ value, onValueChange: setValue }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={`flex space-x-1 bg-slate-100 p-1 rounded-lg mb-4 overflow-x-auto ${className || ''}`}>
    {children}
  </div>
);

export const TabsTrigger = ({ value, children }: { value: string, children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');
  
  const isActive = context.value === value;
  
  return (
    <button
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0
        ${isActive 
          ? 'bg-white text-indigo-700 shadow-sm' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children }: { value: string, children: React.ReactNode }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  
  if (context.value !== value) return null;
  
  return <div>{children}</div>;
}; 