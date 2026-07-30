import React from 'react';
import { Pitcher, UserAccount } from '../types';
import { BaseballIcon } from './BaseballIcon';
import { ArrowRight, LogIn, UserPlus, TrendingUp, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-white px-4 pt-16 pb-16 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-white/10 via-white/[0.03] to-transparent blur-[150px]" />
        <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-8"
      >
        {/* Large Central Liquid Glass Bullpen Log Emblem */}
        <div 
          className="relative group cursor-pointer" 
          onClick={() => currentUser ? setActiveTab('dashboard') : onOpenAuth('login')}
        >
          {/* Subtle Outer Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl group-hover:bg-white/35 transition-all duration-500" />
          
          {/* Glass Disc Container */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#1c1c1e]/80 border border-white/20 flex items-center justify-center shadow-2xl backdrop-blur-3xl group-hover:scale-105 transition-all duration-300">
            <BaseballIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.4)]" />
          </div>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-gray-200 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>스마트 투수 피칭 & 부상 방지 케어 플랫폼</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Bullpen Log
          </h1>

          <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            투구 수 데이터, ACWR 피로도 분석, 관절 가동범위(ROM) 측정부터
            <br className="hidden sm:inline" />
            AI 케어 리포트까지 체계적인 투구 관리를 경험하세요.
          </p>
        </div>

        {/* Main CTA Buttons */}
        <div className="w-full max-w-md flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {currentUser ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-full font-extrabold text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
            >
              <span>대시보드로 이동하기</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : (
            <>
              {/* Login Button */}
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-1/2 bg-white hover:bg-gray-200 text-black px-8 py-3.5 rounded-full font-extrabold text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4 text-black" />
                <span>로그인하기</span>
              </button>

              {/* Sign Up Button */}
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full sm:w-1/2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <UserPlus className="w-4 h-4 text-white" />
                <span>회원가입</span>
              </button>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          <button
            onClick={() => currentUser ? setActiveTab('acwr') : onOpenAuth('login')}
            className="p-4 rounded-2xl bg-[#1c1c1e]/60 hover:bg-[#2c2c2e]/80 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">ACWR 부하 지수</div>
              <div className="text-[11px] text-gray-400">7일/28일 투구 과부하 감지</div>
            </div>
          </button>

          <button
            onClick={() => currentUser ? setActiveTab('rom') : onOpenAuth('login')}
            className="p-4 rounded-2xl bg-[#1c1c1e]/60 hover:bg-[#2c2c2e]/80 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">ROM 관절 가동성</div>
              <div className="text-[11px] text-gray-400">어깨·팔꿈치 가동범위 추적</div>
            </div>
          </button>

          <button
            onClick={() => currentUser ? setActiveTab('ai-report') : onOpenAuth('login')}
            className="p-4 rounded-2xl bg-[#1c1c1e]/60 hover:bg-[#2c2c2e]/80 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors">AI 컨디셔닝 리포트</div>
              <div className="text-[11px] text-gray-400">스마트 맞춤 가이드 제안</div>
            </div>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-gray-400 text-xs pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Supabase 암호화로 안전하게 관리되는 개인 투수 데이터</span>
        </div>
      </motion.div>
    </div>
  );
};
