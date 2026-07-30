import React from 'react';
import { UserAccount } from '../types';
import { BaseballIcon } from './BaseballIcon';
import { User, Mail, Shield, Calendar, Award, LogOut, X, CheckCircle2 } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1c1e]/95 border border-white/20 rounded-[28px] p-6 md:p-8 max-w-md w-full text-white shadow-2xl my-8 space-y-6 backdrop-blur-3xl animate-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Profile Summary */}
        <div className="text-center space-y-3 pt-2">
          <div className="relative w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto shadow-xl">
            <BaseballIcon className="w-10 h-10 text-white" />
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#1c1c1e] flex items-center justify-center text-[10px] font-bold text-black">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                #{user.number}
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">{user.name}</h2>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1.5">
              <span>{user.team}</span>
              <span>•</span>
              <span>{user.throwingArm === 'RHP' ? '우완 투수 (RHP)' : '좌완 투수 (LHP)'}</span>
            </p>
          </div>
        </div>

        {/* Profile Info Grid */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3.5 backdrop-blur-md">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-white/10 flex items-center justify-between">
            <span>회원 프로필 정보</span>
            <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
              <CheckCircle2 className="w-3 h-3" /> 인증된 투수
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
              <div className="text-gray-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-gray-300" />
                <span>투수 보직</span>
              </div>
              <div className="font-bold text-white text-sm">{user.role || '선발 (SP)'}</div>
            </div>

            <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1">
              <div className="text-gray-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-300" />
                <span>최고 구속</span>
              </div>
              <div className="font-bold text-amber-300 text-sm">
                {user.maxVelocity ? `${user.maxVelocity} km/h` : '153.2 km/h'}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between py-1.5 px-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-300" /> 이메일
              </span>
              <span className="font-mono text-white">{user.email}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 px-3 bg-white/5 rounded-xl border border-white/5">
              <span className="text-gray-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-300" /> 가입 날짜
              </span>
              <span className="font-mono text-white">{user.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold py-3 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </div>
  );
};
