import i18n from '../lib/i18n';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, CheckCircle2, Globe } from 'lucide-react';
import { UserAccount, SubscriptionTier } from '../types';


const t = i18n.t.bind(i18n);

interface OnboardingFlowProps {
  user: UserAccount;
  onComplete: (updatedUser: UserAccount) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete }) => {
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedLang, setSelectedLang] = useState('ko');

  const handleLanguageSelect = () => {
    setStep(2);
  };

  const handleSelectTier = (tier: SubscriptionTier) => {
    onComplete({
      ...user,
      subscriptionTier: tier,
      langPref: selectedLang as 'ko' | 'en' | 'ja'
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950 text-white font-sans overflow-y-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-md p-8 bg-gray-900 border border-white/10 rounded-3xl text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold mb-8">사용하실 언어를 선택해 주세요</h2>
            
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedLang('ko')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all ${selectedLang === 'ko' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <span className="text-lg font-medium text-white">{t('한국어')}</span>
                {selectedLang === 'ko' && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
              </button>
              
              <button 
                onClick={() => setSelectedLang('en')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all ${selectedLang === 'en' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <span className="text-lg font-medium text-white">{t('English')}</span>
                {selectedLang === 'en' && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
              </button>
              
              <button 
                onClick={() => setSelectedLang('ja')}
                className={`w-full flex items-center justify-between px-6 py-4 rounded-xl border-2 transition-all ${selectedLang === 'ja' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/30 bg-white/5'}`}
              >
                <span className="text-lg font-medium text-white">{t('日本語')}</span>
                {selectedLang === 'ja' && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
              </button>
            </div>

            <button
              onClick={handleLanguageSelect}
              className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-colors"
            >
              다음 단계로
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl p-6 min-h-screen flex flex-col items-center justify-center py-12"
          >
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">당신에게 맞는 플랜을 선택하세요</h1>
              <p className="text-gray-400 text-lg">결제는 언제든 해지할 수 있습니다.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* FREE */}
              <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 flex flex-col hover:border-white/30 transition-colors">
                <h3 className="text-xl font-bold text-gray-300 mb-2">무료 (Free)</h3>
                <div className="text-4xl font-bold text-white mb-6">₩0<span className="text-base font-normal text-gray-500">/월</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-gray-500 shrink-0" />
                    기본 피칭 일지 작성
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-gray-500 shrink-0" />
                    간단한 캘린더 조회
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectTier('FREE')}
                  className="w-full py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 font-medium transition-colors"
                >
                  선택하기
                </button>
              </div>

              {/* BEGINNER */}
              <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 flex flex-col hover:border-blue-500/30 transition-colors">
                <h3 className="text-xl font-bold text-blue-400 mb-2">초보 (Beginner)</h3>
                <div className="text-4xl font-bold text-white mb-6">₩9,900<span className="text-base font-normal text-gray-500">/월</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-500 shrink-0" />
                    무료 플랜 모든 기능
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-500 shrink-0" />
                    ACWR 부하 지수 기본 모니터링
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-blue-500 shrink-0" />
                    월 1회 AI 폼 피드백
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectTier('BEGINNER')}
                  className="w-full py-3 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-medium transition-colors"
                >
                  선택하기
                </button>
              </div>

              {/* AMATEUR */}
              <div className="bg-gray-900 border border-white/10 rounded-3xl p-8 flex flex-col hover:border-purple-500/30 transition-colors">
                <h3 className="text-xl font-bold text-purple-400 mb-2">아마추어 (Amateur)</h3>
                <div className="text-4xl font-bold text-white mb-6">₩29,000<span className="text-base font-normal text-gray-500">/월</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-500 shrink-0" />
                    초보 플랜 모든 기능
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-500 shrink-0" />
                    무제한 AI 영상 폼 분석
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-purple-500 shrink-0" />
                    관절 가동성(ROM) 추적
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectTier('AMATEUR')}
                  className="w-full py-3 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 font-medium transition-colors"
                >
                  선택하기
                </button>
              </div>

              {/* PRO */}
              <div className="bg-gray-900 border-2 border-orange-500 rounded-3xl p-8 flex flex-col relative transform hover:-translate-y-1 transition-all shadow-[0_0_40px_rgba(249,115,22,0.15)]">
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <div className="bg-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Tread & Driveline 기반 정밀 키네마틱 시퀀스 분석 제공
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-orange-500 mb-2 mt-4">프로 (Pro)</h3>
                <div className="text-4xl font-bold text-white mb-6">₩99,000<span className="text-base font-normal text-gray-500">/월</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-orange-500 shrink-0" />
                    아마추어 플랜 모든 기능
                  </li>
                  <li className="flex items-start gap-3 text-sm font-bold text-white">
                    <Check className="w-5 h-5 text-orange-500 shrink-0" />
                    100% 프로 구단급 바이오메카닉스 분석 (지면 반력 효율 & 힙-숄더 세퍼레이션)
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-orange-500 shrink-0" />
                    전문 코치 1:1 라이브 피드백
                  </li>
                  <li className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="w-5 h-5 text-orange-500 shrink-0" />
                    맞춤형 웨이트 트레이닝 처방
                  </li>
                </ul>
                <button 
                  onClick={() => handleSelectTier('PRO')}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white font-bold text-lg shadow-lg shadow-orange-500/25 transition-all"
                >
                  프로 플랜 시작하기
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
