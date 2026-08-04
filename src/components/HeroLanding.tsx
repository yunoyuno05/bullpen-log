import i18n from '../lib/i18n';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { Pitcher, UserAccount } from '../types';
import { BaseballIcon } from './BaseballIcon';
import { ArrowRight, LogIn, UserPlus, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';


const t = i18n.t.bind(i18n);

interface HeroLandingProps {
  currentPitcher: Pitcher;
  setActiveTab: (tab: string) => void;
  onOpenLogger: () => void;
  currentUser: UserAccount | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  setActiveTab,
  currentUser,
  onOpenAuth,
}) => {
  return (
    <div className="relative min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center text-white px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-16 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-gradient-to-tr from-white/10 via-white/[0.03] to-transparent blur-[120px] sm:blur-[150px]" />
        <div className="absolute top-1/2 left-1/4 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-emerald-500/10 blur-[90px] sm:blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-blue-500/10 blur-[90px] sm:blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 max-w-2xl sm:max-w-3xl mx-auto flex flex-col items-center text-center space-y-5 sm:space-y-8 w-full"
      >
        {/* Compact Glass Emblem for Mobile */}
        <div 
          className="relative group cursor-pointer" 
          onClick={() => currentUser ? setActiveTab('dashboard') : onOpenAuth('login')}
        >
          {/* Subtle Outer Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-white/20 blur-xl group-hover:bg-white/35 transition-all duration-500" />
          
          {/* Glass Disc Container */}
          <div className="relative w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-[#1c1c1e]/80 border border-white/20 flex items-center justify-center shadow-xl backdrop-blur-3xl group-hover:scale-105 transition-all duration-300">
            <BaseballIcon className="w-11 h-11 sm:w-18 sm:h-18 text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]" />
          </div>
        </div>

        {/* Hero Title & Subtitle with Korean break-keep */}
        <div className="space-y-2.5 sm:space-y-4 max-w-xl px-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] sm:text-xs font-semibold text-gray-200 backdrop-blur-md shadow-sm break-keep">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="break-keep">스마트 투수 피칭 & 부상 방지 케어 플랫폼</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight break-keep">
            Bullpen Log
          </h1>
        </div>

        {/* Main CTA Buttons - Scaled neatly for mobile */}
        <div className="w-full max-w-xs sm:max-w-md flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
          {currentUser ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full bg-white hover:bg-gray-100 text-black px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 group break-keep"
            >
              <span>대시보드로 이동하기</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <>
              {/* Login Button */}
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-1/2 bg-white hover:bg-gray-200 text-black px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-extrabold text-xs sm:text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 break-keep"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black shrink-0" />
                <span>로그인하기</span>
              </button>

              {/* Sign Up Button */}
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-1/2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 break-keep"
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
                <span>{t('회원가입')}</span>
              </button>
            </>
          )}
        </div>

        {/* Feature Highlights Grid - Compact & Responsive */}
        <div className="pt-4 sm:pt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-xs sm:max-w-2xl">
          <button
            onClick={() => currentUser ? setActiveTab('acwr') : onOpenAuth('login')}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1c1c1e]/70 hover:bg-[#2c2c2e]/90 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm w-full"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors break-keep">ACWR 부하 지수</div>
              <div className="text-[11px] text-gray-400 leading-tight break-keep">7일/28일 투구 과부하 감지</div>
            </div>
          </button>

          <button
            onClick={() => currentUser ? setActiveTab('rom') : onOpenAuth('login')}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1c1c1e]/70 hover:bg-[#2c2c2e]/90 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm w-full"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors break-keep">ROM 관절 가동성</div>
              <div className="text-[11px] text-gray-400 leading-tight break-keep">어깨·팔꿈치 가동범위 추적</div>
            </div>
          </button>

          <button
            onClick={() => currentUser ? setActiveTab('ai-report') : onOpenAuth('login')}
            className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#1c1c1e]/70 hover:bg-[#2c2c2e]/90 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm w-full"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors break-keep">AI 컨디셔닝 리포트</div>
              <div className="text-[11px] text-gray-400 leading-tight break-keep">스마트 맞춤 가이드 제안</div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
