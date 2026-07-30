import React, { useState } from 'react';
import { Pitcher, PitchSession } from '../types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Calculator,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ArrowRight
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
  AreaChart,
  Area
} from 'recharts';

interface ACWRAnalyticsProps {
  pitcher: Pitcher;
  sessions: PitchSession[];
  setActiveTab: (tab: string) => void;
  onOpenLogger: () => void;
}

export const ACWRAnalytics: React.FC<ACWRAnalyticsProps> = ({
  pitcher,
  sessions,
  setActiveTab,
  onOpenLogger,
}) => {
  const pitcherSessions = sessions.filter((s) => s.pitcherId === pitcher.id);

  // Calculator custom state for user testing
  const [calcAcutePitches, setCalcAcutePitches] = useState<number>(142);
  const [calcChronicAvg, setCalcChronicAvg] = useState<number>(120);

  const calculatedRatio = calcChronicAvg > 0 ? (calcAcutePitches / calcChronicAvg).toFixed(2) : '0.00';
  const calcVal = parseFloat(calculatedRatio);

  // 28-day chart data
  const chartData = pitcherSessions.slice().reverse().map((s) => ({
    date: s.date,
    pitches: s.totalPitches,
    acwr: s.acwrImpact || 1.15,
    fastball: s.fastballCount,
    breaking: s.sliderCount + s.curveballCount + s.cutterCount,
    offspeed: s.changeupCount,
  }));

  const getAcwrStatus = (val: number) => {
    if (val > 1.5) {
      return {
        label: '고위험군 (Danger Zone)',
        color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        barColor: 'bg-rose-500',
        desc: '단기 투구량이 급격히 스파이크(Spike)되었습니다. 팔꿈치 UCL 및 어깨 회전근개 과부하 부상 위험이 2~4배 높습니다. 48~72시간 동안 라이브 피칭 및 불펜 투구를 즉시 중단하고 쉬어야 합니다.',
      };
    }
    if (val >= 1.3) {
      return {
        label: '주의 구간 (Caution Zone)',
        color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        barColor: 'bg-amber-500',
        desc: '투구 부하가 한계에 다다르고 있습니다. 다음 불펜 세션 투구수를 25~30구 이하로 제한하고, 직구 및 체인지업 위주의 저부하 피칭을 수행하세요.',
      };
    }
    if (val < 0.8) {
      return {
        label: '디컨디셔닝 (Underloading)',
        color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
        barColor: 'bg-blue-500',
        desc: '투구량이 부족하여 인대 및 근육의 고강도 투구 적응력이 저하될 수 있습니다. 규칙적인 캐치볼과 불펜 투구량을 단계적으로 늘려주세요.',
      };
    }
    return {
      label: '최적 적정 구간 (Sweet Spot)',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      barColor: 'bg-emerald-500',
      desc: '신체 적응력과 피로도 간의 완벽한 밸런스입니다. 퍼포먼스가 극대화되고 부상 위험이 가장 적은 안전 지대입니다.',
    };
  };

  const status = getAcwrStatus(pitcher.currentAcwr);

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Acute : Chronic Workload Ratio Analysis</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">부하 지수(ACWR) 정밀 트래킹</h1>
          <p className="text-gray-400 text-sm mt-1">
            Gabbett et al. 스포츠 과학 연구 표준에 입각한 투수의 단기(7일) vs 장기(28일) 피칭 워크로드 비율 계산기
          </p>
        </div>

        <button
          onClick={onOpenLogger}
          className="bg-white text-black hover:bg-gray-200 font-bold text-xs px-5 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          <span>+ 피칭 부하 기록하기</span>
        </button>
      </div>

      {/* Top ACWR Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitcher ACWR Score Card */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-mono font-semibold text-gray-400 uppercase tracking-wider">
              {pitcher.name} 선수의 현재 ACWR
            </span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-5xl font-black font-mono text-white">
                {pitcher.currentAcwr.toFixed(2)}
              </span>
              <span className="text-sm font-mono text-gray-400">/ 0.8 ~ 1.30 타겟</span>
            </div>
            <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
              <ShieldAlert className="w-4 h-4" />
              <span>{status.label}</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed bg-black/40 border border-white/5 p-4 rounded-2xl">
            {status.desc}
          </p>

          <div className="space-y-1.5 text-xs text-gray-400 font-mono">
            <div className="flex justify-between">
              <span>단기 7일 투구 수 (Acute):</span>
              <strong className="text-white">142 구</strong>
            </div>
            <div className="flex justify-between">
              <span>장기 28일 주평균 (Chronic):</span>
              <strong className="text-white">120 구/주</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive ACWR Simulator */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-900 via-gray-900/90 to-black border border-white/10 rounded-3xl p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <span>실시간 ACWR 자가 시뮬레이터</span>
            </h3>
            <span className="text-xs text-gray-400 font-mono">Acute ÷ Chronic</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input 1: Acute */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 flex justify-between">
                <span>최근 7일간의 총 투구수 (Acute Workload)</span>
                <span className="text-amber-400 font-mono font-bold">{calcAcutePitches} 구</span>
              </label>
              <input
                type="range"
                min="30"
                max="300"
                value={calcAcutePitches}
                onChange={(e) => setCalcAcutePitches(Number(e.target.value))}
                className="w-full accent-amber-400 bg-gray-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>30구 (휴식)</span>
                <span>150구 (보통)</span>
                <span>300구 (과부하)</span>
              </div>
            </div>

            {/* Input 2: Chronic */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300 flex justify-between">
                <span>지난 28일간 주평균 투구수 (Chronic Workload)</span>
                <span className="text-emerald-400 font-mono font-bold">{calcChronicAvg} 구/주</span>
              </label>
              <input
                type="range"
                min="40"
                max="250"
                value={calcChronicAvg}
                onChange={(e) => setCalcChronicAvg(Number(e.target.value))}
                className="w-full accent-emerald-400 bg-gray-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>40구</span>
                <span>120구</span>
                <span>250구</span>
              </div>
            </div>
          </div>

          {/* Result Box */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-[11px] text-gray-400 font-semibold uppercase">시뮬레이션 결과 ACWR</div>
              <div className="text-3xl font-black font-mono text-white mt-1">
                {calcVal.toFixed(2)}{' '}
                <span className="text-xs font-sans text-gray-400 font-normal">
                  ({calcVal > 1.5 ? '🔴 고위험' : calcVal >= 1.3 ? '🟠 주의' : calcVal < 0.8 ? '🔵 저부하' : '🟢 최적 존'})
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('ai-report')}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <span>이 상태로 AI 가이드 생성</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ACWR Chart & Workload Breakdown */}
      <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">날짜별 구종별 투구수 & ACWR 변동 추이</h3>
          <p className="text-xs text-gray-400">
            직구, 변구, 체인지업 비율에 따른 부하 누적량 시각화
          </p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="date" stroke="#666" fontSize={11} />
              <YAxis stroke="#888" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '12px', fontSize: '12px' }} />
              <Area type="monotone" dataKey="fastball" stackId="1" name="직구" stroke="#3B82F6" fill="#3B82F6" />
              <Area type="monotone" dataKey="breaking" stackId="1" name="변화구 (슬라이더/커브)" stroke="#F59E0B" fill="#F59E0B" />
              <Area type="monotone" dataKey="offspeed" stackId="1" name="오프스피드 (체인지업)" stroke="#EC4899" fill="#EC4899" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scientific Reference Zone Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 space-y-2">
          <div className="text-blue-400 text-xs font-bold font-mono">ACWR &lt; 0.8</div>
          <h4 className="font-bold text-sm text-white">디컨디셔닝 (Underloading)</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            투구 자극 부족으로 투구 동작 시 필요 인대와 근육의 내성이 약화됩니다.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-2">
          <div className="text-emerald-400 text-xs font-bold font-mono">0.8 ~ 1.30</div>
          <h4 className="font-bold text-sm text-white">최적 적정 존 (Sweet Spot)</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            부상 위험이 가장 낮으며 투수의 경기력과 스태미너가 최고조를 유지합니다.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 space-y-2">
          <div className="text-amber-400 text-xs font-bold font-mono">1.30 ~ 1.50</div>
          <h4 className="font-bold text-sm text-white">주의 존 (Caution Zone)</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            투구 부하 스파이크 현상 감지. 불펜 훈련 수량을 30% 감축해야 합니다.
          </p>
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 space-y-2">
          <div className="text-rose-400 text-xs font-bold font-mono">ACWR &gt; 1.50</div>
          <h4 className="font-bold text-sm text-white">고위험 존 (Danger Zone)</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            UCL 인대 파열 및 팔꿈치 염증 위험 급증. 피칭 즉시 중단 및 휴식 필요.
          </p>
        </div>
      </div>
    </div>
  );
};
