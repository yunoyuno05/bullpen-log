import re

with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# Update state variables
content = re.sub(
    r"const \[unit, setUnit\] = useState<.*?>\('metric'\);",
    r"const [speedUnit, setSpeedUnit] = useState<'kmh'|'mph'>('kmh');\n  const [weightUnit, setWeightUnit] = useState<'kg'|'lbs'>('kg');",
    content
)

# Update layout to max-w-xl
content = content.replace(
    'className="max-w-2xl mx-auto px-4 sm:px-6 pt-6"',
    'className="max-w-xl mx-auto px-4 sm:px-6 pt-6"'
)

# Update App Theme and Language to be side-by-side
old_theme_lang = """        {/* Display Settings Section */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
            <Palette className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">앱 테마 (디스플레이)</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xl border text-center transition-all ${theme === 'light' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="text-sm font-bold mb-0.5">Light</div>
              <div className="text-[10px] opacity-70">밝은 테마</div>
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xl border text-center transition-all ${theme === 'dark' ? 'bg-black text-white border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-gray-950 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="text-sm font-bold mb-0.5">Dark</div>
              <div className="text-[10px] opacity-70">어두운 테마</div>
            </button>
            <button 
              onClick={() => setTheme('baseball-classic')}
              className={`p-3 rounded-xl border text-center transition-all ${theme === 'baseball-classic' ? 'bg-[#F4F1EA] text-[#2B2B2B] border-[#b51c1c] shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="text-sm font-bold mb-0.5">Classic</div>
              <div className="text-[10px] opacity-70">야구 클래식</div>
            </button>
            <button 
              onClick={() => setTheme('high-contrast')}
              className={`p-3 rounded-xl border text-center transition-all ${theme === 'high-contrast' ? 'bg-black text-yellow-400 border-yellow-400 shadow-lg' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
            >
              <div className="text-sm font-bold mb-0.5">High-Contrast</div>
              <div className="text-[10px] opacity-70">고대비 테마</div>
            </button>
          </div>
        </div>

        {/* Language Settings Section */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
            <Globe className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">언어 설정 (Language)</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={() => setLanguage('ko')}
              className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'ko' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              한국어
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              English
            </button>
            <button 
              onClick={() => setLanguage('ja')}
              className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'ja' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
            >
              日本語
            </button>
          </div>
        </div>"""

new_theme_lang = """        {/* Theme and Language Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display Settings Section */}
          <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[20px] p-4">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <Palette className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">앱 테마</h3>
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
              <h3 className="text-base font-bold text-white">언어 설정</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => setLanguage('ko')}
                className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'ko' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                한국어
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'en' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('ja')}
                className={`p-2.5 rounded-xl border text-sm text-center font-medium transition-all ${language === 'ja' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'}`}
              >
                日本語
              </button>
            </div>
          </div>
        </div>"""
content = content.replace(old_theme_lang, new_theme_lang)

old_unit = """            {/* Unit Settings */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">측정 단위</div>
                  <div className="text-[11px] text-gray-400">구속(km/h, mph) 및 체중(kg, lbs)</div>
                </div>
              </div>
              <div className="flex bg-black/50 rounded-lg p-1">
                <button
                  onClick={() => setUnit('metric')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${unit === 'metric' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  미터법 (km, kg)
                </button>
                <button
                  onClick={() => setUnit('imperial')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${unit === 'imperial' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  야드파운드 (mph, lbs)
                </button>
              </div>
            </div>"""

new_unit = """            {/* Unit Settings */}
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">구속 단위</div>
                  <div className="text-[11px] text-gray-400">투구 속도 (km/h vs mph)</div>
                </div>
              </div>
              <div className="flex bg-black/50 rounded-lg p-1">
                <button
                  onClick={() => setSpeedUnit('kmh')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${speedUnit === 'kmh' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  km/h
                </button>
                <button
                  onClick={() => setSpeedUnit('mph')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${speedUnit === 'mph' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  mph
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <Ruler className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-sm font-bold text-white">무게 단위</div>
                  <div className="text-[11px] text-gray-400">선수 체중 및 웨이트 (kg vs lbs)</div>
                </div>
              </div>
              <div className="flex bg-black/50 rounded-lg p-1">
                <button
                  onClick={() => setWeightUnit('kg')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${weightUnit === 'kg' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  kg
                </button>
                <button
                  onClick={() => setWeightUnit('lbs')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${weightUnit === 'lbs' ? 'bg-white/20 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  lbs
                </button>
              </div>
            </div>"""
content = content.replace(old_unit, new_unit)

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)

