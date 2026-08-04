import sys

with open('src/components/AICareReport.tsx', 'r') as f:
    lines = f.readlines()

# find where "Recommended Gear (Affiliate)" starts
start_idx = -1
for i, line in enumerate(lines):
    if "Recommended Gear (Affiliate)" in line:
        start_idx = i
        break

# find where "Right Col: Interactive AI Bullpen Coach Chatbot" starts
end_idx = -1
for i, line in enumerate(lines):
    if "Right Col: Interactive AI Bullpen Coach Chatbot" in line:
        end_idx = i
        break

replacement = """              {/* Recommended Gear (Affiliate) */}
              {report.recommendedGear && report.recommendedGear.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>추천 훈련 용품 (전문가 검증)</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {report.recommendedGear.map((gear, idx) => (
                      <div key={idx} className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-bold text-sm">{gear.name}</h4>
                          <p className="text-gray-400 text-xs mt-1">{gear.reason}</p>
                        </div>
                        <a href={gear.url} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors">
                          <span>구매하기</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recovery & Nutrition */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>5. 영양 & 회복 가이드라인</span>
                </h3>
                <ul className="bg-black/50 border border-white/10 rounded-2xl p-4 text-xs text-gray-300 space-y-2 list-disc list-inside">
                  {report.nutritionAndRecovery.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Interactive AI Bullpen Coach Chatbot */}
"""

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + [replacement] + lines[end_idx+1:]
    with open('src/components/AICareReport.tsx', 'w') as f:
        f.writelines(new_lines)
    print("Fixed!")
else:
    print(f"Indices not found: start={start_idx}, end={end_idx}")

