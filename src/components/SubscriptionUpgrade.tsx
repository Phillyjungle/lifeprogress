import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Check, X, Loader2, TrendingUp, Calendar, FileText, Bell, Zap, BarChart2, Target } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: Array<{
    text: string;
    highlight?: boolean;
    icon: React.ElementType;
  }>;
  tier: 'free' | 'premium';
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started with life tracking',
    tier: 'free',
    features: [
      {
        text: 'Basic progress tracking for 5 life domains',
        icon: BarChart2
      },
      {
        text: 'Simple weekly trend analysis',
        icon: TrendingUp
      },
      {
        text: '7-day historical data view',
        icon: Calendar
      },
      {
        text: 'Basic goal setting',
        icon: Target
      },
      {
        text: 'Community support via documentation',
        icon: FileText
      }
    ]
  },
  {
    name: 'Premium',
    price: '$9.99',
    description: 'Enhanced insights and tools for serious self-improvement',
    tier: 'premium',
    features: [
      {
        text: 'Advanced Analytics Dashboard',
        highlight: true,
        icon: BarChart2
      },
      {
        text: 'AI-Powered Personalized Insights',
        highlight: true,
        icon: Zap
      },
      {
        text: 'Unlimited Historical Data',
        highlight: true,
        icon: Calendar
      },
      {
        text: 'Cross-Domain Correlation Analysis',
        highlight: true,
        icon: TrendingUp
      },
      {
        text: 'Custom Goal Templates & Milestone Tracking',
        highlight: true,
        icon: Target
      },
      {
        text: 'Weekly Progress Reports & Recommendations',
        icon: FileText
      },
      {
        text: 'Smart Notifications & Reminders',
        icon: Bell
      },
      {
        text: 'Priority Email Support',
        icon: FileText
      },
      {
        text: 'Data Export in Multiple Formats',
        icon: FileText
      }
    ]
  }
];

export function SubscriptionUpgrade() {
  const { profile, isPremium, upgradeSubscription } = useUser();
  const [loading, setLoading] = useState<'premium' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (tier: 'premium') => {
    setLoading(tier);
    setError(null);

    try {
      const success = await upgradeSubscription(tier);
      if (!success) {
        setError('Upgrade failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(null);
    }
  };

  const getCurrentTier = () => {
    if (isPremium()) return 'premium';
    return 'free';
  };

  const currentTier = getCurrentTier();

  return (
    <div className="py-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Growth Journey
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Start with our free plan or unlock advanced features to accelerate your personal development
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {PRICING_TIERS.map((tier) => {
          const isCurrentTier = currentTier === tier.tier;
          const isLoadingTier = loading === tier.tier;
          const canUpgrade = tier.tier !== 'free' && !isCurrentTier;
          const isPremiumTier = tier.tier === 'premium';

          return (
            <div
              key={tier.name}
              className={`
                relative rounded-2xl p-8 
                ${isCurrentTier 
                  ? 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)]' 
                  : isPremiumTier
                    ? 'border-2 border-purple-400 dark:border-purple-500 bg-white dark:bg-gray-800'
                    : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }
                ${canUpgrade ? 'hover:shadow-xl transition-shadow duration-300' : ''}
                ${isPremiumTier ? 'transform md:scale-105 md:shadow-xl' : ''}
              `}
            >
              {isCurrentTier && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[var(--color-primary)] text-white px-4 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}

              {isPremiumTier && !isCurrentTier && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tier.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tier.description}
                </p>
                <p className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                  {tier.price}
                </p>
                <p className="text-gray-600 dark:text-gray-400">per month</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li 
                    key={feature.text} 
                    className={`
                      flex items-center gap-3 p-2 rounded-lg
                      ${feature.highlight 
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100' 
                        : 'text-gray-700 dark:text-gray-300'}
                    `}
                  >
                    <feature.icon 
                      className={`w-5 h-5 flex-shrink-0 ${
                        feature.highlight 
                          ? 'text-purple-500 dark:text-purple-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`} 
                    />
                    <span className={feature.highlight ? 'font-medium' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => canUpgrade && handleUpgrade('premium')}
                disabled={!canUpgrade || isLoadingTier}
                className={`
                  w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
                  ${isCurrentTier
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : canUpgrade
                      ? isPremiumTier
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                        : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  }
                `}
              >
                {isLoadingTier ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : isCurrentTier ? (
                  'Current Plan'
                ) : canUpgrade ? (
                  'Upgrade Now'
                ) : (
                  'Current Plan'
                )}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-8 text-center text-red-500">
          {error}
        </div>
      )}

      <div className="mt-12 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          ✨ All plans include a 14-day money-back guarantee
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          🔒 Your data is always secure and private
        </p>
      </div>
    </div>
  );
} 