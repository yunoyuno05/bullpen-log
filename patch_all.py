import os
import re

# 1. Navbar.tsx
with open('src/components/Navbar.tsx', 'r') as f:
    nav_content = f.read()

nav_desktop_button = """            {/* Global Save All Records Action Button */}
            {onSaveAllRecords && (
              <button
                onClick={onSaveAllRecords}
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 backdrop-blur-md"
                title="모든 피칭, 훈련 스케줄, 가동범위 및 영상 기록을 전체 저장합니다."
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>모든 기록 저장</span>
              </button>
            )}"""

nav_content = nav_content.replace(nav_desktop_button, "")

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(nav_content)

# 2. UserProfileModal.tsx
with open('src/components/UserProfileModal.tsx', 'r') as f:
    profile_content = f.read()

profile_content = profile_content.replace('max={99}', 'max={999}')

with open('src/components/UserProfileModal.tsx', 'w') as f:
    f.write(profile_content)

# 3. SettingsTab.tsx
with open('src/components/SettingsTab.tsx', 'r') as f:
    settings_content = f.read()

# Add states for checkboxes and "Save" feedback
state_injection = """  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const toggleReason = (reason: string) => {
    if (selectedReasons.includes(reason)) {
      setSelectedReasons(selectedReasons.filter(r => r !== reason));
    } else {
      setSelectedReasons([...selectedReasons, reason]);
    }
  };

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setTimeout(() => {
      setIsSavingSettings(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 600);
  };
"""

settings_content = settings_content.replace(
"""  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');""", state_injection)

# Add a Save button to settings UI header
header_replacement = """    <div className="pt-24 pb-16 px-4 md:px-8 max-w-3xl mx-auto min-h-screen text-white space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">설정</h2>
          <p className="text-gray-400">앱 기본 환경과 프로필을 관리하세요.</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={isSavingSettings}
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 active:scale-95"
        >
          {isSavingSettings ? (
            <span className="flex items-center gap-2">저장 중...</span>
          ) : saveSuccess ? (
            <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> 저장 완료</span>
          ) : (
            <span className="flex items-center gap-2"><Save className="w-5 h-5" /> 설정 저장</span>
          )}
        </button>
      </div>"""

settings_content = settings_content.replace("""    <div className="pt-24 pb-16 px-4 md:px-8 max-w-3xl mx-auto min-h-screen text-white space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-white tracking-tight mb-2">설정</h2>
        <p className="text-gray-400">앱 기본 환경과 프로필을 관리하세요.</p>
      </div>""", header_replacement)

# Import save/check
settings_content = settings_content.replace("Trash2, AlertTriangle, X", "Trash2, AlertTriangle, X, Save, CheckCircle2")

# Update Delete Modal UI
modal_new_ui = """      {/* Account Deletion Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1c1c1e] border border-white/10 rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">회원 탈퇴</h3>
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
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedReasons.includes(reason) ? 'bg-rose-500 border-rose-500' : 'border-white/20 group-hover:border-white/40'}`}>
                           {selectedReasons.includes(reason) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
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
      )}"""

# Replace the old modal block
start_idx = settings_content.find("{/* Account Deletion Modal */}")
if start_idx != -1:
    end_idx = settings_content.rfind("</div>", 0, settings_content.rfind(");"))
    settings_content = settings_content[:start_idx] + modal_new_ui + "\n    " + settings_content[end_idx:]

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(settings_content)

