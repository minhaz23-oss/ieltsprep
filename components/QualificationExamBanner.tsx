'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { isPromotionalPeriodActive, getUserQualificationStatus } from '@/lib/actions/qualification-exam.actions';
import { X } from 'lucide-react';

export default function QualificationExamBanner() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkEligibility();
  }, []);

  async function checkEligibility() {
    try {
      // Check if user dismissed banner
      const isDismissed = localStorage.getItem('qualExamBannerDismissed') === 'true';
      if (isDismissed) {
        setDismissed(true);
        return;
      }

      const [promoStatus, qualStatus] = await Promise.all([
        isPromotionalPeriodActive(),
        getUserQualificationStatus()
      ]);

      // Show banner if:
      // 1. Promo is active
      // 2. User hasn't passed yet
      // 3. User hasn't dismissed banner
      if (promoStatus.isActive && !qualStatus?.hasPassed) {
        setShow(true);
        setDaysRemaining(promoStatus.daysRemaining);
      }
    } catch (error) {
      console.error('Error checking qualification eligibility:', error);
    }
  }

  function handleDismiss() {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('qualExamBannerDismissed', 'true');
  }

  if (!show || dismissed) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="text-2xl">🎓</span>
              <h3 className="text-lg md:text-xl font-bold">
                Limited Time: Unlock Premium FREE!
              </h3>
            </div>
            <p className="text-sm md:text-base opacity-90">
              Pass our 30-minute English proficiency test and get lifetime premium access at no cost!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push('/qualification-exam')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-lg"
            >
              Take Free Exam →
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
