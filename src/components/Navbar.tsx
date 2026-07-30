import React, { useState, useRef, useEffect } from 'react';
import { Pitcher, UserAccount } from '../types';
import {
  Activity,
  Menu,
  X,
  Plus,
  ChevronDown,
  LayoutDashboard,
  Calendar,
  TrendingUp,
  Dumbbell,
  Video,
  Sparkles,
  FileText,
  Home,
  User,
  LogIn
} from 'lucide-react';
import { BaseballIcon } from './BaseballIcon';

interface NavbarProps {
  pitchers: Pitcher[];
  selectedPitcherId: string;
  onSelectPitcher: (id: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogger: () => void;
  currentUser: UserAccount | null;
  onOpenProfile: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  pitchers,
  selectedPitcherId,
  onSelectPitcher,
  activeTab,
  setActiveTab,
  onOpenLogger,
  currentUser,
  onOpenProfile,
  onOpenAuth,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: '라이브 대시보드', icon: LayoutDashboard, desc: '선수 종합 통계 & 통합 모니터링' },
    { id: 'calendar', label: '훈련 캘린더 & 종합 관리', icon: Calendar, desc: '일별 훈련, 루틴, 목표 관리' },
    { id: 'acwr', label: '부하 지수 (ACWR) 분석', icon: TrendingUp, desc: '7일/28일 과부하 및 부상 위험 경보' },
    { id: 'rom', label: '가동범위 (ROM) & GIRD', icon: Dumbbell, desc: '관절 가동성 및 통증 히트맵' },
    { id: 'video', label: '메커니즘 영상 아카이브', icon: Video, desc: 'Split-Screen 폼 비교 분석' },
    { id: 'ai-report', label: 'AI 맞춤 케어 리포트', icon: Sparkles, desc: 'Gemini AI 주간 리포트 & 코칭', isAi: true },
    { id: 'logs', label: '피칭 일지 데이터', icon: FileText, desc: '구질별 상세 기록 & 불펜 히스토리' },
  ];

  const currentNav = navItems.find((item) => item.id === activeTab) || navItems[0];

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#1c1c1e]/80 backdrop-blur-2xl border-b border-white/10 px-4 sm:px-8 py-3 text-white shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Brand Logo */}
        <div
          onClick={() => handleSelectTab(currentUser ? 'dashboard' : 'hero')}
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity shrink-0 group"
          title={currentUser ? "대시보드로 이동" : "메인 화면으로 이동"}
        >
          <div className="w-9 h-9 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center border border-white/20 shadow-sm transition-all">
            <BaseballIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-white font-sans flex items-center gap-2">
              Bullpen Log
              {activeTab !== 'hero' && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                  {currentNav.label}
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right Section: User Profile + Quick Action + Program Menu Dropdown (Shown only when NOT on hero screen) */}
        {activeTab !== 'hero' && (
          <div className="flex items-center gap-2 sm:gap-3" ref={menuRef}>
            {/* Quick Session Logger Pill */}
            <button
              onClick={onOpenLogger}
              className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 backdrop-blur-md"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">피칭 기록</span>
            </button>

            {/* User Profile Info Badge Button */}
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 backdrop-blur-md"
                title="회원 정보 보기"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold">#{currentUser.number} {currentUser.name}</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="bg-white hover:bg-gray-200 text-black px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인</span>
              </button>
            )}

            {/* Top-Right Program Menu Button (Main Nav Trigger) */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-sm backdrop-blur-xl ${
                  isMenuOpen
                    ? 'bg-white text-black border-white'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <Menu className="w-4 h-4" />
                <span>프로그램 메뉴</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Program Menu Liquid Glass Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-[#1c1c1e]/95 backdrop-blur-3xl border border-white/20 rounded-[24px] p-2.5 shadow-2xl z-50 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1 flex items-center justify-between">
                    <span>프로그램 탭 선택</span>
                    <span className="text-white/60 font-mono">BULLPEN LOG</span>
                  </div>

                  {navItems.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-start gap-3 cursor-pointer group ${
                          isActive
                            ? 'bg-white text-black font-semibold shadow-md'
                            : 'hover:bg-white/10 text-gray-200 hover:text-white'
                        }`}
                      >
                        <div className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                          isActive
                            ? 'bg-black/10 border-black/10 text-black'
                            : 'bg-white/10 border-white/10 text-gray-300 group-hover:text-white'
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold truncate">{item.label}</span>
                            {item.isAi && !isActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">
                                AI
                              </span>
                            )}
                          </div>
                          <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

