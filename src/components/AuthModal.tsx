import React, { useState } from 'react';
import { BaseballIcon } from './BaseballIcon';
import { UserAccount } from '../types';
import { Lock, Mail, User, ShieldCheck, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up fields
  const [name, setName] = useState('');
  const [number, setNumber] = useState<number | ''>(18);
  const [team, setTeam] = useState('Bullpen Stars');
  const [throwingArm, setThrowingArm] = useState<'RHP' | 'LHP'>('RHP');
  const [role, setRole] = useState<'선발 (SP)' | '구원 (RP)' | '마무리 (CP)'>('선발 (SP)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const userData: UserAccount = {
      id: 'usr_' + Date.now(),
      email: email.trim(),
      name: mode === 'signup' ? (name.trim() || '투수') : (name.trim() || '김투수'),
      number: typeof number === 'number' ? number : 18,
      team: team || 'Bullpen Stars',
      throwingArm,
      role,
      joinedDate: new Date().toISOString().split('T')[0],
      maxVelocity: 151,
    };

    onLoginSuccess(userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1c1e]/95 border border-white/20 rounded-[28px] p-6 md:p-8 max-w-md w-full text-white shadow-2xl my-8 space-y-6 backdrop-blur-3xl animate-in zoom-in-95 duration-200 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-md">
            <BaseballIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {mode === 'login' ? 'Bullpen Log 로그인' : 'Bullpen Log 회원가입'}
          </h2>
          <p className="text-xs text-gray-400">
            {mode === 'login'
              ? '계정에 로그인하여 나만의 불펜 데이터와 분석을 확인하세요.'
              : '새로운 선수로 등록하고 체계적인 투구 부하 관리를 시작하세요.'}
          </p>
        </div>

        {/* Segmented Control Mode Switch */}
        <div className="flex bg-black/40 border border-white/10 p-1 rounded-full text-xs font-semibold backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-full transition-all cursor-pointer text-center ${
              mode === 'login' ? 'bg-white text-black font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-full transition-all cursor-pointer text-center ${
              mode === 'signup' ? 'bg-white text-black font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">선수 성명</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="예: 김투수"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">등번호</label>
                  <input
                    type="number"
                    required
                    placeholder="18"
                    value={number}
                    onChange={(e) => setNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-300">투구 손</label>
                  <select
                    value={throwingArm}
                    onChange={(e) => setThrowingArm(e.target.value as 'RHP' | 'LHP')}
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-2xl px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer"
                  >
                    <option value="RHP">우투 (RHP)</option>
                    <option value="LHP">좌투 (LHP)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">소속 팀명</label>
                <input
                  type="text"
                  placeholder="예: Bullpen Stars"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">이메일 주소</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                placeholder="pitcher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">비밀번호</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/40"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white hover:bg-gray-200 text-black font-extrabold py-3.5 rounded-full text-sm transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-2"
          >
            <span>{mode === 'login' ? '로그인하기' : '회원가입 완료'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Guest shortcut / Demo Fast Login */}
        <div className="border-t border-white/10 pt-4 text-center">
          <button
            type="button"
            onClick={() => {
              onLoginSuccess({
                id: 'usr_demo',
                email: 'pitcher18@bullpen.com',
                name: '김투수',
                number: 18,
                team: '서울 자이언츠',
                throwingArm: 'RHP',
                role: '선발 (SP)',
                joinedDate: '2026-01-15',
                maxVelocity: 153.2,
              });
              onClose();
            }}
            className="text-xs text-gray-400 hover:text-white transition-colors underline font-mono cursor-pointer"
          >
            체험용 데모 계정으로 빠르게 로그인하기
          </button>
        </div>
      </div>
    </div>
  );
};
