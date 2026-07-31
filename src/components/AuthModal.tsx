import React, { useState, useEffect } from 'react';
import { BaseballIcon } from './BaseballIcon';
import { UserAccount, AthleteAssessment } from '../types';
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  X,
  Loader2,
  UserPlus,
  User,
  Shield,
  Activity,
  Dumbbell,
  Zap,
  Check,
  ChevronRight,
  ChevronLeft,
  Target,
  Sparkles,
  Edit3,
  HelpCircle,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

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
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSignupStep(1);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('saved_user_email') || '';
  });
  const [password, setPassword] = useState(() => {
    return localStorage.getItem('saved_user_password') || '';
  });
  const [rememberEmail, setRememberEmail] = useState<boolean>(() => {
    return !!localStorage.getItem('saved_user_email');
  });
  const [rememberPassword, setRememberPassword] = useState<boolean>(() => {
    return !!localStorage.getItem('saved_user_password');
  });
  const [autoLogin, setAutoLogin] = useState<boolean>(() => {
    return localStorage.getItem('auto_login_enabled') !== 'false';
  });

  // Sign Up Step 1: Basic Info
  const [name, setName] = useState('');
  const [number, setNumber] = useState<number | ''>(18);
  const [team, setTeam] = useState('Bullpen Stars');
  const [throwingArm, setThrowingArm] = useState<'RHP' | 'LHP' | 'SWITCH'>('RHP');
  const [role, setRole] = useState<string>('미정 (Unassigned)');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('');

  // Physical specs
  const [height, setHeight] = useState<number | ''>(183);
  const [weight, setWeight] = useState<number | ''>(82);
  const [wingspan, setWingspan] = useState<number | ''>(188);
  const [maxVelocity, setMaxVelocity] = useState<number | ''>(148);
  const [age, setAge] = useState<number | ''>(22);

  // Sign Up Step 2: Assessment Questions
  const [painChoice, setPainChoice] = useState<string>('통증 없음 (최상의 피칭 컨디션)');
  const [painCustomText, setPainCustomText] = useState<string>('');

  const [goalChoice, setGoalChoice] = useState<string>('구속 향상 (Max Velocity 3~5km/h Up)');
  const [goalCustomText, setGoalCustomText] = useState<string>('');

  const [freqChoice, setFreqChoice] = useState<string>('주 3~4회 (정기 훈련 및 기술 불펜)');
  const [freqCustomText, setFreqCustomText] = useState<string>('');

  const [focusChoice, setFocusChoice] = useState<string>('바이오매커니즘 & 투구 폼 메커니즘 교정');
  const [focusCustomText, setFocusCustomText] = useState<string>('');

  const [equipmentChoice, setEquipmentChoice] = useState<string>('스톱워치 & 주관적 관찰 피드백');
  const [equipmentCustomText, setEquipmentCustomText] = useState<string>('');

  // Main pitch types selection
  const pitchTypeOptions = [
    '포심 패스트볼',
    '투심 / 싱커',
    '슬라이더',
    '커터',
    '체인지업',
    '커브',
    '스플리터 / 포크',
    '기타 (직접 입력)',
  ];
  const [selectedPitchTypes, setSelectedPitchTypes] = useState<string[]>(['포심 패스트볼', '슬라이더']);
  const [pitchCustomText, setPitchCustomText] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const togglePitchType = (pt: string) => {
    if (selectedPitchTypes.includes(pt)) {
      if (selectedPitchTypes.length === 1 && pt !== '기타 (직접 입력)') return;
      setSelectedPitchTypes(selectedPitchTypes.filter((t) => t !== pt));
    } else {
      setSelectedPitchTypes([...selectedPitchTypes, pt]);
    }
  };

  const handleNextSignupStep = () => {
    setErrorMessage(null);
    if (signupStep === 1) {
      if (!name.trim()) {
        setErrorMessage('선수 성명을 입력해주세요.');
        return;
      }
      if (!signupEmail.trim() || !signupPassword.trim()) {
        setErrorMessage('이메일과 비밀번호를 입력해주세요.');
        return;
      }
      if (signupPassword.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (signupPassword !== signupPasswordConfirm) {
        setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      setSignupStep(2);
    } else if (signupStep === 2) {
      // Check custom text inputs if '기타 (직접 입력)' selected
      if (painChoice === '기타 (직접 입력)' && !painCustomText.trim()) {
        setErrorMessage('통증 상태 기타 내용을 직접 입력해주세요.');
        return;
      }
      if (goalChoice === '기타 (직접 입력)' && !goalCustomText.trim()) {
        setErrorMessage('시즌 목표 기타 내용을 직접 입력해주세요.');
        return;
      }
      if (freqChoice === '기타 (직접 입력)' && !freqCustomText.trim()) {
        setErrorMessage('훈련 빈도 기타 내용을 직접 입력해주세요.');
        return;
      }
      if (focusChoice === '기타 (직접 입력)' && !focusCustomText.trim()) {
        setErrorMessage('중점 훈련 분야 기타 내용을 직접 입력해주세요.');
        return;
      }
      setSignupStep(3);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);

    if (rememberEmail) {
      localStorage.setItem('saved_user_email', email.trim());
    } else {
      localStorage.removeItem('saved_user_email');
    }

    if (rememberPassword) {
      localStorage.setItem('saved_user_password', password);
    } else {
      localStorage.removeItem('saved_user_password');
    }

    if (autoLogin) {
      localStorage.setItem('auto_login_enabled', 'true');
    } else {
      localStorage.setItem('auto_login_enabled', 'false');
    }

    try {
      // 1. Try local registration record first
      const localRegRaw = localStorage.getItem(`registered_user_${email.trim().toLowerCase()}`);
      if (localRegRaw) {
        try {
          const localReg = JSON.parse(localRegRaw);
          if (localReg && localReg.password === password.trim()) {
            onLoginSuccess(localReg.userData);
            onClose();
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // ignore
        }
      }

      // 2. Supabase Auth sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        throw error;
      }

      const sbUser = data.user;
      const metadata = sbUser?.user_metadata || {};

      let profileData = null;
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sbUser?.id)
          .single();
        if (prof) profileData = prof;
      } catch (pErr) {
        console.log('Profile select log:', pErr);
      }

      const userData: UserAccount = {
        id: sbUser?.id || 'usr_' + Date.now(),
        email: sbUser?.email || email.trim(),
        name: profileData?.name || metadata.name || '투수',
        number: profileData?.number || metadata.number || 18,
        team: profileData?.team || metadata.team || 'Bullpen Stars',
        throwingArm: profileData?.throwing_arm || metadata.throwingArm || 'RHP',
        role: profileData?.role || metadata.role || '선발 (SP)',
        height: profileData?.height || metadata.height || 183,
        weight: profileData?.weight || metadata.weight || 82,
        wingspan: profileData?.wingspan || metadata.wingspan || 188,
        joinedDate: sbUser?.created_at ? sbUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
        maxVelocity: profileData?.max_velocity || metadata.maxVelocity || 148,
        assessment: metadata.assessment,
      };

      onLoginSuccess(userData);
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      let msg = err?.message || '인증 처리 중 오류가 발생했습니다.';
      if (msg.includes('Invalid login credentials')) {
        msg = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (msg.includes('Email not confirmed')) {
        msg = '이메일 인증이 완료되지 않았습니다. 수신함에서 발송된 인증 링크를 확인해 주세요.';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    setIsLoading(true);

    const finalPain = painChoice === '기타 (직접 입력)' ? painCustomText.trim() || '기타 작성' : painChoice;
    const finalGoal = goalChoice === '기타 (직접 입력)' ? goalCustomText.trim() || '기타 작성' : goalChoice;
    const finalFreq = freqChoice === '기타 (직접 입력)' ? freqCustomText.trim() || '기타 작성' : freqChoice;
    const finalFocus = focusChoice === '기타 (직접 입력)' ? focusCustomText.trim() || '기타 작성' : focusChoice;

    let finalPitchTypes = selectedPitchTypes.filter((p) => p !== '기타 (직접 입력)');
    if (selectedPitchTypes.includes('기타 (직접 입력)') && pitchCustomText.trim()) {
      finalPitchTypes.push(pitchCustomText.trim());
    }
    if (finalPitchTypes.length === 0) finalPitchTypes = ['포심 패스트볼', '슬라이더'];

    const assessmentData: AthleteAssessment = {
      painStatus: finalPain,
      seasonGoal: finalGoal,
      weeklyTrainingFreq: finalFreq,
      preferredTrainingFocus: finalFocus,
      mainPitchTypes: finalPitchTypes,
    };

    const userId = 'usr_' + Date.now();
    const userData: UserAccount = {
      id: userId,
      email: signupEmail.trim(),
      name: name.trim() || '투수',
      number: typeof number === 'number' ? number : 18,
      team: team.trim() || 'Bullpen Stars',
      throwingArm,
      role,
      height: typeof height === 'number' ? height : 183,
      weight: typeof weight === 'number' ? weight : 82,
      wingspan: typeof wingspan === 'number' ? wingspan : 188,
      age: typeof age === 'number' ? age : 22,
      joinedDate: new Date().toISOString().split('T')[0],
      maxVelocity: typeof maxVelocity === 'number' ? maxVelocity : 148,
      assessment: assessmentData,
    };

    // Save registration locally for zero-delay registration
    try {
      const regRecord = {
        email: signupEmail.trim().toLowerCase(),
        password: signupPassword.trim(),
        userData,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem(`registered_user_${signupEmail.trim().toLowerCase()}`, JSON.stringify(regRecord));
      localStorage.setItem('saved_user_email', signupEmail.trim());
      localStorage.setItem('bullpen_user_account', JSON.stringify(userData));
    } catch (lErr) {
      console.error('Local save error:', lErr);
    }

    // Background sync with Supabase
    try {
      const { data: sbData } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword.trim(),
        options: {
          data: {
            name: userData.name,
            number: userData.number,
            team: userData.team,
            throwingArm: userData.throwingArm,
            role: userData.role,
            height: userData.height,
            weight: userData.weight,
            wingspan: userData.wingspan,
            maxVelocity: userData.maxVelocity,
            assessment: assessmentData,
          },
        },
      });

      if (sbData?.user?.id) {
        userData.id = sbData.user.id;
        localStorage.setItem('bullpen_user_account', JSON.stringify(userData));
        try {
          await supabase.from('profiles').upsert({
            id: sbData.user.id,
            email: userData.email,
            name: userData.name,
            number: userData.number,
            team: userData.team,
            throwing_arm: userData.throwingArm,
            role: userData.role,
            height: userData.height,
            weight: userData.weight,
            wingspan: userData.wingspan,
            max_velocity: userData.maxVelocity,
            updated_at: new Date().toISOString(),
          });
        } catch (pErr) {
          console.log('Profile sync log:', pErr);
        }
      }
    } catch (sbErr) {
      console.log('Supabase signup sync:', sbErr);
    } finally {
      setIsLoading(false);
    }

    // Done! Switch user to live dashboard & close modal
    onLoginSuccess(userData);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-hidden"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#1c1c1e]/95 border border-white/20 rounded-[28px] text-white shadow-2xl backdrop-blur-3xl relative flex flex-col my-auto transition-all duration-300 max-h-[88vh] w-full max-w-4xl p-6 sm:p-8"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors z-20"
              title="창 닫기"
            >
              <X className="w-4 h-4" />
            </button>

            {/* MODAL HEADER */}
            <div className="shrink-0 pb-4 border-b border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shadow-md shrink-0">
                  <BaseballIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Bullpen Log {mode === 'login' ? '선수 로그인' : '선수 등록 & 회원가입'}
                  </h2>
                  {mode === 'signup' && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      피칭 바이오매커니즘 및 피로도 분석을 위한 선수 정보 작성
                    </p>
                  )}
                </div>
              </div>

              {/* Mode Switcher Buttons with Glassmorphic Reflection */}
              <div className="flex bg-white/10 p-1 rounded-full border border-white/15 max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'login'
                      ? 'bg-white text-black shadow-md font-black'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span>로그인</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 relative overflow-hidden ${
                    mode === 'signup'
                      ? 'bg-emerald-600/85 hover:bg-emerald-600 backdrop-blur-md border border-emerald-400/35 text-white shadow-md shadow-emerald-950/40 font-black relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/12 before:to-transparent before:pointer-events-none'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-200 relative z-10" />
                  <span className="relative z-10">선수 등록 회원가입</span>
                </button>
              </div>

              {/* Step indicator bar when in Sign Up mode */}
              {mode === 'signup' && (
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
                  <div
                    onClick={() => signupStep > 1 && setSignupStep(1)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition cursor-pointer ${
                      signupStep === 1
                        ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200 font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>인적사항 & 신체스펙</span>
                  </div>

                  <div className="h-[1px] bg-white/10 flex-1 hidden sm:block"></div>

                  <div
                    onClick={() => signupStep > 2 && setSignupStep(2)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition cursor-pointer ${
                      signupStep === 2
                        ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200 font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>선수 상태 & 훈련 평가</span>
                  </div>

                  <div className="h-[1px] bg-white/10 flex-1 hidden sm:block"></div>

                  <div
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition ${
                      signupStep === 3
                        ? 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200 font-bold shadow-sm'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-emerald-500/30 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>최종 확인 & 완료</span>
                  </div>
                </div>
              )}
            </div>

            {/* ERROR DISPLAY */}
            {errorMessage && (
              <div className="my-3 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium shrink-0 animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* SCROLLABLE INNER BODY */}
            <div className="overflow-y-auto pr-1 flex-1 my-3 space-y-6 text-xs sm:text-sm">
              {mode === 'login' ? (
                /* LOGIN MODE FORM - Spacious 2-Column Responsive Layout */
                <form onSubmit={handleLoginSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4">
                  {/* Left Column: Welcome & Info Banner */}
                  <div className="md:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-7 space-y-5 flex flex-col justify-between h-full">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-md">
                        <BaseballIcon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                        투수 바이오매커니즘 &<br />투구 로그 통합 시스템
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        계정에 로그인하여 최근 피칭 세션 데이터, 구속 변화 트렌드, 부하 지수(ACWR) 및 맞춤형 케어 가이드를 확인하세요.
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-gray-300">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span>실시간 피칭 트래킹 데이터 동기화</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span>선수 상태 및 통증 위험도 자동 모니터링</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Spacious Form Fields */}
                  <div className="md:col-span-7 space-y-6 px-1 sm:px-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-200 tracking-wide">이메일 주소</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-4 top-4 text-gray-400" />
                        <input
                          type="email"
                          required
                          placeholder="pitcher@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-200 tracking-wide">비밀번호</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-4 top-4 text-gray-400" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-white/5 border border-white/15 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-gray-300 pt-2 px-1 select-none">
                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={rememberEmail}
                          onChange={(e) => setRememberEmail(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                        />
                        <span>아이디 기억하기</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={rememberPassword}
                          onChange={(e) => setRememberPassword(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                        />
                        <span>비밀번호 저장</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          checked={autoLogin}
                          onChange={(e) => setAutoLogin(e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                        />
                        <span>자동 로그인</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white hover:bg-gray-100 disabled:opacity-50 text-black font-extrabold py-4 rounded-full text-sm transition-all duration-200 shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 mt-4"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>로그인 처리 중...</span>
                        </>
                      ) : (
                        <>
                          <span className="font-black">로그인하기</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* SIGN UP WIZARD STEPS */
                <div>
                  {/* STEP 1: BASIC ACCOUNT & PHYSICAL METRICS */}
                  {signupStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-5"
                    >
                      {/* Left Side: Account & Identity */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                          <User className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-bold text-white text-xs sm:text-sm">1. 계정 및 선수 기본 정보</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">선수 성명 *</label>
                            <input
                              type="text"
                              required
                              placeholder="홍길동"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">등번호 (#) *</label>
                            <input
                              type="number"
                              required
                              placeholder="18"
                              value={number}
                              onChange={(e) => setNumber(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-medium">소속 팀명</label>
                          <input
                            type="text"
                            placeholder="Bullpen Stars / 서울 자이언츠"
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">투구 손</label>
                            <select
                              value={throwingArm}
                              onChange={(e) => setThrowingArm(e.target.value as any)}
                              className="w-full bg-[#2c2c2e] border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                            >
                              <option value="RHP">우투 (RHP)</option>
                              <option value="LHP">좌투 (LHP)</option>
                              <option value="SWITCH">양투 (Switch)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">주 보직 (선택사항)</label>
                            <select
                              value={role}
                              onChange={(e) => setRole(e.target.value)}
                              className="w-full bg-[#2c2c2e] border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                            >
                              <option value="선발 (SP)">선발 (SP)</option>
                              <option value="불펜 (RP)">불펜 (RP)</option>
                              <option value="미정 (Unassigned)">미정 (Unassigned)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-gray-300 font-medium">이메일 계정 *</label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                            <input
                              type="email"
                              required
                              placeholder="pitcher@example.com"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">비밀번호 *</label>
                            <input
                              type="password"
                              required
                              minLength={6}
                              placeholder="6자 이상"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">비밀번호 확인 *</label>
                            <input
                              type="password"
                              required
                              minLength={6}
                              placeholder="동일 비밀번호"
                              value={signupPasswordConfirm}
                              onChange={(e) => setSignupPasswordConfirm(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right Side: Biometrics & Specs */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-bold text-white text-xs sm:text-sm">2. 신체 스펙 & 최고 구속</h3>
                        </div>

                        <p className="text-[11px] text-gray-400">
                          정확한 ACWR 피로도 및 바이오매커니즘 부하 추정을 위해 신체 계측 수치를 입력하세요.
                        </p>

                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">신장 (cm)</label>
                            <input
                              type="number"
                              placeholder="183"
                              value={height}
                              onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">체중 (kg)</label>
                            <input
                              type="number"
                              placeholder="82"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">윙스팬 (cm)</label>
                            <input
                              type="number"
                              placeholder="188"
                              value={wingspan}
                              onChange={(e) => setWingspan(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">연령 (만 나이)</label>
                            <input
                              type="number"
                              placeholder="22"
                              value={age}
                              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 pt-2">
                          <label className="text-xs text-gray-300 font-medium flex items-center justify-between">
                            <span>최고구속 (Max Velocity) *</span>
                            <span className="text-[10px] text-emerald-400 font-bold">km/h</span>
                          </label>
                          <input
                            type="number"
                            placeholder="148"
                            value={maxVelocity}
                            onChange={(e) => setMaxVelocity(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2.5 text-sm font-bold text-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                          />
                        </div>

                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-200/90 leading-relaxed">
                          ✨ <strong>Bullpen Log 스마트 알고리즘</strong>:
                          입력하신 신체 정보와 구속은 개인화된 팔꿈치 부하지수 및 안전 투구수 산정에 반영됩니다.
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: ATHLETE ASSESSMENT QUESTIONS WITH '기타 (직접 입력)' */}
                  {signupStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                          <Sparkles className="w-4 h-4 text-emerald-400" />
                          <span>선수 맞춤형 상태 및 훈련 목적 설문</span>
                        </div>
                        <span className="text-[10px] text-gray-400">모든 항목은 '기타 (직접 입력)' 선택 시 맞춤 답변 가능</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Q1: PAIN STATUS */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold">Q1</span>
                            <span>현재 팔/어깨 통증 및 컨디션 상태</span>
                          </label>
                          <div className="space-y-1.5">
                            {[
                              '통증 없음 (최상의 피칭 컨디션)',
                              '약간의 어깨/팔꿈치 뻐근함 (피로 누적)',
                              '어깨 회전근개 / 찌릿한 불편함',
                              '팔꿈치 내측 (UCL) 관절 통증',
                              '수술 후 재활 및 투구 복귀 단계',
                              '기타 (직접 입력)',
                            ].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition ${
                                  painChoice === opt
                                    ? 'bg-emerald-500/20 border-emerald-400/50 text-white font-bold'
                                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="painChoice"
                                  checked={painChoice === opt}
                                  onChange={() => setPainChoice(opt)}
                                  className="accent-emerald-400"
                                />
                                <span className="flex-1">{opt}</span>
                              </label>
                            ))}

                            {/* Dynamic Custom Text Input for Q1 */}
                            {painChoice === '기타 (직접 입력)' && (
                              <div className="pt-1">
                                <input
                                  type="text"
                                  placeholder="어깨/팔 통증 상태를 직접 상세히 적어주세요..."
                                  value={painCustomText}
                                  onChange={(e) => setPainCustomText(e.target.value)}
                                  className="w-full bg-white/10 border border-emerald-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Q2: SEASON GOAL */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold">Q2</span>
                            <span>이번 시즌 주요 목표</span>
                          </label>
                          <div className="space-y-1.5">
                            {[
                              '구속 향상 (Max Velocity 3~5km/h Up)',
                              '제구력 및 구위 커맨드 안정화',
                              '부상 방지 및 이닝 제한 / 피치 카운트 관리',
                              '구종 다양화 및 신구종 (변화구) 연마',
                              '실전 경기 출전 확대 및 경기력 유지',
                              '기타 (직접 입력)',
                            ].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition ${
                                  goalChoice === opt
                                    ? 'bg-emerald-500/20 border-emerald-400/50 text-white font-bold'
                                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="goalChoice"
                                  checked={goalChoice === opt}
                                  onChange={() => setGoalChoice(opt)}
                                  className="accent-emerald-400"
                                />
                                <span className="flex-1">{opt}</span>
                              </label>
                            ))}

                            {/* Dynamic Custom Text Input for Q2 */}
                            {goalChoice === '기타 (직접 입력)' && (
                              <div className="pt-1">
                                <input
                                  type="text"
                                  placeholder="시즌 개인 목표를 직접 작성해주세요..."
                                  value={goalCustomText}
                                  onChange={(e) => setGoalCustomText(e.target.value)}
                                  className="w-full bg-white/10 border border-emerald-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Q3: WEEKLY FREQUENCY */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold">Q3</span>
                            <span>주간 불펜 & 피칭 세션 빈도</span>
                          </label>
                          <div className="space-y-1.5">
                            {[
                              '주 1~2회 (가벼운 불펜 & 캐치볼 세션)',
                              '주 3~4회 (정기 훈련 및 기술 불펜)',
                              '주 5회 이상 (고강도 불펜 & 정기 투구)',
                              '주말 리그 / 경기 위주 출전',
                              '기타 (직접 입력)',
                            ].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition ${
                                  freqChoice === opt
                                    ? 'bg-emerald-500/20 border-emerald-400/50 text-white font-bold'
                                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="freqChoice"
                                  checked={freqChoice === opt}
                                  onChange={() => setFreqChoice(opt)}
                                  className="accent-emerald-400"
                                />
                                <span className="flex-1">{opt}</span>
                              </label>
                            ))}

                            {freqChoice === '기타 (직접 입력)' && (
                              <div className="pt-1">
                                <input
                                  type="text"
                                  placeholder="주간 훈련 주기를 적어주세요..."
                                  value={freqCustomText}
                                  onChange={(e) => setFreqCustomText(e.target.value)}
                                  className="w-full bg-white/10 border border-emerald-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Q4: PREFERRED FOCUS */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold">Q4</span>
                            <span>중점 훈련 및 피칭 리포트 분야</span>
                          </label>
                          <div className="space-y-1.5">
                            {[
                              '바이오매커니즘 & 투구 폼 메커니즘 교정',
                              '팔 보호 & 보강 운동 (Arm Care / Plyo Ball)',
                              '웨이트 트레이닝 & 근력/순발력 강화',
                              '투구수 관리 & 피로도 모니터링 (ACWR)',
                              '기타 (직접 입력)',
                            ].map((opt) => (
                              <label
                                key={opt}
                                className={`flex items-center gap-2 p-2 rounded-xl text-xs cursor-pointer border transition ${
                                  focusChoice === opt
                                    ? 'bg-emerald-500/20 border-emerald-400/50 text-white font-bold'
                                    : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="focusChoice"
                                  checked={focusChoice === opt}
                                  onChange={() => setFocusChoice(opt)}
                                  className="accent-emerald-400"
                                />
                                <span className="flex-1">{opt}</span>
                              </label>
                            ))}

                            {focusChoice === '기타 (직접 입력)' && (
                              <div className="pt-1">
                                <input
                                  type="text"
                                  placeholder="중점 관리 영역을 적어주세요..."
                                  value={focusCustomText}
                                  onChange={(e) => setFocusCustomText(e.target.value)}
                                  className="w-full bg-white/10 border border-emerald-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Q5: PITCH TYPES MULTI SELECT */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] flex items-center justify-center font-bold">Q5</span>
                          <span>주요 보유 구종 선택 (복수 선택 가능)</span>
                        </label>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {pitchTypeOptions.map((pt) => {
                            const isSelected = selectedPitchTypes.includes(pt);
                            return (
                              <button
                                key={pt}
                                type="button"
                                onClick={() => togglePitchType(pt)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                                  isSelected
                                    ? 'bg-emerald-400 text-black border-emerald-300 font-bold shadow-md'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-black" />}
                                <span>{pt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Pitch Input */}
                        {selectedPitchTypes.includes('기타 (직접 입력)') && (
                          <div className="pt-2">
                            <input
                              type="text"
                              placeholder="보유 중인 특수 구종명을 입력해주세요 (예: 스위퍼, 스플리터 등)..."
                              value={pitchCustomText}
                              onChange={(e) => setPitchCustomText(e.target.value)}
                              className="w-full bg-white/10 border border-emerald-400/50 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: SUMMARY & FINAL CONFIRMATION */}
                  {signupStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold border-b border-emerald-500/20 pb-2">
                          <Check className="w-5 h-5 text-emerald-400" />
                          <span>작성된 선수 프로필 및 설문 확인</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                            <span className="text-gray-400 text-[10px]">선수명</span>
                            <p className="font-bold text-white text-sm">{name} #{number}</p>
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                            <span className="text-gray-400 text-[10px]">소속팀</span>
                            <p className="font-bold text-white text-sm">{team}</p>
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                            <span className="text-gray-400 text-[10px]">투구 / 보직</span>
                            <p className="font-bold text-emerald-300 text-sm">{throwingArm} · {role}</p>
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                            <span className="text-gray-400 text-[10px]">신체 / 최고구속</span>
                            <p className="font-bold text-emerald-300 text-sm">{height}cm / {maxVelocity}km/h</p>
                          </div>
                        </div>

                        <div className="bg-black/30 p-3 rounded-xl border border-white/10 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-medium">컨디션:</span>
                            <span className="text-white font-bold">{painChoice === '기타 (직접 입력)' ? painCustomText : painChoice}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-medium">시즌 목표:</span>
                            <span className="text-white font-bold">{goalChoice === '기타 (직접 입력)' ? goalCustomText : goalChoice}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-medium">훈련 빈도:</span>
                            <span className="text-white font-bold">{freqChoice === '기타 (직접 입력)' ? freqCustomText : freqChoice}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400 font-medium">주요 구종:</span>
                            <span className="text-emerald-300 font-bold">
                              {selectedPitchTypes.filter((p) => p !== '기타 (직접 입력)').join(', ')}
                              {selectedPitchTypes.includes('기타 (직접 입력)') && pitchCustomText ? `, ${pitchCustomText}` : ''}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 text-center pt-1">
                          위 정보로 선수 등록을 마치고 <strong>Bullpen Log 대시보드</strong>로 진입합니다.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* MODAL FOOTER BUTTONS */}
            {mode === 'signup' && (
              <div className="shrink-0 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                {signupStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setSignupStep((prev) => (prev - 1) as 1 | 2)}
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>이전 단계</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {signupStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNextSignupStep}
                    className="px-7 py-3 rounded-full bg-emerald-600/85 hover:bg-emerald-600 backdrop-blur-md border border-emerald-400/35 text-white text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-950/40 active:scale-95 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/12 before:to-transparent before:pointer-events-none"
                  >
                    <span className="relative z-10">다음 단계로</span>
                    <ChevronRight className="w-4 h-4 relative z-10" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSignupSubmit()}
                    disabled={isLoading}
                    className="px-8 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 backdrop-blur-md border border-emerald-400/40 text-white text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-95 disabled:opacity-50 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/15 before:to-transparent before:pointer-events-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-100 relative z-10" />
                        <span className="relative z-10">선수 정보 등록 중...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 text-emerald-200 relative z-10" />
                        <span className="relative z-10">선수 등록 완료 & 대시보드 입장</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


