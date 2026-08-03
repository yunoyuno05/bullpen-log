import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { UserAccount } from '../types';
import { calculateAge } from '../lib/utils';
import { BaseballIcon } from './BaseballIcon';
import { Mail, Calendar, Award, LogOut, X, CheckCircle2, Edit3, Save, RotateCcw, Loader2, Camera, Trash2, Ruler, Weight, Activity, Cake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onLogout: () => void;
  onUpdateProfile?: (updatedUser: UserAccount) => Promise<void> | void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateProfile,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [number, setNumber] = useState<number>(18);
  const [team, setTeam] = useState('');
  const [throwingArm, setThrowingArm] = useState<'RHP' | 'LHP' | 'SWITCH'>('RHP');
  const [role, setRole] = useState<string>('미정 (Unassigned)');
  const [maxVelocity, setMaxVelocity] = useState<number>(150);
  const [height, setHeight] = useState<number>(185);
  const [weight, setWeight] = useState<number>(85);
  const [wingspan, setWingspan] = useState<number>(190);
  const [age, setAge] = useState<number>(24);
  const [birthdate, setBirthdate] = useState<string>('2000-01-15');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setNumber(user.number || 18);
      setTeam(user.team || '');
      setThrowingArm(user.throwingArm || 'RHP');
      setRole(user.role || '미정 (Unassigned)');
      setMaxVelocity(user.maxVelocity || 151.5);
      setHeight(user.height || 185);
      setWeight(user.weight || 85);
      setWingspan(user.wingspan || 190);
      setAge(user.age || 24);
      setBirthdate(user.birthdate || '2000-01-15');
      setAvatarUrl(user.avatarUrl || '');
    }
    setIsEditing(false);
    setSaveSuccess(false);
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatarUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const updatedUser: UserAccount = {
      ...user,
      name: name.trim(),
      number: Number(number) || 0,
      team: team.trim() || '소속 없음',
      throwingArm,
      role: role || '미정 (Unassigned)',
      maxVelocity: Number(maxVelocity) || 145,
      height: Number(height) || 0,
      weight: Number(weight) || 0,
      wingspan: Number(wingspan) || 0,
      age: Number(age) || 0,
      birthdate,
      avatarUrl,
    };

    try {
      if (onUpdateProfile) {
        await onUpdateProfile(updatedUser);
      }
      setIsSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setIsSaving(false);
    }
  };

  const getThrowingArmLabel = (arm: 'RHP' | 'LHP' | 'SWITCH') => {
    switch (arm) {
      case 'RHP': return '우투 (RHP)';
      case 'LHP': return '좌투 (LHP)';
      case 'SWITCH': return '양투 (Switch)';
      default: return '우투 (RHP)';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#1c1c1e]/98 border border-white/20 rounded-[24px] sm:rounded-[28px] p-5 sm:p-7 max-w-md w-full text-white shadow-2xl my-4 sm:my-8 space-y-5 backdrop-blur-3xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header & Photo Editor */}
            <div className="text-center space-y-3 pt-1">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto group">
                <div className="w-full h-full rounded-full bg-white/10 border-2 border-white/20 overflow-hidden flex items-center justify-center shadow-xl bg-[#2c2c2e]">
                  {avatarUrl ? (
                    <img src={avatarUrl || undefined} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <BaseballIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  )}
                </div>

                <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-2 border-[#1c1c1e] flex items-center justify-center text-[10px] font-bold text-black shadow-md z-10">
                  ✓
                </span>

                {/* Edit Photo Trigger Overlay */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer border-2 border-white/40"
                    title="프로필 사진 변경"
                  >
                    <Camera className="w-5 h-5 mb-0.5 text-white" />
                    <span>사진 변경</span>
                  </button>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />

              {/* Photo Clear Option in Edit Mode */}
              {isEditing && avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>기본 프로필 사진으로 변경</span>
                </button>
              )}

              {!isEditing ? (
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/10">
                      #{user.number}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">{user.name}</h2>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1.5 flex-wrap">
                    <span>{user.team}</span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-400">{getThrowingArmLabel(user.throwingArm)}</span>
                    <span>•</span>
                    <span className="text-gray-300 font-medium">{user.role || '미정 (Unassigned)'}</span>
                  </p>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-bold text-white">선수 프로필 정보 수정</h2>
                  <p className="text-xs text-gray-400">사진, 생년월일, 신체 정보, 최고 구속 및 투구 손을 변경합니다.</p>
                </div>
              )}
            </div>

            {/* Success Toast */}
            {saveSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs py-2 px-3 rounded-xl text-center font-bold animate-in fade-in duration-200">
                ✓ 선수 프로필 정보가 성공적으로 저장되었습니다!
              </div>
            )}

            {/* Main Content Area: View or Edit Mode */}
            {!isEditing ? (
              <div className="space-y-4">
                {/* Physical Metrics Grid */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3.5 backdrop-blur-md">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-1 border-b border-white/10 flex items-center justify-between">
                    <span>선수 정보</span>
                    <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                      <CheckCircle2 className="w-3 h-3" /> 검증됨
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1">
                      <div className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Ruler className="w-3.5 h-3.5 text-blue-400" />
                        <span>신장 (키)</span>
                      </div>
                      <div className="font-extrabold text-white text-xs sm:text-sm">
                        {user.height ? `${user.height} cm` : '185 cm'}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1">
                      <div className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Weight className="w-3.5 h-3.5 text-emerald-400" />
                        <span>체중 (몸무게)</span>
                      </div>
                      <div className="font-extrabold text-white text-xs sm:text-sm">
                        {user.weight ? `${user.weight} kg` : '85 kg'}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1">
                      <div className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Activity className="w-3.5 h-3.5 text-purple-400" />
                        <span>윙스팬 (팔길이)</span>
                      </div>
                      <div className="font-extrabold text-white text-xs sm:text-sm">
                        {user.wingspan ? `${user.wingspan} cm` : '190 cm'}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1">
                      <div className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span>최고 구속</span>
                      </div>
                      <div className="font-extrabold text-amber-300 text-xs sm:text-sm">
                        {user.maxVelocity ? `${user.maxVelocity} km/h` : '151.5 km/h'}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1">
                      <div className="text-gray-400 flex items-center gap-1 text-[11px]">
                        <Cake className="w-3.5 h-3.5 text-pink-400" />
                        <span>생년월일</span>
                      </div>
                      <div className="font-extrabold text-white text-xs sm:text-sm font-mono">
                        {user.birthdate || '2000-01-15'}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-2.5 rounded-xl space-y-1">
                      <div className="text-gray-400 text-[11px]">나이 (만)</div>
                      <div className="font-extrabold text-white text-xs sm:text-sm">
                        {user.age ? `만 ${user.age}세` : '만 24세'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-1">
                    <div className="flex items-center justify-between py-1.5 px-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-gray-300" /> 이메일
                      </span>
                      <span className="font-mono text-white text-[11px] sm:text-xs truncate max-w-[180px]">{user.email}</span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 px-3 bg-white/5 rounded-xl border border-white/5">
                      <span className="text-gray-400 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-300" /> 가입 날짜
                      </span>
                      <span className="font-mono text-white text-[11px] sm:text-xs">{user.joinedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 text-white" />
                  <span>프로필 & 신체 정보 수정하기</span>
                </button>
              </div>
            ) : (
              /* Edit Form */
              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                {/* Photo Change Bar */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center justify-between">
                  <span className="text-gray-300 font-semibold">프로필 이미지</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-black px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Camera className="w-3 h-3" />
                    <span>사진 업로드</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2 space-y-1">
                    <label className="text-gray-400 font-medium">선수 이름</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
                      placeholder="이름 입력"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 font-medium">등번호</label>
                    <input
                      type="number"
                      value={number}
                      onChange={(e) => setNumber(parseInt(e.target.value) || 0)}
                      required
                      min={0}
                      max={99}
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-white transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 font-medium">소속 팀명</label>
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white transition-colors"
                    placeholder="예: 서울 자이언츠"
                  />
                </div>

                {/* Throwing Arm 3-way toggle */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-medium">투구 손 (Throwing Arm)</label>
                  <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 border border-white/15 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setThrowingArm('RHP')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        throwingArm === 'RHP' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      우투 (R)
                    </button>
                    <button
                      type="button"
                      onClick={() => setThrowingArm('LHP')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        throwingArm === 'LHP' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      좌투 (L)
                    </button>
                    <button
                      type="button"
                      onClick={() => setThrowingArm('SWITCH')}
                      className={`py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                        throwingArm === 'SWITCH' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      양투 (Switch)
                    </button>
                  </div>
                </div>

                {/* Pitcher Role Select */}
                <div className="space-y-1">
                  <label className="text-gray-400 font-medium">투수 보직 (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-white transition-colors cursor-pointer"
                  >
                    <option value="선발 (SP)">선발 (SP)</option>
                    <option value="불펜 (RP)">불펜 (RP)</option>
                    <option value="미정 (Unassigned)">미정 (Unassigned)</option>
                  </select>
                </div>

                {/* Personal & Physical Baseball Metrics */}
                <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2.5">
                  <div className="text-[11px] font-bold text-gray-300 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    <span>선수 상세 정보</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-gray-400 text-[11px]">생년월일 (Birthdate)</label>
                      <input
                        type="date"
                        value={birthdate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBirthdate(val);
                          if (val) {
                            setAge(calculateAge(val));
                          }
                        }}
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white transition-colors"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[11px]">신장 (cm)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                        required
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white transition-colors"
                        placeholder="185"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[11px]">체중 (kg)</label>
                      <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                        required
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white transition-colors"
                        placeholder="85"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[11px]">윙스팬/팔길이 (cm)</label>
                      <input
                        type="number"
                        value={wingspan}
                        onChange={(e) => setWingspan(parseFloat(e.target.value) || 0)}
                        required
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white transition-colors"
                        placeholder="190"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-gray-400 text-[11px]">나이 (만 세)</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                        required
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-white font-mono focus:outline-none focus:border-white transition-colors"
                        placeholder="24"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-gray-400 text-[11px]">최고 구속 (km/h)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={maxVelocity}
                      onChange={(e) => setMaxVelocity(parseFloat(e.target.value) || 0)}
                      required
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-1.5 text-amber-300 font-extrabold font-mono focus:outline-none focus:border-white transition-colors"
                      placeholder="153.2"
                    />
                  </div>
                </div>

                {/* Save & Cancel Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/15 text-gray-300 font-bold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>취소</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-white hover:bg-gray-200 text-black font-extrabold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>저장하기</span>
                  </button>
                </div>
              </form>
            )}

            {/* Logout Action */}
            <div className="pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold py-2.5 rounded-full text-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
