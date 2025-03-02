import React from 'react';
import { useUser } from '../context/UserContext';
import { Lock, TrendingUp, Zap, Download } from 'lucide-react';

interface PremiumFeature {
  name: string;
  description: string;
  icon: React.ElementType;
  requiresPremium: boolean;
}

const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    name: 'Advanced Trend Analysis',
    description: 'Deep dive into your progress patterns with AI-powered insights',
    icon: TrendingUp,
    requiresPremium: true
  },
  {
    name: 'Real-time Insights',
    description: 'Get instant feedback on your progress and suggestions for improvement',
    icon: Zap,
    requiresPremium: true
  },
  {
    name: 'Data Export',
    description: 'Export your data in various formats for external analysis',
    icon: Download,
    requiresPremium: true
  }
];

export function PremiumAnalytics() {
  const { isPremium, hasFeature } = useUser();

  const canAccessFeature = (feature: PremiumFeature) => {
    return !feature.requiresPremium || isPremium();
  };

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Premium Analytics Features
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Unlock advanced insights and analysis tools
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {PREMIUM_FEATURES.map((feature) => {
          const isAccessible = canAccessFeature(feature);
          const Icon = feature.icon;

          return (
            <div
              key={feature.name}
              className={`
                relative rounded-xl p-6 border
                ${isAccessible
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`
                    p-3 rounded-lg
                    ${isAccessible
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {feature.name}
                    </h3>
                    {!isAccessible && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                  {!isAccessible && (
                    <p className="mt-2 text-sm text-[var(--color-primary)]">
                      Available with Premium plan
                    </p>
                  )}
                </div>
              </div>

              {isAccessible && (
                <button
                  className="mt-4 w-full py-2 px-4 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                  onClick={() => {
                    // In a real app, this would activate the feature
                    console.log(`Activating ${feature.name}`);
                  }}
                >
                  Use Feature
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!isPremium() && (
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Unlock all premium features and take your progress tracking to the next level
          </p>
          <button
            onClick={() => {
              // Navigate to upgrade page or show upgrade modal
              window.location.href = '/subscription';
            }}
            className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
          >
            Upgrade to Premium
          </button>
        </div>
      )}
    </div>
  );
} 