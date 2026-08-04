import i18n from '../lib/i18n';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Palette, LogOut, Globe, User, Edit3, Trash2, AlertTriangle, X, Save, CheckCircle2, Bell, Volume2, Ruler, PlayCircle, Wifi, Smartphone, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserAccount } from '../types';


const t = i18n.t.bind(i18n);

interface SettingsTabProps {
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ currentUser, onLogout, onOpenProfile }) => {
  
  const { theme, setTheme, language, setLanguage, speedUnit: storeSpeedUnit, setSpeedUnit, weightUnit: storeWeightUnit, setWeightUnit, user, setUser } = useAppStore();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Environment Settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [localSpeedUnit, setLocalSpeedUnit] = useState<'kmh'|'mph'>(storeSpeedUnit);
  const [localWeightUnit, setLocalWeightUnit] = useState<'kg'|'lbs'>(storeWeightUnit);
  const [autoPlay, setAutoPlay] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [highQualityUpload, setHighQualityUpload] = useState(true);


  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    
    // Update store
    setSpeedUnit(localSpeedUnit);
    setWeightUnit(localWeightUnit);
    
    // Save to local storage
    if (user) {
      const updatedUser = { 
        ...user, 
        themePref: theme, 
        langPref: language, 
        speedUnit: localSpeedUnit, 
        weightUnit: localWeightUnit 
      };
      setUser(updatedUser);
      localStorage.setItem('bullpen_user_account', JSON.stringify(updatedUser));
    } else {
      const saved = localStorage.getItem('bullpen_user_account');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updatedUser = {
            ...parsed,
            themePref: theme,
            langPref: language,
            speedUnit: localSpeedUnit,
            weightUnit: localWeightUnit
          };
          localStorage.setItem('bullpen_user_account', JSON.stringify(updatedUser));
        } catch (e) {}
      }
    }

    setTimeout(() => {
      setIsSavingSettings(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        window.location.reload();
      }, 500);
    }, 600);
  };


  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴합니다') {
      setDeleteError('정확한 확인 문구를 입력해주세요.');
      return;
    }
    
    setIsDeleting(true);
    setDeleteError('');
    
    try {
      // 1. Send telemetry or save reason if needed (optional)
      console.log('Account deleted. Reason:', deleteReason);

      // 2. Call Supabase RPC to delete the user
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        throw error;
      }
      
      // 3. Sign out and clear local state
      await supabase.auth.signOut();
      localStorage.clear();
      onLogout();
    } catch (err: any) {
      console.error('Delete account error:', err);
      setDeleteError(err.message || '탈퇴 처리 중 오류가 발생했습니다.');
      setIsDeleting(false);
    }
  };


  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-3xl mx-auto min-h-screen text-white space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">{t('설정')}</h2>
        <p className="text-gray-400">앱 기본 환경과 프로필을 관리하세요.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings Section */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
            <User className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">{t('프로필 및 계정 설정')}</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-sm mb-1">{currentUser?.name || '사용자'}</div>
              <div className="text-xs text-gray-400">{currentUser?.email}</div>
            </div>
            <button 
              onClick={onOpenProfile}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {t('프로필 관리')}</button>
          </div>
        </div>

        {/* Theme and Language Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display Settings Section */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <Palette className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">{t('앱 테마')}</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border text-center transition-all ${theme === 'light' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                <div className="text-sm font-bold mb-0.5">Light</div>
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-xl border text-center transition-all ${theme === 'dark' ? 'bg-black text-white border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-gray-950 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                <div className="text-sm font-bold mb-0.5">Dark</div>
              </button>
              <button 
                onClick={() => setTheme('baseball-classic')}
                className={`p-3 rounded-xl border text-center transition-all ${theme === 'baseball-classic' ? 'bg-[#F4F1EA] text-[#2B2B2B] border-[#b51c1c] shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                <div className="text-sm font-bold mb-0.5">Classic</div>
              </button>
              <button 
                onClick={() => setTheme('high-contrast')}
                className={`p-3 rounded-xl border text-center transition-all ${theme === 'high-contrast' ? 'bg-black text-yellow-400 border-yellow-400 shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                <div className="text-sm font-bold mb-0.5">Contrast</div>
              </button>
            </div>
          </div>

          {/* Language Settings Section */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">{t('언어 설정')}</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setLanguage('ko')}
                className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'ko' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                {t('한국어')}</button>
              <button 
                onClick={() => setLanguage('en')}
                className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                {t('English')}</button>
              <button 
                onClick={() => setLanguage('ja')}
                className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'ja' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                {t('日本語')}</button>
            </div>
          </div>
        </div>

        {/* Environment Settings Section */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
            <Ruler className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">{t('앱 환경 설정')}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Unit Settings */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('구속 단위')}</div>
                  <div className="text-[11px] text-gray-400">{t('투구 속도 (km/h vs mph)')}</div>
                </div>
              </div>
              <div className="flex bg-black/50 rounded-lg p-1">
                <button
                  onClick={() => setLocalSpeedUnit('kmh')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${localSpeedUnit === 'kmh' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  km/h
                </button>
                <button
                  onClick={() => setLocalSpeedUnit('mph')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${localSpeedUnit === 'mph' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  mph
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('무게 단위')}</div>
                  <div className="text-[11px] text-gray-400">{t('선수 체중 및 웨이트 (kg vs lbs)')}</div>
                </div>
              </div>
              <div className="flex bg-black/50 rounded-lg p-1">
                <button
                  onClick={() => setLocalWeightUnit('kg')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${localWeightUnit === 'kg' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  kg
                </button>
                <button
                  onClick={() => setLocalWeightUnit('lbs')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${localWeightUnit === 'lbs' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  lbs
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('푸시 알림')}</div>
                  <div className="text-[11px] text-gray-400">{t('훈련 일정 및 분석 완료 알림')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            {/* Sound */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('사운드 효과')}</div>
                  <div className="text-[11px] text-gray-400">{t('앱 내 상호작용 사운드')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Auto Play */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <PlayCircle className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('영상 자동 재생')}</div>
                  <div className="text-[11px] text-gray-400">{t('피칭 영상 열기 시 자동 재생')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('햅틱 피드백')}</div>
                  <div className="text-[11px] text-gray-400">{t('버튼 터치 시 진동 효과')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={hapticEnabled} onChange={(e) => setHapticEnabled(e.target.checked)} />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* High Quality Upload */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Video className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('고화질 영상 업로드')}</div>
                  <div className="text-[11px] text-gray-400">{t('업로드 시 원본 화질 유지')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={highQualityUpload} onChange={(e) => setHighQualityUpload(e.target.checked)} />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Data Saver */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Wifi className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">{t('데이터 절약 모드')}</div>
                  <div className="text-[11px] text-gray-400">{t('모바일 데이터 시 저해상도 재생')}</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={dataSaver} onChange={(e) => setDataSaver(e.target.checked)} />
                <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Settings Button - Separated */}
        <div className="pt-4">
          <button 
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            {isSavingSettings ? (
              <span className="flex items-center gap-2">{t('저장 중...')}</span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {t('저장 완료')}</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-4 h-4" /> {t('모든 환경 설정 저장')}</span>
            )}
          </button>
        </div>
        
        {/* Account Actions - Clear but compact buttons */}
        <div className="pt-8 pb-8 flex justify-center">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 w-48 justify-center"
            >
              <LogOut className="w-4 h-4" />
              로그아웃 (Sign Out)
            </button>
            
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 w-48 justify-center"
            >
              <Trash2 className="w-4 h-4" />
              회원 탈퇴 (Delete)
            </button>
          </div>
        </div>
      </div>
            {/* Account Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t('회원 탈퇴')}</h3>
                </div>
                <button onClick={() => setIsDeleteModalOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 mb-6">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-200 text-sm leading-relaxed">
                  <p className="font-bold text-rose-400 mb-2">탈퇴 전 주의사항</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>유저의 모든 정보, 기록, 영상 데이터는 <strong>영구히 삭제</strong>되며 복구할 수 없습니다.</li>
                    <li>구매한 요금제 및 프리미엄 구독 혜택은 즉시 소멸되며 환불되지 않습니다.</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-white text-sm font-bold mb-3">탈퇴 사유 (다중 선택 가능)</label>
                  <div className="space-y-2 mb-3">
                    {['더 이상 사용하지 않음', '다른 서비스 이용', '기능 부족', '사용이 불편함/어려움', '요금 불만'].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedReasons.includes(reason)}
                          onChange={() => toggleReason(reason)}
                          className="w-5 h-5 accent-rose-500 rounded border-gray-600 bg-black text-rose-500 focus:ring-rose-500 focus:ring-2 cursor-pointer transition-all"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white">{reason}</span>
                      </label>
                    ))}
                  </div>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="기타 사유를 입력해주세요 (선택)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500/50 resize-none h-20"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">
                    탈퇴 확인을 위해 아래 입력창에 <span className="text-rose-400 font-bold">탈퇴합니다</span> 라고 입력해주세요.
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="탈퇴합니다"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-rose-500/50"
                  />
                </div>
                
                {deleteError && (
                  <p className="text-rose-400 text-sm font-bold">{deleteError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmText !== '탈퇴합니다'}
                  className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? '처리 중...' : '영구 탈퇴'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
