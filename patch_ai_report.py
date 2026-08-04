import sys
import re

with open('src/components/AICareReport.tsx', 'r') as f:
    content = f.read()

# Add lock icon to imports
if 'Lock' not in content:
    content = content.replace("ExternalLink", "ExternalLink,\n  Lock")
    
# Change the bottom section
# Find the ACWR & Biomechanics Breakdown part and Arm Care Exercises part.
# Instead of SubscriptionLock, we will manually render the blurred section.

new_section = """              {/* ACWR & Biomechanics Breakdown */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>1. ACWR 및 기본 분석</span>
                </h3>
                <div className="bg-black/50 border border-white/10 rounded-2xl p-4 text-xs text-gray-300 space-y-3 leading-relaxed font-sans">
                  <p><strong className="text-white">투구 부하 평가:</strong> {report.acwrEvaluation}</p>
                </div>
              </div>

              {/* 7-Day Recommended Program */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>2. 주간 맞춤형 투구수 캡 (Throwing Program)</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {report.weeklyThrowingPlan.map((plan, idx) => (
                    <div key={idx} className={`border rounded-xl p-3 flex flex-col justify-between ${plan.day === 'Sun' ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/10'}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${plan.day === 'Sun' ? 'text-rose-400' : 'text-gray-500'}`}>{plan.day}</span>
                        <span className="text-white font-mono font-bold text-sm">{plan.pitches}구</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans leading-tight">{plan.intensity}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRO Biomechanics Analysis Upsell */}
              <div className="space-y-4 mt-8">
                <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <span>전문 바이오메카닉스 분석 (Driveline 기준)</span>
                </h3>
                
                {subscription === 'PRO' ? (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-sm text-gray-300 space-y-4">
                    <p><strong className="text-white">가동범위 & 메커니즘 인사이트:</strong> {report.biomechanicsInsight}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      {report.armCareExercises.map((ex, idx) => (
                        <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">{ex.name}</span>
                            <span className="text-emerald-400 font-mono font-semibold">{ex.setsReps}</span>
                          </div>
                          <div className="text-rose-400 text-[11px] font-mono">타겟: {ex.targetArea}</div>
                          <p className="text-gray-400 text-[11px] pt-1">{ex.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-pricing-modal'))}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group border border-white/10 hover:border-orange-500/50 transition-colors"
                  >
                    <div className="absolute inset-0 bg-black/40 z-10 group-hover:bg-black/20 transition-colors"></div>
                    <div className="p-6 text-sm text-gray-300 space-y-4 filter blur-[6px] select-none pointer-events-none opacity-50">
                      <p><strong className="text-white">가동범위 & 메커니즘 인사이트:</strong> 어깨 외회전 부족 및 골반 회전 타이밍 지연으로 인해 상체 의존도가 높습니다. 힙-숄더 세퍼레이션 개선이 필요합니다.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">리버스 런지 메디신볼 스로우</span>
                            <span className="text-emerald-400 font-mono font-semibold">3x10</span>
                          </div>
                        </div>
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-sm">워터백 숄더 로테이션</span>
                            <span className="text-emerald-400 font-mono font-semibold">3x15</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Lock className="w-8 h-8 text-orange-500" />
                      </div>
                      <p className="text-white font-bold text-lg mb-2 max-w-md shadow-black drop-shadow-md">
                        지면 반력 효율(GRF)과 힙-숄더 세퍼레이션 타이밍을 확인하여 구속 5km/h 상승의 해답을 찾으세요.
                      </p>
                      <span className="text-orange-400 text-sm font-medium">프로 플랜으로 업그레이드하기 →</span>
                    </div>
                  </div>
                )}
              </div>"""

start_marker = "{/* ACWR & Biomechanics Breakdown */}"
end_marker = "{/* Recommended Gear (Affiliate) */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_section + "\n\n              " + content[end_idx:]

with open('src/components/AICareReport.tsx', 'w') as f:
    f.write(content)
