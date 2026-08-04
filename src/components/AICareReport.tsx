import i18n from '../lib/i18n';
import React, { useState } from 'react';
import { Pitcher, PitchSession, ROMRecord, AIReportData, AIChatMessage } from '../types';
import {
  Sparkles,
  Printer,
  Download,
  Send,
  Bot,
  User,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Dumbbell,
  FileText,
  RefreshCw,
  Loader2,
  CheckCircle2,
  HeartPulse,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '../lib/store';
import { SubscriptionLock } from './SubscriptionLock';


const t = i18n.t.bind(i18n);

interface AICareReportProps {
  pitcher: Pitcher;
  sessions: PitchSession[];
  romRecords: ROMRecord[];
}

export const AICareReport: React.FC<AICareReportProps> = ({
  pitcher,
  sessions,
  romRecords,
}) => {
  const { subscription } = useAppStore();
  const pitcherSessions = sessions.filter((s) => s.pitcherId === pitcher.id);
  const pitcherRom = romRecords.filter((r) => r.pitcherId === pitcher.id);
  const latestRom = pitcherRom[0];
  const latestSession = pitcherSessions[0];

  const totalRecentPitches = pitcherSessions.reduce((sum, s) => sum + s.totalPitches, 0);

  // AI Report Generation State
  const [report, setReport] = useState<AIReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // AI Coach Chatbot State
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `안녕하세요, ${pitcher.name} 선수! 저는 Bullpen Log의 AI 불펜 코치입니다. 현재 선수의 ACWR(${pitcher.currentAcwr}), 최근 피칭수(${totalRecentPitches}구), 가동범위에 대한 궁금증이나 구종 개발, 부상 예방 관리에 대해 언제든 물어보세요!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Generate Report function calling Express `/api/ai-report`
  const generateAiReport = async () => {
    setLoadingReport(true);
    setReportError(null);

    try {
      const res = await fetch('/api/ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pitcherName: pitcher.name,
          throwingArm: pitcher.throwingArm,
          acwr: pitcher.currentAcwr,
          recentPitches: totalRecentPitches,
          avgVelocity: latestSession?.avgVel || 142,
          maxVelocity: pitcher.maxVelocity,
          rpe: latestSession?.rpe || 7,
          fatigue: latestSession?.fatigue || 4,
          rom: latestRom,
          notes: latestSession?.notes || '불펜 피칭 후 투구 후반부 구속 저하 관찰됨',
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setReportError(data.error || '리포트 생성에 실패했습니다.');
      }
    } catch (err: any) {
      setReportError(err.message || '네트워크 오류가 발생했습니다.');
    } finally {
      setLoadingReport(false);
    }
  };

  // Send Chat Message to `/api/ai-coach`
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || chatLoading) return;

    const userMessageText = inputMsg;
    const userMsg: AIChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          pitcherData: {
            name: pitcher.name,
            acwr: pitcher.currentAcwr,
            recentPitches: totalRecentPitches,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.reply) {
        const botMsg: AIChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const exportReportAsHtml = () => {
    if (!report) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pitcher.name} 선수 AI 케어 리포트 - Bullpen Log</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; padding: 2rem; margin: 0; line-height: 1.6; }
    .container { max-width: 850px; margin: 0 auto; background: #111827; border: 1px solid #374151; border-radius: 1.25rem; padding: 2.5rem; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }
    .header { border-bottom: 1px solid #374151; padding-bottom: 1.25rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
    .badge { display: inline-block; background: rgba(239,68,68,0.25); color: #fca5a5; border: 1px solid rgba(239,68,68,0.4); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.05em; }
    h1 { margin: 0.5rem 0 0; font-size: 1.85rem; font-weight: 800; color: #ffffff; }
    .meta { color: #9ca3af; font-size: 0.85rem; margin-top: 0.35rem; }
    .status-banner { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); padding: 1.25rem; border-radius: 1rem; margin-bottom: 1.75rem; }
    .status-tag { font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 9999px; display: inline-block; font-size: 0.9rem; }
    .status-DANGER { background: rgba(244,63,94,0.25); color: #fda4af; border: 1px solid rgba(244,63,94,0.4); }
    .status-CAUTION { background: rgba(245,158,11,0.25); color: #fde68a; border: 1px solid rgba(245,158,11,0.4); }
    .status-SAFE { background: rgba(16,185,129,0.25); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.4); }
    .section-title { color: #f87171; font-size: 1.15rem; font-weight: 800; margin-top: 1.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid #374151; padding-bottom: 0.35rem; display: flex; align-items: center; gap: 0.5rem; }
    .box { background: rgba(0,0,0,0.4); border: 1px solid #374151; padding: 1.25rem; border-radius: 1rem; font-size: 0.925rem; color: #e2e8f0; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.85rem; margin-top: 0.75rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid #374151; padding: 1rem; border-radius: 0.85rem; font-size: 0.875rem; }
    .footer { text-align: center; margin-top: 2.5rem; padding-top: 1.5rem; border-t: 1px solid #374151; color: #6b7280; font-size: 0.8rem; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <span class="badge">WEEKLY ATHLETE PULSE REPORT</span>
        <h1>${pitcher.name} 선수 주간 AI 케어 & 훈련 보고서</h1>
        <div class="meta">작성일: ${new Date().toISOString().split('T')[0]} | Bullpen Log AI Engine</div>
      </div>
    </div>
    
    <div class="status-banner">
      <div style="margin-bottom: 0.5rem;">
        <span style="color:#9ca3af; font-size:0.8rem; text-transform:uppercase; font-weight:600;">부상 위험 등급</span>
        <div style="margin-top:0.25rem;">
          <span class="status-tag status-${report.riskStatus}">${report.riskStatus}</span>
          <span style="color:#9ca3af; font-size:0.85rem; margin-left:0.5rem;">(위험도 점수: ${report.riskScore}/100)</span>
        </div>
      </div>
      <p style="margin: 0.75rem 0 0; font-size:1.05rem; font-weight:700; color:#ffffff;">${report.headline}</p>
    </div>

    <div class="section-title">1. ACWR 및 바이오메카닉스 정밀 진단</div>
    <div class="box">
      <p style="margin-top:0;"><strong style="color:#ffffff;">투구 부하 평가:</strong> ${report.acwrEvaluation}</p>
      <p style="margin-bottom:0;"><strong style="color:#ffffff;">가동범위 & 메커니즘 인사이트:</strong> ${report.biomechanicsInsight}</p>
    </div>

    <div class="section-title">2. 주간 맞춤형 투구수 캡 (Throwing Program)</div>
    <div class="grid">
      ${report.recommendedProgram.map(p => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; color:#f87171; font-weight:800;">
            <span>${p.day}</span>
            <span style="background:rgba(255,255,255,0.1); color:#fff; padding:0.1rem 0.4rem; border-radius:4px; font-size:0.75rem;">한계 ${p.pitchCap}구</span>
          </div>
          <div style="font-weight:700; margin-top:0.35rem; color:#ffffff; font-size:0.95rem;">${p.title}</div>
          <div style="color:#9ca3af; font-size:0.8rem; margin-top:0.25rem;">${p.focus}</div>
        </div>
      `).join('')}
    </div>

    <div class="section-title">3. 타겟 보강 운동 (Arm Care Exercises)</div>
    <div class="grid">
      ${report.armCareExercises.map(e => `
        <div class="card">
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#ffffff;">
            <span>${e.name}</span>
            <span style="color:#34d399; font-size:0.85rem;">${e.setsReps}</span>
          </div>
          <div style="color:#f87171; font-size:0.75rem; margin-top:0.15rem;">타겟: ${e.targetArea}</div>
          <div style="color:#9ca3af; font-size:0.8rem; margin-top:0.35rem; line-height:1.4;">${e.description}</div>
        </div>
      `).join('')}
    </div>

    <div class="section-title">4. 영양 & 회복 가이드라인</div>
    <div class="box">
      <ul style="margin:0; padding-left:1.25rem;">
        ${report.nutritionAndRecovery.map(n => `<li style="margin-bottom:0.4rem;">${n}</li>`).join('')}
      </ul>
    </div>

    <div class="footer">
      Generated by Bullpen Log Pro AI v2.6 • All rights reserved
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${pitcher.name}_AI_Care_Report_${new Date().toISOString().split('T')[0]}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-20 pb-12 px-4 md:px-8 max-w-5xl mx-auto text-white space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 mb-1">
            <Sparkles className="w-4 h-4 text-rose-300" />
            <span className="font-bold text-white tracking-wide">
              AI Bullpen Coach Pitcher Care & Coaching
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">AI 맞춤형 케어 리포트 & 코칭</h1>
          <p className="text-gray-400 text-sm mt-1">
            AI 불펜 코치가 선수의 ACWR, ROM 가동범위, 투구 피로도를 종합 분석하여 완벽한 주간 훈련 스케줄을 수립합니다.
          </p>
        </div>

        <button
          onClick={generateAiReport}
          disabled={loadingReport}
          className="bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs px-6 py-3 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 backdrop-blur-xl"
        >
          {loadingReport ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>AI 불펜 코치 분석 중...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>{report ? '리포트 다시 생성하기' : 'AI 케어 리포트 생성하기'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Report View vs AI Coach Chatbot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI Report Document */}
        <div className="lg:col-span-2 space-y-6">
          {!report && !loadingReport && (
            <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-12 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/15 flex items-center justify-center mx-auto shadow-md">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">아직 생성된 AI 리포트가 없습니다</h3>
              <p className="text-gray-400 text-sm max-w-md mx-auto">
                상단의 'AI 케어 리포트 생성하기' 버튼을 누르면 {pitcher.name} 선수의 피칭 데이터 및 ROM을 기반으로 정밀 보고서가 즉시 작성됩니다.
              </p>
              <button
                onClick={generateAiReport}
                className="bg-white text-black hover:bg-gray-200 font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
              >
                지금 리포트 생성
              </button>
            </div>
          )}

          {loadingReport && (
            <div className="bg-white/[0.03] backdrop-blur-md border border-red-500/30 rounded-3xl p-12 text-center space-y-4 animate-pulse">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
              <h3 className="text-lg font-bold text-white">AI 불펜 코치가 바이오메카닉스 데이터를 정밀 진단 중입니다...</h3>
              <p className="text-xs text-gray-400">ACWR 부하 지수 계산 • 어깨 내회전 GIRD 결핍 분석 • 7일 맞춤 피칭 캡 수립</p>
            </div>
          )}

          {reportError && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs text-rose-300 flex items-center justify-between">
              <span>⚠️ {reportError}</span>
              <button onClick={generateAiReport} className="underline font-bold">
                재시도
              </button>
            </div>
          )}

          {report && (
            <div id="printable-ai-report" className="bg-gradient-to-b from-gray-900 via-black to-gray-950 border border-red-500/30 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl relative">
              {/* Report Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-red-500/20 text-rose-300 border border-red-500/40 px-3 py-1 rounded-full uppercase tracking-wider">
                    WEEKLY ATHLETE PULSE REPORT
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-2">
                    {pitcher.name} 선수 주간 AI 케어 & 훈련 보고서
                  </h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    작성일: {new Date().toISOString().split('T')[0]} | 담당: Bullpen Log AI Engine
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={exportReportAsHtml}
                    className="bg-red-600/30 hover:bg-red-600/50 text-rose-200 border border-red-500/40 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Download className="w-4 h-4 text-rose-300" />
                    <span>HTML 보고서 다운로드</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>인쇄 / PDF 저장</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 border border-white/10 p-5 rounded-2xl">
                <div>
                  <div className="text-[11px] text-gray-400 font-semibold uppercase">부상 위험 등급</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-lg font-bold px-3 py-0.5 rounded-full border ${
                        report.riskStatus === 'DANGER'
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : report.riskStatus === "CAUTION"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {report.riskStatus}
                    </span>
                    <span className="text-xs font-mono text-gray-400">(점수: {report.riskScore}/100)</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="text-[11px] text-gray-400 font-semibold uppercase">헤드라인 총평</div>
                  <p className="text-sm font-bold text-white mt-1">{report.headline}</p>
                </div>
              </div>

                            {/* ACWR & Biomechanics Breakdown */}
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
              </div>

              {/* Recommended Gear (Affiliate) */}
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
        <div className="bg-gradient-to-b from-gray-900 via-black to-slate-950 border border-white/15 rounded-3xl p-6 flex flex-col justify-between h-[700px] shadow-2xl">
          {/* Chat Header */}
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-400/40 flex items-center justify-center">
                <Bot className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">AI 불펜 코치 (AI Bullpen Coach)</h3>
                <p className="text-[10px] text-emerald-400">● 실시간 온라인 (AI 불펜 코치)</p>
              </div>
            </div>
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-rose-400" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-white text-black font-medium rounded-tr-none'
                      : 'bg-white/10 border border-white/10 text-gray-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  {m.text}
                  <div className={`text-[9px] mt-1 text-right font-mono ${m.sender === 'user' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {m.timestamp}
                  </div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-rose-400 font-mono">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI 불펜 코치가 답변을 작성 중입니다...</span>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="투구 훈련, 통증, 회복법 질문하기..."
              className="flex-1 bg-black/60 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
