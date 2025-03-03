import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Brain, Users, Briefcase, Star, 
  Plus, Check, ChevronRight, Calendar, Target, 
  Edit, Trash2, X, Clock, Zap, ChevronDown
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { DOMAIN_CONFIG } from '../types/analytics';

type DomainFilter = keyof typeof DOMAIN_CONFIG | 'all' | 'completed' | 'inprogress';

interface Goal {
  id: string;
  title: string;
  description: string;
  domain: keyof typeof DOMAIN_CONFIG;
  deadline: string;
  progress: number;
  steps: string[];
  isCompleted: boolean;
}

// Importing our domain configuration for consistent styling
const DOMAIN_CONFIG_OBJ = {
  health: {
    label: 'Physical Health',
    color: '#4361ee',
    icon: Activity,
    iconBgColor: 'rgba(67, 97, 238, 0.1)'
  },
  mental: {
    label: 'Mental Wellbeing',
    color: '#4cc9f0',
    icon: Brain,
    iconBgColor: 'rgba(76, 201, 240, 0.1)'
  },
  social: {
    label: 'Social Life',
    color: '#ff8fab',
    icon: Users,
    iconBgColor: 'rgba(255, 143, 171, 0.1)'
  },
  career: {
    label: 'Career Growth',
    color: '#f77f00',
    icon: Briefcase,
    iconBgColor: 'rgba(247, 127, 0, 0.1)'
  },
  growth: {
    label: 'Personal Growth',
    color: '#2a9d8f',
    icon: Star,
    iconBgColor: 'rgba(42, 157, 143, 0.1)'
  }
};

// Goal interface
interface Goal {
  id: string;
  title: string;
  description: string;
  domain: keyof typeof DOMAIN_CONFIG;
  deadline: string;
  progress: number;
  steps: GoalStep[];
  createdAt: string;
  isCompleted: boolean;
  isExpanded?: boolean;
}

// Goal step interface
interface GoalStep {
  id: string;
  title: string;
  isCompleted: boolean;
}

export function GoalTracking() {
  const { entries } = useProgress();
  
  // State for goals
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DomainFilter>('all');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({});
  const [domainTotals, setDomainTotals] = useState<Record<string, { total: number, completed: number }>>({});
  
  // State for new goal form
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: '',
    description: '',
    domain: 'health',
    deadline: '',
    progress: 0,
    steps: [],
    isCompleted: false
  });
  
  // Refs for animations
  const addGoalFormRef = useRef<HTMLDivElement>(null);
  const goalListRef = useRef<HTMLDivElement>(null);
  
  // Animation states
  const [highlightedGoal, setHighlightedGoal] = useState<string | null>(null);
  
  // Load goals from storage
  useEffect(() => {
    // Simulate loading from API or localStorage
    setTimeout(() => {
      const savedGoals = localStorage.getItem('goals');
      
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        setGoals(parsedGoals);
      } else {
        // Set demo goals if none exist
        setGoals(generateDemoGoals());
      }
      
      setIsLoading(false);
    }, 800);
  }, []);
  
  // Update filtered goals when active filter changes
  useEffect(() => {
    if (selectedDomain === 'all') {
      setFilteredGoals(goals);
    } else if (selectedDomain === 'completed') {
      setFilteredGoals(goals.filter(goal => goal.isCompleted));
    } else if (selectedDomain === 'inprogress') {
      setFilteredGoals(goals.filter(goal => !goal.isCompleted));
    } else {
      // Filter by domain
      setFilteredGoals(goals.filter(goal => goal.domain === selectedDomain));
    }
  }, [goals, selectedDomain]);
  
  // Update domain totals when goals change
  useEffect(() => {
    const totals: Record<string, { total: number, completed: number }> = {};
    
    // Initialize with zeros for all domains
    Object.keys(DOMAIN_CONFIG_OBJ).forEach(domain => {
      totals[domain] = { total: 0, completed: 0 };
    });
    
    // Count goals per domain
    goals.forEach(goal => {
      if (goal.domain) {
        totals[goal.domain].total += 1;
        if (goal.isCompleted) {
          totals[goal.domain].completed += 1;
        }
      }
    });
    
    setDomainTotals(totals);
  }, [goals]);
  
  // Generate demo goals for initial state
  const generateDemoGoals = (): Goal[] => {
    return [
      {
        id: '1',
        title: 'Run a half marathon',
        description: 'Train and complete a 21km half marathon race',
        domain: 'health',
        deadline: '2023-12-31',
        progress: 65,
        steps: [
          { id: 's1', title: 'Build up to 5km runs', isCompleted: true },
          { id: 's2', title: 'Build up to 10km runs', isCompleted: true },
          { id: 's3', title: 'Register for half marathon', isCompleted: true },
          { id: 's4', title: 'Complete a 15km training run', isCompleted: false },
          { id: 's5', title: 'Run the half marathon', isCompleted: false }
        ],
        createdAt: '2023-06-15',
        isCompleted: false
      },
      {
        id: '2',
        title: 'Establish a daily meditation practice',
        description: 'Develop a consistent 15-minute daily meditation habit',
        domain: 'mental',
        deadline: '2023-09-30',
        progress: 100,
        steps: [
          { id: 's1', title: 'Research meditation techniques', isCompleted: true },
          { id: 's2', title: 'Start with 5 minutes daily', isCompleted: true },
          { id: 's3', title: 'Increase to 10 minutes daily', isCompleted: true },
          { id: 's4', title: 'Increase to 15 minutes daily', isCompleted: true }
        ],
        createdAt: '2023-05-10',
        isCompleted: true
      },
      {
        id: '3',
        title: 'Host a dinner party',
        description: 'Plan and host a dinner party for 6-8 friends',
        domain: 'social',
        deadline: '2023-10-15',
        progress: 40,
        steps: [
          { id: 's1', title: 'Create guest list', isCompleted: true },
          { id: 's2', title: 'Send invitations', isCompleted: true },
          { id: 's3', title: 'Plan menu', isCompleted: false },
          { id: 's4', title: 'Shop for ingredients', isCompleted: false },
          { id: 's5', title: 'Prepare house', isCompleted: false },
          { id: 's6', title: 'Host the event', isCompleted: false }
        ],
        createdAt: '2023-07-20',
        isCompleted: false
      },
      {
        id: '4',
        title: 'Complete professional certification',
        description: 'Finish the advanced project management certification',
        domain: 'career',
        deadline: '2023-11-30',
        progress: 75,
        steps: [
          { id: 's1', title: 'Register for the course', isCompleted: true },
          { id: 's2', title: 'Complete all modules', isCompleted: true },
          { id: 's3', title: 'Submit required project work', isCompleted: true },
          { id: 's4', title: 'Take practice exam', isCompleted: false },
          { id: 's5', title: 'Pass final certification exam', isCompleted: false }
        ],
        createdAt: '2023-05-15',
        isCompleted: false
      },
      {
        id: '5',
        title: 'Read 12 books this year',
        description: 'Read one book per month across different genres',
        domain: 'growth',
        deadline: '2023-12-31',
        progress: 83,
        steps: [
          { id: 's1', title: 'Create reading list', isCompleted: true },
          { id: 's2', title: 'Read Jan-Oct books (10 books)', isCompleted: true },
          { id: 's3', title: 'Read November book', isCompleted: false },
          { id: 's4', title: 'Read December book', isCompleted: false }
        ],
        createdAt: '2023-01-05',
        isCompleted: false
      }
    ];
  };
  
  // Add a new goal
  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.domain) {
      alert('Please provide at least a title and domain for your goal');
      return;
    }
    
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title || '',
      description: newGoal.description || '',
      domain: newGoal.domain || 'health',
      deadline: newGoal.deadline || '',
      progress: 0,
      steps: newGoal.steps || [],
      createdAt: new Date().toISOString(),
      isCompleted: false
    };
    
    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    
    // Save to localStorage
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    
    // Reset form and close it
    setNewGoal({
      title: '',
      description: '',
      domain: 'health',
      deadline: '',
      progress: 0,
      steps: [],
      isCompleted: false
    });
    
    setIsAddingGoal(false);
    
    // Animate the new goal
    setHighlightedGoal(goal.id);
    setTimeout(() => setHighlightedGoal(null), 2000);
  };
  
  // Toggle goal completion
  const toggleGoalCompletion = (id: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === id) {
        const completed = !goal.isCompleted;
        return { 
          ...goal, 
          isCompleted: completed,
          progress: completed ? 100 : calculateProgress(goal.steps)
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
  };
  
  // Toggle step completion
  const toggleStepCompletion = (goalId: string, stepId: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSteps = goal.steps.map(step => {
          if (step.id === stepId) {
            return { ...step, isCompleted: !step.isCompleted };
          }
          return step;
        });
        
        // Recalculate progress
        const progress = calculateProgress(updatedSteps);
        const isCompleted = progress === 100;
        
        return { 
          ...goal, 
          steps: updatedSteps,
          progress,
          isCompleted
        };
      }
      return goal;
    });
    
    setGoals(updatedGoals);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
  };
  
  // Add a step to goal being created
  const addStepToNewGoal = () => {
    const stepTitle = prompt('Enter step title:');
    if (stepTitle) {
      setNewGoal({
        ...newGoal,
        steps: [
          ...(newGoal.steps || []),
          { id: Date.now().toString(), title: stepTitle, isCompleted: false }
        ]
      });
    }
  };
  
  // Remove a step from goal being created
  const removeStepFromNewGoal = (id: string) => {
    setNewGoal({
      ...newGoal,
      steps: (newGoal.steps || []).filter(step => step.id !== id)
    });
  };
  
  // Delete a goal
  const deleteGoal = (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter(goal => goal.id !== id);
      setGoals(updatedGoals);
      localStorage.setItem('goals', JSON.stringify(updatedGoals));
    }
  };
  
  // Toggle goal expanded state
  const toggleGoalExpanded = (id: string) => {
    setExpandedGoals(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Calculate progress based on completed steps
  const calculateProgress = (steps: GoalStep[]): number => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.isCompleted).length;
    return Math.round((completedSteps / steps.length) * 100);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Calculate days remaining
  const getDaysRemaining = (deadlineString: string) => {
    if (!deadlineString) return null;
    
    const deadline = new Date(deadlineString);
    const today = new Date();
    
    // Reset time portion to get accurate day difference
    deadline.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };
  
  return (
    <div className="space-y-6 pb-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Goal Tracking</h1>
        
        <button
          onClick={() => setIsAddingGoal(true)}
          className="flex items-center px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </button>
      </div>
      
      {/* Domain quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(DOMAIN_CONFIG_OBJ).map(([domain, config]) => {
          const stats = domainTotals[domain] || { total: 0, completed: 0 };
          const Icon = config.icon;
          const percentage = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;
          
          return (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`flex items-start p-4 rounded-xl transition-all 
                         ${selectedDomain === domain ? 
                            `bg-[${config.color}] bg-opacity-10 border border-[${config.color}] border-opacity-20` : 
                            'bg-white bg-opacity-85 backdrop-blur-sm hover:bg-opacity-100 border border-gray-100'}`}
            >
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ 
                  backgroundColor: `${config.color}15`,
                  color: config.color 
                }}
              >
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <h3 
                  className="text-sm font-medium"
                  style={{ color: selectedDomain === domain ? config.color : '#4a4a4a' }}
                >
                  {config.label}
                </h3>
                
                <div className="flex items-center mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                    <div 
                      className="h-1.5 rounded-full" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: config.color 
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {stats.completed}/{stats.total}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mt-6">
        <button
          onClick={() => setSelectedDomain('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors
                     ${selectedDomain === 'all' ? 
                        'bg-gray-800 text-white' : 
                        'bg-white hover:bg-gray-100 text-gray-700'}`}
        >
          All Goals
        </button>
        
        <button
          onClick={() => setSelectedDomain('inprogress')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors
                     ${selectedDomain === 'inprogress' ? 
                        'bg-blue-500 text-white' : 
                        'bg-white hover:bg-gray-100 text-gray-700'}`}
        >
          In Progress
        </button>
        
        <button
          onClick={() => setSelectedDomain('completed')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors
                     ${selectedDomain === 'completed' ? 
                        'bg-green-500 text-white' : 
                        'bg-white hover:bg-gray-100 text-gray-700'}`}
        >
          Completed
        </button>
      </div>
      
      {/* New Goal Form */}
      {isAddingGoal && (
        <div 
          ref={addGoalFormRef}
          className="bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100 animate-fade-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Create New Goal</h2>
            <button 
              onClick={() => setIsAddingGoal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newGoal.title || ''}
                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="What do you want to achieve?"
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newGoal.description || ''}
                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                placeholder="Add more details about your goal..."
                rows={3}
              />
            </div>
            
            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {Object.entries(DOMAIN_CONFIG_OBJ).map(([domain, config]) => {
                  const Icon = config.icon;
                  const isSelected = newGoal.domain === domain;
                  
                  return (
                    <button
                      key={domain}
                      type="button"
                      onClick={() => setNewGoal({ ...newGoal, domain })}
                      className={`flex items-center px-3 py-2 rounded-lg border transition-colors ${
                        isSelected ? 
                          `border-[${config.color}] bg-[${config.color}] bg-opacity-10` : 
                          'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <Icon 
                        className={`w-4 h-4 mr-2 ${isSelected ? '' : 'text-gray-500'}`}
                        style={{ color: isSelected ? config.color : undefined }}
                      />
                      <span 
                        className={`text-sm ${isSelected ? 'font-medium' : 'text-gray-700'}`}
                        style={{ color: isSelected ? config.color : undefined }}
                      >
                        {config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="date"
                  value={newGoal.deadline || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
            
            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Steps
                </label>
                <button
                  type="button"
                  onClick={addStepToNewGoal}
                  className="text-xs text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] flex items-center"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Step
                </button>
              </div>
              
              {(newGoal.steps || []).length === 0 ? (
                <div className="text-sm text-gray-500 italic">
                  No steps added yet. Break down your goal into manageable steps.
                </div>
              ) : (
                <ul className="space-y-2">
                  {(newGoal.steps || []).map((step, index) => (
                    <li key={step.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-gray-500 text-sm mr-2">{index + 1}.</span>
                        <span className="text-sm">{step.title}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStepFromNewGoal(step.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsAddingGoal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddGoal}
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Goals List */}
      <div ref={goalListRef} className="space-y-4">
        {isLoading ? (
          <div className="bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        ) : filteredGoals.length === 0 ? (
          <div className="bg-white bg-opacity-85 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <Target className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-800 mb-1">No goals found</h3>
            <p className="text-gray-500 mb-4">
              {selectedDomain === 'all' 
                ? "You haven't created any goals yet." 
                : `You don't have any ${selectedDomain === 'completed' ? 'completed' : selectedDomain} goals.`}
            </p>
            {selectedDomain !== 'all' && (
              <button
                onClick={() => setSelectedDomain('all')}
                className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] underline"
              >
                View all goals
              </button>
            )}
          </div>
        ) : (
          filteredGoals.map(goal => {
            const domain = DOMAIN_CONFIG_OBJ[goal.domain];
            const Icon = domain?.icon || Target;
            const isExpanded = expandedGoals[goal.id];
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isHighlighted = highlightedGoal === goal.id;
            
            return (
              <div 
                key={goal.id}
                className={`bg-white bg-opacity-85 backdrop-blur-sm rounded-xl shadow-sm border
                           transition-all duration-300 overflow-hidden
                          ${goal.isCompleted ? 'border-green-100' : 'border-gray-100'}
                          ${isHighlighted ? 'shadow-md border-[var(--color-primary-15)] animate-pulse' : ''}
                         `}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <button
                        onClick={() => toggleGoalCompletion(goal.id)}
                        className={`w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center mr-3 transition-colors
                                   ${goal.isCompleted 
                                     ? 'bg-green-500 border-green-500 text-white' 
                                     : `border-[${domain?.color || '#718096'}] text-transparent hover:bg-gray-50`}`
                                  }
                      >
                        {goal.isCompleted && <Check className="w-4 h-4" />}
                      </button>
                      
                      <div>
                        <h3 className={`text-lg font-medium text-gray-800 mb-1 ${goal.isCompleted ? 'line-through text-gray-500' : ''}`}>
                          {goal.title}
                        </h3>
                        
                        <div className="flex items-center mb-2">
                          <div 
                            className="px-2 py-0.5 rounded-full text-xs font-medium mr-2 flex items-center"
                            style={{ 
                              backgroundColor: `${domain?.color || '#718096'}15`,
                              color: domain?.color || '#718096'
                            }}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {domain?.label || 'Goal'}
                          </div>
                          
                          {goal.deadline && (
                            <div className={`flex items-center text-xs
                                          ${daysRemaining !== null && daysRemaining < 0
                                            ? 'text-red-500' 
                                            : daysRemaining !== null && daysRemaining <= 7
                                              ? 'text-amber-500'
                                              : 'text-gray-500'}`}
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(goal.deadline)}
                              {daysRemaining !== null && (
                                <span className="ml-1 font-medium">
                                  {daysRemaining < 0
                                    ? `(${Math.abs(daysRemaining)} days overdue)`
                                    : daysRemaining === 0
                                      ? '(Today)'
                                      : `(${daysRemaining} days left)`}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {goal.description && !isExpanded && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-1">
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-500 mr-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleGoalExpanded(goal.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronDown 
                          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-1 mb-2">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${goal.progress}%`,
                          backgroundColor: goal.isCompleted ? '#10B981' : domain?.color || '#718096'
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 animate-fade-in">
                    {goal.description && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                      </div>
                    )}
                    
                    {/* Steps */}
                    {goal.steps && goal.steps.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Steps</h4>
                        <ul className="space-y-2">
                          {goal.steps.map(step => (
                            <li key={step.id} className="flex items-start">
                              <button
                                onClick={() => toggleStepCompletion(goal.id, step.id)}
                                className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center mr-2 mt-0.5 transition-colors
                                         ${step.isCompleted 
                                           ? 'bg-green-500 border-green-500 text-white' 
                                           : 'border-gray-300 text-transparent hover:bg-gray-50'}`
                                        }
                              >
                                {step.isCompleted && <Check className="w-3 h-3" />}
                              </button>
                              
                              <span className={`text-sm ${step.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                {step.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 