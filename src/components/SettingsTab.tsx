import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Palette, LogOut, Globe, User, Edit3 } from 'lucide-react';
import { UserAccount } from '../types';

interface SettingsTabProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ currentUser, onLogout, onOpenProfile }) => {
  const { theme, setTheme, language, setLanguage } = useAppStore();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">설정</h2>
        <p className="text-gray-400">앱 기본 환경과 프로필을 관리하세요.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings Section */}
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">프로필 및 계정 설정</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white mb-1">{currentUser?.name || '사용자'}</div>
              <div className="text-sm text-gray-400">{currentUser?.email}</div>
            </div>
            <button 
              onClick={onOpenProfile}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              프로필 관리
            </button>
          </div>
        </div>

        {/* Display Settings Section */}
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">앱 테마 (디스플레이)</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border text-center transition-all ${theme === 'light' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="font-bold mb-1">Light</div>
              <div className="text-[10px] opacity-70">밝은 테마</div>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border text-center transition-all ${theme === 'dark' ? 'bg-black text-white border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-gray-950 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="font-bold mb-1">Dark</div>
              <div className="text-[10px] opacity-70">어두운 테마</div>
            </button>
            <button 
              onClick={() => setTheme('baseball-classic')}
              className={`p-4 rounded-xl border text-center transition-all ${theme === 'baseball-classic' ? 'bg-[#F4F1EA] text-[#2B2B2B] border-[#b51c1c] shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="font-bold mb-1">Classic</div>
              <div className="text-[10px] opacity-70">야구 클래식</div>
            </button>
            <button 
              onClick={() => setTheme('high-contrast')}
              className={`p-4 rounded-xl border text-center transition-all ${theme === 'high-contrast' ? 'bg-black text-yellow-400 border-yellow-400 shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="font-bold mb-1">High-Contrast</div>
              <div className="text-[10px] opacity-70">고대비 테마</div>
            </button>
          </div>
        </div>

        {/* Language Settings Section */}
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">언어 설정 (Language)</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => setLanguage('ko')}
              className={`p-3 rounded-xl border text-center font-medium transition-all ${language === 'ko' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              한국어
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`p-3 rounded-xl border text-center font-medium transition-all ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('ja')}
              className={`p-3 rounded-xl border text-center font-medium transition-all ${language === 'ja' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              日本語
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="pt-6">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};
