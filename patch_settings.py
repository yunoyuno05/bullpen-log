import re

with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# Make sure we add new icons
content = content.replace("import { Palette, LogOut, Globe, User, Edit3, Trash2, AlertTriangle, X, Save, CheckCircle2 } from 'lucide-react';", 
                          "import { Palette, LogOut, Globe, User, Edit3, Trash2, AlertTriangle, X, Save, CheckCircle2, Bell, Volume2, Ruler, PlayCircle } from 'lucide-react';")


# Add new states
state_injection = """  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Environment Settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric');
  const [autoPlay, setAutoPlay] = useState(true);
"""

content = re.sub(r'  const \[isDeleting, setIsDeleting\] = useState\(false\);.*?const \[saveSuccess, setSaveSuccess\] = useState\(false\);', state_injection, content, flags=re.DOTALL)

# Header replacement to remove top save button
header_original = """      <div className="flex justify-between items-end mb-8">
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

header_new = """      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight mb-2">환경 설정</h2>
        <p className="text-gray-400">앱 기본 환경과 프로필, 디스플레이 등을 관리하세요.</p>
      </div>"""
content = content.replace(header_original, header_new)

# Add new settings sections and Save Button + bottom account actions
account_actions_original = """        {/* Account Actions */}
        <div className="pt-6 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
          
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            회원 탈퇴 (영구 삭제)
          </button>
        </div>
      </div>"""

new_sections_and_actions = """        {/* Environment Settings Section */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[24px] p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <Ruler className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">앱 환경 설정</h3>
          </div>
          
          <div className="space-y-4">
            {/* Unit Settings */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">측정 단위</div>
                  <div className="text-xs text-gray-400">구속 및 체격 단위 (km/h & cm vs mph & inch)</div>
                </div>
              </div>
              <div className="flex bg-black/50 rounded-lg p-1">
                <button
                  onClick={() => setUnit('metric')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${unit === 'metric' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  미터법 (Metric)
                </button>
                <button
                  onClick={() => setUnit('imperial')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${unit === 'imperial' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  야드파운드 (Imperial)
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">푸시 알림</div>
                  <div className="text-xs text-gray-400">훈련 일정 및 분석 완료 알림 받기</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
            
            {/* Sound */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">사운드 효과</div>
                  <div className="text-xs text-gray-400">앱 내 상호작용 사운드 및 피드백 음향</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Auto Play */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <PlayCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">영상 자동 재생</div>
                  <div className="text-xs text-gray-400">피칭 영상 열기 시 자동 재생 여부</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Settings Button - Separated */}
        <div className="pt-6">
          <button 
            onClick={handleSaveSettings}
            disabled={isSavingSettings}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            {isSavingSettings ? (
              <span className="flex items-center gap-2">저장 중...</span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> 저장 완료</span>
            ) : (
              <span className="flex items-center gap-2"><Save className="w-5 h-5" /> 모든 환경 설정 저장</span>
            )}
          </button>
        </div>
        
        {/* Account Actions - Compact and bottom */}
        <div className="pt-16 pb-8 flex flex-col items-center gap-4">
          <button 
            onClick={onLogout}
            className="text-gray-500 hover:text-white text-sm transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            로그아웃 (Sign Out)
          </button>
          
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-gray-600 hover:text-rose-500 text-xs transition-colors flex items-center gap-1.5 mt-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            회원 탈퇴 (Delete Account)
          </button>
        </div>
      </div>"""
content = content.replace(account_actions_original, new_sections_and_actions)

# Fix onClick for Reason Checkboxes
checkbox_original = """                    {['더 이상 사용하지 않음', '다른 서비스 이용', '기능 부족', '사용이 불편함/어려움', '요금 불만'].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedReasons.includes(reason) ? 'bg-rose-500 border-rose-500' : 'border-white/20 group-hover:border-white/40'}`}>
                           {selectedReasons.includes(reason) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white">{reason}</span>
                      </label>
                    ))}"""

checkbox_new = """                    {['더 이상 사용하지 않음', '다른 서비스 이용', '기능 부족', '사용이 불편함/어려움', '요금 불만'].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleReason(reason); }}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedReasons.includes(reason) ? 'bg-rose-500 border-rose-500' : 'border-white/20 group-hover:border-white/40'}`}>
                           {selectedReasons.includes(reason) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white">{reason}</span>
                        {/* Hidden native checkbox for accessibility */}
                        <input type="checkbox" className="hidden" checked={selectedReasons.includes(reason)} readOnly />
                      </label>
                    ))}"""
content = content.replace(checkbox_original, checkbox_new)


with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)

