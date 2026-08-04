import re

with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# 1. Update Imports
content = content.replace("import { Palette, LogOut, Globe, User, Edit3, Trash2, AlertTriangle, X, Save, CheckCircle2, Bell, Volume2, Ruler, PlayCircle } from 'lucide-react';", 
                          "import { Palette, LogOut, Globe, User, Edit3, Trash2, AlertTriangle, X, Save, CheckCircle2, Bell, Volume2, Ruler, PlayCircle, Wifi, Smartphone, Video } from 'lucide-react';")

# 2. Update States
states_original = """  // New Environment Settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric');
  const [autoPlay, setAutoPlay] = useState(true);"""

states_new = """  // New Environment Settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric');
  const [autoPlay, setAutoPlay] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [highQualityUpload, setHighQualityUpload] = useState(true);"""
content = content.replace(states_original, states_new)


# 3. Add more items to environment settings
settings_original = """            {/* Auto Play */}
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
        </div>"""

settings_new = """            {/* Auto Play */}
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

            {/* Haptic Feedback */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">햅틱 피드백</div>
                  <div className="text-xs text-gray-400">버튼 터치 시 진동 효과 사용 (모바일)</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={hapticEnabled} onChange={(e) => setHapticEnabled(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* High Quality Upload */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">고화질 영상 업로드</div>
                  <div className="text-xs text-gray-400">피칭 영상 업로드 시 원본 화질 유지</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={highQualityUpload} onChange={(e) => setHighQualityUpload(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {/* Data Saver */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">데이터 절약 모드</div>
                  <div className="text-xs text-gray-400">모바일 데이터 사용 시 저해상도로 재생</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={dataSaver} onChange={(e) => setDataSaver(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>"""
content = content.replace(settings_original, settings_new)

# 4. Update Account Actions to be visible as buttons but smaller than main save
actions_original = """        {/* Account Actions - Compact and bottom */}
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
        </div>"""

actions_new = """        {/* Account Actions - Clear but compact buttons */}
        <div className="pt-16 pb-8 flex justify-center">
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
        </div>"""
content = content.replace(actions_original, actions_new)

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)

