import i18n from '../lib/i18n';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lock } from 'lucide-react';


const t = i18n.t.bind(i18n);

interface SubscriptionLockProps {
  requiredTier: 'BEGINNER' | 'AMATEUR' | 'PRO';
  children: React.ReactNode;
  currentTier: string;
}

export const SubscriptionLock: React.FC<SubscriptionLockProps> = ({ requiredTier, children, currentTier }) => {
  
  
  const tiers = ['FREE', 'BEGINNER', 'AMATEUR', 'PRO'];
  const currentIndex = tiers.indexOf(currentTier);
  const requiredIndex = tiers.indexOf(requiredTier);

  const hasAccess = currentIndex >= requiredIndex;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-md pointer-events-none opacity-50 select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 apple-glass rounded-2xl m-2">
        <Lock className="w-12 h-12 mb-4 text-[#ff2a2a] opacity-80" />
        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          {t("Premium Feature")}
        </h3>
        <p className="text-sm text-gray-300 text-center max-w-xs mb-6">
          {t("Upgrade to")} {requiredTier} {t("tier to unlock advanced metrics like kinematic sequence, release point consistency, and more.")}
        </p>
        <button className="px-6 py-2.5 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-colors">
          {t("Upgrade Plan")}
        </button>
      </div>
    </div>
  );
};
