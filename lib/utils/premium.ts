'use server'

import { getUserProfile } from '@/lib/actions/user-profile.actions';

/**
 * Check if the current user has premium subscription
 * @returns Promise<boolean> - true if user is premium, false otherwise
 */
export async function isPremiumUser(): Promise<boolean> {
  try {
    const userProfile = await getUserProfile();
    return userProfile?.subscriptionTier === 'premium';
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false;
  }
}

/**
 * Premium feature gate - throws error if user is not premium
 * @param featureName - Name of the feature being accessed
 * @throws Error if user is not premium
 */
export async function requirePremium(featureName: string = 'feature'): Promise<void> {
  const isPremium = await isPremiumUser();
  if (!isPremium) {
    throw new Error(`Premium subscription required to access ${featureName}`);
  }
}

/**
 * Get premium status with user profile
 * @returns Promise<{isPremium: boolean, userProfile: UserProfile | null}>
 */
export async function getPremiumStatus() {
  try {
    const userProfile = await getUserProfile();
    return {
      isPremium: userProfile?.subscriptionTier === 'premium',
      userProfile
    };
  } catch (error) {
    console.error('Error getting premium status:', error);
    return {
      isPremium: false,
      userProfile: null
    };
  }
}

/**
 * Premium features configuration
 */
export async function getPremiumFeatures() {
  return {
    DETAILED_RESULTS: 'detailed_results',
    ANSWER_EXPLANATIONS: 'answer_explanations',
    GRAMMAR_FEEDBACK: 'grammar_feedback',
    UNLIMITED_TESTS: 'unlimited_tests',
    PROGRESS_ANALYTICS: 'progress_analytics'
  } as const;
}

export type PremiumFeature = 'detailed_results' | 'answer_explanations' | 'grammar_feedback' | 'unlimited_tests' | 'progress_analytics';