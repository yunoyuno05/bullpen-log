import React from 'react';
import { Pitcher, UserAccount } from '../types';
import { BaseballIcon } from './BaseballIcon';
import {
  ArrowRight,
  TrendingUp,
  Activity,
  Sparkles,
  LogIn,
  UserPlus
} from 'lucide-react';

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
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-white px-4 pt-24 pb-12 overflow-hidden">
      {/* Background Soft Ambient Fluid Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-white/5 via-white/[0.02] to-transparent blur-[120px] pointer-events-none" />
      </div>

      {/* Main Center Minimal Hero Container */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Large Central Liquid Glass Bullpen Log Emblem */}
        <div className="relative group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          {/* Subtle Outer Glow Aura */}
          <div className="absolute inset-0 rounded-full bg-white/20 blur-2xl group-hover:bg-white/30 transition-all duration-500" />
          
          {/* Main Glass Circle Icon */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#1c1c1e]/90 border border-white/20 backdrop-blur-3xl flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-300">
            <BaseballIcon className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]" />
          </div>
        </div>

        {/* Minimal Headline */}
        <div className="pt-2">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight font-sans">
            Bullpen Log
          </h1>
        </div>

        {/* Primary Action Buttons: Simple Login & Sign Up */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md pt-2">
          {currentUser ? (
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-full bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-full font-extrabold text-sm transition-all duration-200 shadow-[0_4px_20px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 group"
            >
              <span>시작하기</span>
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

        {/* Minimal 3-Feature Shortcuts Bar */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl">
          <button
            onClick={() => setActiveTab('acwr')}
            className="p-3.5 rounded-2xl bg-[#1c1c1e]/60 hover:bg-[#2c2c2e]/80 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors truncate">ACWR 부하분석</div>
              <div className="text-[10px] text-gray-400 truncate">부상 위험 사전에 경보</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('rom')}
            className="p-3.5 rounded-2xl bg-[#1c1c1e]/60 hover:bg-[#2c2c2e]/80 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">관절 가동범위 (ROM)</div>
              <div className="text-[10px] text-gray-400 truncate">GIRD 및 어깨/팔꿈치 측정</div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('ai-report')}
            className="p-3.5 rounded-2xl bg-[#1c1c1e]/60 hover:bg-[#2c2c2e]/80 border border-white/10 backdrop-blur-xl transition-all text-left flex items-center gap-3 cursor-pointer group shadow-sm"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-rose-300" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-rose-300 transition-colors truncate">AI 맞춤 리포트</div>
              <div className="text-[10px] text-gray-400 truncate">Gemini AI 종합 케어</div>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
};
