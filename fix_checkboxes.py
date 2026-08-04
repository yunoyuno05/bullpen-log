with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# Replace the delete modal reason checkboxes
checkboxes_old = """                    {['더 이상 사용하지 않음', '다른 서비스 이용', '기능 부족', '사용이 불편함/어려움', '요금 불만'].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer group" onClick={(e) => { e.preventDefault(); toggleReason(reason); }}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${selectedReasons.includes(reason) ? 'bg-rose-500 border-rose-500' : 'border-white/20 group-hover:border-white/40'}`}>
                           {selectedReasons.includes(reason) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white">{reason}</span>
                        {/* Hidden native checkbox for accessibility */}
                        <input type="checkbox" className="hidden" checked={selectedReasons.includes(reason)} readOnly />
                      </label>
                    ))}"""

checkboxes_new = """                    {['더 이상 사용하지 않음', '다른 서비스 이용', '기능 부족', '사용이 불편함/어려움', '요금 불만'].map(reason => (
                      <label key={reason} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={selectedReasons.includes(reason)}
                          onChange={() => toggleReason(reason)}
                          className="w-5 h-5 accent-rose-500 rounded border-gray-600 bg-black text-rose-500 focus:ring-rose-500 focus:ring-2 cursor-pointer transition-all"
                        />
                        <span className="text-sm text-gray-300 group-hover:text-white">{reason}</span>
                      </label>
                    ))}"""
content = content.replace(checkboxes_old, checkboxes_new)

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)
