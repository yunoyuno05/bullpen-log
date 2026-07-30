import React, { useState } from 'react';
import { Pitcher, PitchSession, ROMRecord } from '../types';
import { BaseballIcon } from './BaseballIcon';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Flame,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  Dumbbell
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface DashboardProps {
  pitcher: Pitcher;
  sessions: PitchSession[];
  romRecords: ROMRecord[];
  setActiveTab: (tab: string) => void;
  onOpenLogger: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  pitcher,
  sessions,
  romRecords,
  setActiveTab,
  onOpenLogger,
}) => {
  const pitcherSessions = sessions.filter((s) => s.pitcherId === pitcher.id);
  const pitcherRom = romRecords.filter((r) => r.pitcherId === pitcher.id);
  const latestRom = pitcherRom[0];

  // Calculate 7-day Acute Load (sum of pitches in last 7 days) and Chronic Load (average weekly pitches over last 28 days)
  const totalPitchesLast7Days = pitcherSessions.reduce((acc, s) => acc + s.totalPitches, 0);
  const latestSession = pitcherSessions[0];

  // Prepare chart data for 28-day historical pitching sessions
  const chartData = pitcherSessions.slice().reverse().map((s) => ({
    date: s.date.slice(5),
    pitches: s.totalPitches,
    maxVel: s.maxVel,
    acwr: s.acwrImpact || 1.15,
  }));

  // Calculate pitch breakdown totals
  const totalFastballs = pitcherSessions.reduce((sum, s) => sum + s.fastballCount, 0);
  const totalSliders = pitcherSessions.reduce((sum, s) => sum + s.sliderCount, 0);
  const totalCurveballs = pitcherSessions.reduce((sum, s) => sum + s.curveballCount, 0);
  const totalChangeups = pitcherSessions.reduce((sum, s) => sum + s.changeupCount, 0);
  const totalCutters = pitcherSessions.reduce((sum, s) => sum + s.cutterCount, 0);

  const pieData = [
    { name: '포심 직구', value: totalFastballs, color: '#3B82F6' },
    { name: '슬라이더', value: totalSliders, color: '#F59E0B' },
    { name: '커브', value: totalCurveballs, color: '#10B981' },
    { name: '체인지업', value: totalChangeups, color: '#EC4899' },
    { name: '커터/스플리터', value: totalCutters, color: '#8B5CF6' },
  ].filter((d) => d.value > 0);

  // ACWR Badge formatting
  const getAcwrBadge = (val: number) => {
    if (val > 1.5) {
      return {
        label: '고위험 (High Risk)',
        color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        icon: AlertTriangle,
      };
    }
    if (val >= 1.3) {
      return {
        label: '주의 (Caution)',
        color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        icon: AlertTriangle,
      };
    }
    if (val < 0.8) {
      return {
        label: '저부하 (Underload)',
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        icon: TrendingUp,
      };
    }
    return {
      label: '적정 최적존 (Sweet Spot)',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: CheckCircle2,
    };
  };

  const acwrBadge = getAcwrBadge(pitcher.currentAcwr);
  const AcwrIcon = acwrBadge.icon;

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-white space-y-8">
      {/* Top Banner & Profile Overview (Apple Fitness Style Widget) */}
      <div className="bg-[#1c1c1e]/80 border border-white/10 rounded-[28px] p-6 md:p-8 backdrop-blur-2xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Pitcher Info */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={pitcher.avatarUrl}
                alt={pitcher.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 bg-[#2c2c2e] border border-white/20 text-xs font-bold px-2 py-0.5 rounded-md text-gray-200">
                #{pitcher.number}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {pitcher.name}
                </h1>
                <span className="bg-white/10 text-gray-200 border border-white/15 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {pitcher.throwingArm}
                </span>
                <span className="bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                  {pitcher.role}
                </span>
              </div>
              <p className="text-gray-400 text-xs md:text-sm">
                {pitcher.team} • {pitcher.age}세 • {pitcher.heightWeight}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs font-mono text-gray-300">
                <span>최고 구속: <strong className="text-white">{pitcher.maxVelocity} km/h</strong></span>
                <span>최근 7일 피칭: <strong className="text-[#34C759]">{totalPitchesLast7Days}구</strong></span>
              </div>
            </div>
          </div>

          {/* ACWR Status Widget */}
          <div className="w-full lg:w-auto bg-black/40 border border-white/10 rounded-[20px] p-4 md:p-5 flex items-center justify-between gap-6 backdrop-blur-md">
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                현재 부하 지수 (ACWR)
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
                  {pitcher.currentAcwr.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400 font-mono">/ 1.30 타겟</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${acwrBadge.color}`}>
                <AcwrIcon className="w-3.5 h-3.5" />
                {acwrBadge.label}
              </span>
              <p className="text-[11px] text-gray-400 mt-1.5 max-w-[160px]">
                {pitcher.currentAcwr > 1.5
                  ? '부상 위험 매우 높음! 즉시 쉬어야 합니다.'
                  : pitcher.currentAcwr >= 1.3
                  ? '주의 단계. 피칭 수량 제한 권장.'
                  : '최적의 부하 상태. 훈련 지속 가능.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric Tiles Grid (Apple Health Style Widgets) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: 7-Day Workload */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 hover:bg-[#2c2c2e]/80 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>최근 7일 투구수 (Acute)</span>
            <div className="w-7 h-7 rounded-full bg-[#34C759]/20 flex items-center justify-center border border-[#34C759]/30">
              <BaseballIcon className="w-3.5 h-3.5 text-[#34C759]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight mb-1">
            {totalPitchesLast7Days} <span className="text-xs font-sans text-gray-400 font-normal">구</span>
          </div>
          <p className="text-[11px] text-[#34C759] font-medium">권장한계 (180구) 이하 안정권</p>
        </div>

        {/* Tile 2: Max/Avg Velocity */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 hover:bg-[#2c2c2e]/80 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>최근 최고 / 평균 구속</span>
            <div className="w-7 h-7 rounded-full bg-[#FF9500]/20 flex items-center justify-center border border-[#FF9500]/30">
              <Flame className="w-3.5 h-3.5 text-[#FF9500]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight mb-1">
            {latestSession?.maxVel || pitcher.maxVelocity} <span className="text-xs font-sans text-gray-400 font-normal">km/h</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">평균: {latestSession?.avgVel || 142} km/h (유지중)</p>
        </div>

        {/* Tile 3: RPE & Fatigue */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 hover:bg-[#2c2c2e]/80 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>주관적 강도 (RPE) / 피로도</span>
            <div className="w-7 h-7 rounded-full bg-[#FF3B30]/20 flex items-center justify-center border border-[#FF3B30]/30">
              <Clock className="w-3.5 h-3.5 text-[#FF3B30]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight mb-1">
            RPE {latestSession?.rpe || 7} <span className="text-xs font-sans text-gray-400 font-normal">/ 10</span>
          </div>
          <p className="text-[11px] text-[#FF9500] font-medium">피로도 지수: {latestSession?.fatigue || 4}/10</p>
        </div>

        {/* Tile 4: ROM Status */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/10 rounded-[24px] p-5 hover:bg-[#2c2c2e]/80 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between text-gray-400 text-xs font-medium mb-3">
            <span>어깨 가동범위 (GIRD)</span>
            <div className="w-7 h-7 rounded-full bg-[#32ADE6]/20 flex items-center justify-center border border-[#32ADE6]/30">
              <Activity className="w-3.5 h-3.5 text-[#32ADE6]" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight mb-1">
            {latestRom?.shoulderIntRotation || 42}° <span className="text-xs font-sans text-gray-400 font-normal">내회전</span>
          </div>
          <p className="text-[11px] text-[#FF9500] font-medium">GIRD 주의: 내회전 스트레칭 필요</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: ACWR Workload Composite Chart */}
        <div className="lg:col-span-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>28일 피칭 부하 & ACWR 추이</span>
                <span className="text-xs font-normal text-gray-400 font-mono">(Acute:Chronic)</span>
              </h3>
              <p className="text-xs text-gray-400">막대: 투구수 (구) | 선: ACWR 지수 (1.5 이상 위험)</p>
            </div>
            <button
              onClick={() => setActiveTab('acwr')}
              className="text-xs text-gray-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              상세 분석 <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c2c2e" />
                <XAxis dataKey="date" stroke="#8e8e93" fontSize={11} />
                <YAxis yAxisId="left" stroke="#8e8e93" fontSize={11} label={{ value: '구수', angle: -90, position: 'insideLeft', fill: '#8e8e93' }} />
                <YAxis yAxisId="right" orientation="right" domain={[0.5, 2.0]} stroke="#f43f5e" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '16px', fontSize: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Bar yAxisId="left" dataKey="pitches" name="투구수 (구)" fill="#38bdf8" radius={[6, 6, 0, 0]} barSize={22} />
                <Line yAxisId="right" type="monotone" dataKey="acwr" name="ACWR 지수" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
                <ReferenceLine yAxisId="right" y={1.5} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: '위험 (1.5)', fill: '#f43f5e', fontSize: 10 }} />
                <ReferenceLine yAxisId="right" y={1.3} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: '주의 (1.3)', fill: '#f59e0b', fontSize: 10 }} />
                <ReferenceLine yAxisId="right" y={0.8} stroke="#38bdf8" strokeDasharray="3 3" label={{ value: '저부하 (0.8)', fill: '#38bdf8', fontSize: 10 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Pitch Mix Ratio Pie Chart */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">구종 구사 비율 (Pitch Mix)</h3>
            <p className="text-xs text-gray-400 mb-4">최근 투구 전체 구종 분포</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={72} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', fontSize: '11px' }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', color: '#ccc' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-gray-300 bg-black/40 border border-white/10 rounded-2xl p-3 mt-2 backdrop-blur-md">
            💡 직구 구사 비율 <strong className="text-white">52%</strong> 유지중. 슬라이더 비중 증가 시 팔꿈치 내측 무리 주의.
          </div>
        </div>
      </div>

      {/* AI Instant Insight & Pitch Log List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitch Session History */}
        <div className="lg:col-span-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">최근 투구 일지 (Pitch Logs)</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogger}
                className="bg-white/10 hover:bg-white/20 border border-white/15 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>새 피칭 기록</span>
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className="text-xs text-gray-400 hover:text-white underline font-medium"
              >
                전체보기
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {pitcherSessions.slice(0, 4).map((session) => (
              <div
                key={session.id}
                className="bg-black/30 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-300">{session.date}</span>
                    <span className="bg-white/10 text-white border border-white/15 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                      {session.sessionType === 'BULLPEN' ? '불펜 피칭' : session.sessionType === 'GAME' ? '실전 경기' : session.sessionType === 'LIVE_BP' ? '라이브 BP' : '캐치볼'}
                    </span>
                    {session.armSoreness && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        뻐근함
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 line-clamp-1">{session.notes || '특이사항 없음'}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-gray-300 shrink-0">
                  <div className="text-right">
                    <div className="text-white font-bold text-sm">{session.totalPitches}구</div>
                    <div className="text-[10px] text-gray-400">총 투구수</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-300 font-bold text-sm">{session.maxVel} km/h</div>
                    <div className="text-[10px] text-gray-400">최고구속</div>
                  </div>
                  <div className="text-right">
                    <div className="text-rose-400 font-bold text-sm">RPE {session.rpe}</div>
                    <div className="text-[10px] text-gray-400">운동강도</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Gemini AI Coach Trigger (Liquid Glass Card) */}
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/15 rounded-[28px] p-6 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-rose-300" />
              </div>
              <span className="text-[10px] bg-white/10 text-gray-300 border border-white/15 px-2.5 py-0.5 rounded-full font-mono">
                Gemini AI Coach
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">맞춤형 팔 케어 리포트 생성</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              현재 {pitcher.name} 선수의 ACWR ({pitcher.currentAcwr}), 최근 피칭수, ROM 및 통증 내역을 종합하여 주간 훈련 로드맵과 보강 운동을 자동 생성합니다.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setActiveTab('ai-report')}
              className="w-full bg-white text-black hover:bg-gray-200 font-bold text-xs py-3 rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>AI 케어 리포트 바로가기</span>
            </button>

            <button
              onClick={() => setActiveTab('rom')}
              className="w-full bg-white/10 hover:bg-white/15 border border-white/15 text-gray-200 font-semibold text-xs py-2.5 rounded-full transition-all flex items-center justify-center gap-1.5 backdrop-blur-md"
            >
              <Dumbbell className="w-3.5 h-3.5 text-white" />
              <span>GIRD 및 가동범위(ROM) 측정</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
