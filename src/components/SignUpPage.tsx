import React, { useState } from 'react';
import { UserAccount, AthleteAssessment } from '../types';
import { calculateAge } from '../lib/utils';
import { BaseballIcon } from './BaseballIcon';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  User,
  Mail,
  Lock,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Activity,
  Target,
  Dumbbell,
  Sparkles,
  HelpCircle,
  Edit3
} from 'lucide-react';
import { motion } from 'motion/react';

interface SignUpPageProps {
  onReturnHome: () => void;
  onOpenLogin: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onReturnHome,
  onOpenLogin,
  onLoginSuccess,
}) => {
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailSentNotice, setEmailSentNotice] = useState<string | null>(null);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [number, setNumber] = useState<number | ''>(18);
  const [team, setTeam] = useState('Bullpen Stars');
  const [throwingArm, setThrowingArm] = useState<'RHP' | 'LHP' | 'SWITCH'>('RHP');
  const [role, setRole] = useState<string>('미정 (Unassigned)');

  // Step 2: Specs & Pitch types
  const [height, setHeight] = useState<number | ''>(183);
  const [weight, setWeight] = useState<number | ''>(82);
  const [wingspan, setWingspan] = useState<number | ''>(188);
  const [maxVelocity, setMaxVelocity] = useState<number | ''>(148);
  const [birthdate, setBirthdate] = useState<string>('2002-01-15');
  const [age, setAge] = useState<number | ''>(22);
  const [selectedPitchTypes, setSelectedPitchTypes] = useState<string[]>(['포심 직구', '슬라이더', '커브']);

  // Step 3: Athlete Assessment Questions with "Custom" (기타) options
  const [painChoice, setPainChoice] = useState<string>('통증 없음 (정상)');
  const [painCustomText, setPainCustomText] = useState<string>('');

  const [goalChoice, setGoalChoice] = useState<string>('구속 3~5km/h 증속 및 하체 회전력 강화');
  const [goalCustomText, setGoalCustomText] = useState<string>('');

  const [freqChoice, setFreqChoice] = useState<string>('주 3~4회 정기 훈련 (표준 세션)');
  const [freqCustomText, setFreqCustomText] = useState<string>('');

  const [focusChoice, setFocusChoice] = useState<string>('하체 폭발력 & 피칭 메커니즘');
  const [focusCustomText, setFocusCustomText] = useState<string>('');

  const pitchTypeOptions = ['포심 직구', '투심 직구', '슬라이더', '체인지업', '커브', '커터', '스플리터/포크', '너클커브'];

  const togglePitchType = (pt: string) => {
    if (selectedPitchTypes.includes(pt)) {
      if (selectedPitchTypes.length === 1) return;
      setSelectedPitchTypes(selectedPitchTypes.filter((t) => t !== pt));
    } else {
      setSelectedPitchTypes([...selectedPitchTypes, pt]);
    }
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    if (signupStep === 1) {
      if (!name.trim()) {
        setErrorMessage('선수 성명을 입력해주세요.');
        return;
      }
      if (!email.trim() || !password.trim()) {
        setErrorMessage('이메일과 비밀번호를 입력해주세요.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('비밀번호는 최소 6자 이상이어야 합니다.');
        return;
      }
      if (password !== passwordConfirm) {
        setErrorMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
      }
      setSignupStep(2);
    } else if (signupStep === 2) {
      if (!height || !weight || !maxVelocity) {
        setErrorMessage('신장, 체중, 최고 구속 정보를 모두 입력해주세요.');
        return;
      }
      setSignupStep(3);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    if (signupStep > 1) {
      setSignupStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailSentNotice(null);

    // Resolve final question strings (either preset choice or custom user text)
    const finalPain = painChoice === '기타 (직접 입력)' ? (painCustomText.trim() || '기타 상세 작성') : painChoice;
    const finalGoal = goalChoice === '기타 (직접 입력)' ? (goalCustomText.trim() || '기타 시즌 목표') : goalChoice;
    const finalFreq = freqChoice === '기타 (직접 입력)' ? (freqCustomText.trim() || '기타 훈련 주기') : freqChoice;
    const finalFocus = focusChoice === '기타 (직접 입력)' ? (focusCustomText.trim() || '기타 집중 분야') : focusChoice;

    setIsLoading(true);

    const assessmentData: AthleteAssessment = {
      painStatus: finalPain,
      seasonGoal: finalGoal,
      weeklyTrainingFreq: finalFreq,
      preferredTrainingFocus: finalFocus,
      mainPitchTypes: selectedPitchTypes.length > 0 ? selectedPitchTypes : ['포심 패스트볼', '슬라이더'],
    };

    const userId = 'usr_' + Date.now();

    const userData: UserAccount = {
      id: userId,
      email: email.trim(),
      name: name.trim() || '투수',
      number: typeof number === 'number' ? number : 18,
      team: team.trim() || 'Bullpen Stars',
      throwingArm,
      role,
      height: typeof height === 'number' ? height : 183,
      weight: typeof weight === 'number' ? weight : 82,
      wingspan: typeof wingspan === 'number' ? wingspan : 188,
      age: typeof age === 'number' ? age : calculateAge(birthdate),
      birthdate: birthdate || '2002-01-15',
      maxVelocity: typeof maxVelocity === 'number' ? maxVelocity : 148,
      joinedDate: new Date().toISOString().split('T')[0],
      assessment: assessmentData,
    };

    // 1. Save user account locally for instant & reliable registration
    try {
      const regRecord = {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        userData,
        registeredAt: new Date().toISOString(),
      };
      localStorage.setItem(`registered_user_${email.trim().toLowerCase()}`, JSON.stringify(regRecord));
      localStorage.setItem('saved_user_email', email.trim());
      localStorage.setItem('bullpen_user_account', JSON.stringify(userData));
    } catch (localErr) {
      console.error('Local save error:', localErr);
    }

    // 2. Sync with Supabase Auth in background (if configured/online)
    try {
      const { data: sbData } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim() || '투수',
            number: typeof number === 'number' ? number : 18,
            team: team.trim() || 'Bullpen Stars',
            throwingArm,
            role,
            height: typeof height === 'number' ? height : 183,
            weight: typeof weight === 'number' ? weight : 82,
            wingspan: typeof wingspan === 'number' ? wingspan : 188,
            maxVelocity: typeof maxVelocity === 'number' ? maxVelocity : 148,
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
          console.log('Profile upsert info:', pErr);
        }
      }
    } catch (sbErr) {
      console.log('Supabase sync notice:', sbErr);
    } finally {
      setIsLoading(false);
    }

    // 3. Immediately complete registration & seamlessly transfer user to live dashboard!
    onLoginSuccess(userData);
  };

  return (
    <div className="min-h-screen pt-4 sm:pt-6 pb-20 px-4 sm:px-6 md:px-8 max-w-4xl mx-auto text-white space-y-8">
      {/* Top Header & Navigation Return Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <button
            onClick={onReturnHome}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-gray-200 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>돌아가기</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bullpen Log 선수 등록 회원가입
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            투구 분석, 부하 조절 및 맞춤형 피칭 케어를 시작하기 위해 정밀 인적사항 및 선수 스펙을 작성하세요.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs text-gray-400">이미 계정이 있으신가요?</span>
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 text-xs font-extrabold shadow-md transition cursor-pointer"
          >
            로그인하기
          </button>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="bg-[#1c1c1e]/90 border border-white/15 rounded-[28px] p-6 sm:p-8 md:p-10 shadow-2xl space-y-8 backdrop-blur-3xl">
        {/* Step Progress Bar */}
        <div className="space-y-3 border-b border-white/10 pb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
            <span className="text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{signupStep === 1 ? '1단계: 계정 & 기본 프로필' : signupStep === 2 ? '2단계: 신체 & 피칭 스펙' : '3단계: 세부 선수 진단 설문'}</span>
            </span>
            <span className="text-gray-400 font-mono">STEP {signupStep} / 3</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${signupStep >= 1 ? 'bg-emerald-400' : 'bg-white/10'}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${signupStep >= 2 ? 'bg-emerald-400' : 'bg-white/10'}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${signupStep >= 3 ? 'bg-emerald-400' : 'bg-white/10'}`} />
          </div>
        </div>

        {/* STEP 1: ACCOUNT & BASIC INFORMATION */}
        {signupStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">기본 계정 및 선수 인적사항</h2>
              <p className="text-xs text-gray-400">서비스 이용을 위한 계정 정보와 팀 소속 정보를 작성해 주세요.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">선수 성명 *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="예: 김투수"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">이메일 주소 (아이디) *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="pitcher@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">비밀번호 *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="최소 6자 이상"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">비밀번호 확인 *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                  <input
                    type="password"
                    required
                    placeholder="비밀번호 재입력"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">등번호 *</label>
                <input
                  type="number"
                  required
                  placeholder="18"
                  value={number}
                  onChange={(e) => setNumber(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">소속 팀명 / 학교 *</label>
                <input
                  type="text"
                  placeholder="예: Bullpen Stars"
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">주 투구 손 *</label>
                <select
                  value={throwingArm}
                  onChange={(e) => setThrowingArm(e.target.value as any)}
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="RHP">우투 (RHP)</option>
                  <option value="LHP">좌투 (LHP)</option>
                  <option value="SWITCH">양투 (Switch)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">주요 보직 역할 (선택사항)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400 cursor-pointer"
                >
                  <option value="선발 (SP)">선발 (SP)</option>
                  <option value="불펜 (RP)">불펜 (RP)</option>
                  <option value="미정 (Unassigned)">미정 (Unassigned)</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PHYSICAL & PITCHING SPECS */}
        {signupStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">체격 신체 측정 및 피칭 구종 스펙</h2>
              <p className="text-xs text-gray-400">투구 바이오매커니즘 및 지표 계산을 위한 정확한 측정값을 입력해 주세요.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">신장 (cm) *</label>
                <input
                  type="number"
                  required
                  placeholder="183"
                  value={height}
                  onChange={(e) => setHeight(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">체중 (kg) *</label>
                <input
                  type="number"
                  required
                  placeholder="82"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">윙스팬 양팔 길이 (cm)</label>
                <input
                  type="number"
                  placeholder="188"
                  value={wingspan}
                  onChange={(e) => setWingspan(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">생년월일 (Birthdate)</label>
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
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">나이 (만)</label>
                <input
                  type="number"
                  placeholder="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">현재 최고 구속 (Max Velocity km/h) *</label>
              <input
                type="number"
                required
                placeholder="예: 148"
                value={maxVelocity}
                onChange={(e) => setMaxVelocity(e.target.value === '' ? '' : parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-gray-300">구사 가능한 실전 구종 선택 (복수 선택 가능)</label>
              <div className="flex flex-wrap gap-2">
                {pitchTypeOptions.map((pt) => {
                  const isSelected = selectedPitchTypes.includes(pt);
                  return (
                    <button
                      type="button"
                      key={pt}
                      onClick={() => togglePitchType(pt)}
                      className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-400 text-black shadow-md'
                          : 'bg-white/5 border border-white/10 text-gray-300 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{pt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: ATHLETE ASSESSMENT QUESTIONNAIRE (UNIFIED SINGLE EMERALD SCHEME WITH "기타 (직접 입력)" AT BOTTOM) */}
        {signupStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">선수 상태 및 맞춤 피칭 진단 설문</h2>
              <p className="text-xs text-gray-400">
                선수의 부상 이력, 목표, 훈련 패턴을 파악하여 최적의 ACWR 리포트 및 트레이닝 가이드를 제공합니다.
              </p>
            </div>

            {/* Questions Container - Single Unified Emerald Palette, Spacious Layout */}
            <div className="space-y-6">
              {/* Q1: Pain Status */}
              <div className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <label className="text-xs sm:text-sm font-extrabold text-white">
                    Q1. 현재 투구 시 팔꿈치나 어깨에 통증 또는 피로감이 있으신가요?
                  </label>
                </div>

                <div className="space-y-2">
                  {[
                    '통증 없음 (정상 수치)',
                    '투구 후 경미한 어깨/팔꿈치 피로감',
                    '팔꿈치 내측 UCL 집중 관리 필요',
                    '어깨 회전근개 / 가동범위 제한 관리 필요',
                    '이전 수술 및 단계적 재활 진행 중',
                    '기타 (직접 입력)',
                  ].map((opt) => {
                    const isSelected = painChoice === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setPainChoice(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom text input if "기타 (직접 입력)" selected */}
                {painChoice === '기타 (직접 입력)' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <div className="relative">
                      <Edit3 className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                      <input
                        type="text"
                        placeholder="통증 상태 또는 주의사항을 직접 입력해주세요."
                        value={painCustomText}
                        onChange={(e) => setPainCustomText(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-400/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Q2: Season Goal */}
              <div className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <label className="text-xs sm:text-sm font-extrabold text-white">
                    Q2. 올 시즌 달성하고자 하는 가장 핵심적인 목표는 무엇인가요?
                  </label>
                </div>

                <div className="space-y-2">
                  {[
                    '구속 3~5km/h 증속 및 하체 회전력 강화',
                    '제구력 및 릴리스 포인트 일정성 확보',
                    '변화구(슬라이더/체인지업) 완성도 향상',
                    '부상 없는 시즌 풀타임 완주',
                    '투구수 관리 및 ACWR 위험 방지',
                    '기타 (직접 입력)',
                  ].map((opt) => {
                    const isSelected = goalChoice === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setGoalChoice(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {goalChoice === '기타 (직접 입력)' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <div className="relative">
                      <Edit3 className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                      <input
                        type="text"
                        placeholder="달성하고자 하는 시즌 목표를 직접 입력해주세요."
                        value={goalCustomText}
                        onChange={(e) => setGoalCustomText(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-400/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Q3: Weekly Training Frequency */}
              <div className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <label className="text-xs sm:text-sm font-extrabold text-white">
                    Q3. 일주일 평균 피칭 & 웨이트 훈련 세션 횟수는 어느 정도인가요?
                  </label>
                </div>

                <div className="space-y-2">
                  {[
                    '주 1~2회 (라이트 트레이닝)',
                    '주 3~4회 정기 훈련 (표준 세션)',
                    '주 5회 이상 (고강도 엘리트 훈련)',
                    '기타 (직접 입력)',
                  ].map((opt) => {
                    const isSelected = freqChoice === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setFreqChoice(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {freqChoice === '기타 (직접 입력)' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <div className="relative">
                      <Edit3 className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                      <input
                        type="text"
                        placeholder="훈련 빈도 및 세션 수치를 직접 입력해주세요."
                        value={freqCustomText}
                        onChange={(e) => setFreqCustomText(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-400/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Q4: Preferred Training Focus */}
              <div className="p-5 sm:p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
                  <label className="text-xs sm:text-sm font-extrabold text-white">
                    Q4. 가장 집중하고 싶은 피칭/트레이닝 케어 분야는 무엇인가요?
                  </label>
                </div>

                <div className="space-y-2">
                  {[
                    '하체 폭발력 & 피칭 메커니즘',
                    '어깨 가동성 & 보강 리커버리',
                    '릴리스 포인트 고정 & 제구 코칭',
                    '구종 다양화 & 구속 모니터링',
                    '기타 (직접 입력)',
                  ].map((opt) => {
                    const isSelected = focusChoice === opt;
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => setFocusChoice(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-sm'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <span>{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-white/30 bg-transparent'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {focusChoice === '기타 (직접 입력)' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="pt-2">
                    <div className="relative">
                      <Edit3 className="w-4 h-4 absolute left-3.5 top-3 text-emerald-400" />
                      <input
                        type="text"
                        placeholder="집중하고자 하는 훈련 분야를 직접 입력해주세요."
                        value={focusCustomText}
                        onChange={(e) => setFocusCustomText(e.target.value)}
                        className="w-full bg-black/60 border border-emerald-400/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Banners & Messages */}
        {emailSentNotice && (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-xs sm:text-sm text-emerald-300 font-medium whitespace-pre-line leading-relaxed">
            ✉️ {emailSentNotice}
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-xs sm:text-sm text-rose-300 font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Bottom Navigation Step Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
          {signupStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전 단계</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onReturnHome}
              className="px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>이전으로</span>
            </button>
          )}

          {signupStep < 3 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-white hover:bg-gray-200 text-black font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>다음 단계 ({signupStep + 1}/3)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-black font-extrabold px-8 py-3.5 rounded-full text-xs sm:text-sm transition-all shadow-xl flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>선수 가입 완료 처리 중...</span>
                </>
              ) : (
                <>
                  <span>선수 등록 완료 & 대시보드 입장</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
