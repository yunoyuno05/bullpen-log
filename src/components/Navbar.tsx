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
  LogIn,
  UserPlus,
  LogOut
} from 'lucide-react';
import { BaseballIcon } from './BaseballIcon';
import { motion, AnimatePresence } from 'motion/react';

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
    { id: 'calendar', label: '훈련 캘린더', icon: Calendar, desc: '훈련 스케줄 계획, 과거 피칭/웨이트 기록' },
    { id: 'acwr', label: '부하 지수 (ACWR) 분석', icon: TrendingUp, desc: '7일/28일 과부하 및 부상 위험 경보' },
    { id: 'rom', label: '가동범위 (ROM) & GIRD', icon: Dumbbell, desc: '관절 가동성 및 통증 히트맵' },
    { id: 'video', label: '메커니즘 영상 아카이브', icon: Video, desc: 'Split-Screen 폼 비교 분석' },
    { id: 'ai-report', label: 'AI 맞춤 케어 리포트', icon: Sparkles, desc: 'AI 불펜 코치 주간 리포트 & 맞춤 코칭', isAi: true },
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
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#1c1c1e]/85 backdrop-blur-2xl border-b border-white/10 px-3 sm:px-8 py-2 sm:py-3 text-white shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Brand Logo */}
        <div
          onClick={() => handleSelectTab(currentUser ? 'dashboard' : 'hero')}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity shrink-0 group"
          title={currentUser ? "대시보드로 이동" : "Bullpen Log 홈"}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center border border-white/20 shadow-sm transition-all shrink-0">
            <BaseballIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base sm:text-lg tracking-tight text-white font-sans">
              Bullpen Log
            </span>
            {activeTab !== 'hero' && (
              <span className="hidden md:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10 truncate max-w-[120px]">
                {currentNav.label}
              </span>
            )}
          </div>
        </div>

        {/* Right Section Container */}
        <div className="flex items-center gap-2" ref={menuRef}>
          {/* DESKTOP NAV BAR CONTROLS */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <>
                {/* Quick Session Logger Pill */}
                <button
                  onClick={onOpenLogger}
                  className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 backdrop-blur-md"
                >
                  <Plus className="w-3.5 h-3.5 text-white" />
                  <span>피칭 기록</span>
                </button>

                {/* User Profile Info Badge Button */}
                <button
                  onClick={onOpenProfile}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 backdrop-blur-md"
                  title="회원 정보 보기"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                  <span className="font-bold">#{currentUser.number} {currentUser.name}</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="bg-white hover:bg-gray-200 text-black px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>로그인</span>
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className={`px-3.5 py-1.5 rounded-full text-xs transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 shrink-0 backdrop-blur-md ${
                    activeTab === 'signup'
                      ? 'bg-emerald-400 text-black font-extrabold shadow-emerald-500/20'
                      : 'bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>회원가입</span>
                </button>
              </div>
            )}

            {/* Desktop Program Menu Button */}
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
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`sm:hidden w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-md ${
              isMenuOpen
                ? 'bg-white text-black border-white'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
            aria-label="더보기 메뉴"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* DROPDOWN MENU (Supports both Desktop and Mobile smooth Drawer view) */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-3 sm:right-8 top-12 sm:top-14 w-[calc(100vw-24px)] max-w-sm sm:w-80 bg-[#1c1c1e]/98 backdrop-blur-3xl border border-white/20 rounded-[24px] p-3 shadow-2xl z-50 space-y-2 overflow-hidden"
              >
                {/* Mobile Header Account / Auth Bar */}
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  {currentUser ? (
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          onOpenProfile();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 text-left cursor-pointer group"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {currentUser.avatarUrl ? (
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                            #{currentUser.number} {currentUser.name}
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {currentUser.team || '소속 팀 없음'} · {currentUser.throwingArm}
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          onOpenLogger();
                          setIsMenuOpen(false);
                        }}
                        className="bg-white text-black px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>기록</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          onOpenAuth('login');
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-white text-black py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>로그인</span>
                      </button>
                      <button
                        onClick={() => {
                          onOpenAuth('signup');
                          setIsMenuOpen(false);
                        }}
                        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>회원가입</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Program Navigation Header */}
                <div className="px-2 pt-1 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-white/10">
                  <span>메뉴 및 대시보드 탭</span>
                  <span className="text-white/50 font-mono">BULLPEN LOG</span>
                </div>

                {/* Nav Items List */}
                <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-0.5">
                  {!currentUser && (
                    <button
                      onClick={() => {
                        onOpenAuth('signup');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    >
                      <div className="p-2 rounded-xl border shrink-0 bg-emerald-500/20 border-emerald-500/30 text-emerald-300">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold block">선수 등록 회원가입</span>
                        <p className="text-[10px] truncate text-emerald-400/80">
                          신규 선수 등록 및 투수 프로필 생성
                        </p>
                      </div>
                    </button>
                  )}

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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};


