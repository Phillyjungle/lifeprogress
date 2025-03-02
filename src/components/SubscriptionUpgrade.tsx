import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Check, X, Loader2 } from 'lucide-react';

interface PricingTier {
  name: string;
  price: string;
  features: string[];
  tier: 'free' | 'premium';
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: 'Free',
    price: '$0',
    tier: 'free',
    features: [
      'Basic progress tracking',
      'Simple analytics',
      'Single device sync',
      'Community support',
      'Standard insights',
      'Basic goal tracking'
    ]
  },
  {
    name: 'Premium',
    price: '$9.99',
    tier: 'premium',
    features: [
      'Advanced progress tracking',
      'Detailed analytics & insights',
      'Multi-device sync',
      'Data export',
      'Email support',
      'Custom domains',
      'Advanced goal tracking',
      'Priority support',
      'Custom integrations'
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
          Upgrade Your Experience
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
        {PRICING_TIERS.map((tier) => {
          const isCurrentTier = currentTier === tier.tier;
          const isLoadingTier = loading === tier.tier;
          const canUpgrade = tier.tier !== 'free' && !isCurrentTier;

          return (
            <div
              key={tier.name}
              className={`
                relative rounded-2xl p-8 
                ${isCurrentTier 
                  ? 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)]' 
                  : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }
                ${canUpgrade ? 'hover:shadow-xl transition-shadow duration-300' : ''}
              `}
            >
              {isCurrentTier && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[var(--color-primary)] text-white px-4 py-1 rounded-full text-sm">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {tier.name}
                </h3>
                <p className="text-4xl font-bold text-[var(--color-primary)] mb-2">
                  {tier.price}
                </p>
                <p className="text-gray-600 dark:text-gray-400">per month</p>
              </div>

              <ul className="space-y-4 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-700 dark:text-gray-300">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => canUpgrade && handleUpgrade('premium')}
                disabled={!canUpgrade || isLoadingTier}
                className={`
                  w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200
                  ${isCurrentTier
                    ? 'bg-green-100 text-green-800 cursor-default'
                    : canUpgrade
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]'
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
                  'Not Available'
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

      <div className="mt-12 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          All plans include a 14-day money-back guarantee.
          <br />
          Need help choosing? Contact our support team.
        </p>
      </div>
    </div>
  );
} 