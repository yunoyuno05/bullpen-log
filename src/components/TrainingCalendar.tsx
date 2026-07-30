import React, { useState } from 'react';
import { Pitcher, PitchSession, DailyLog, PitchSequence, GoalRoadmap, RoutineItem } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Dumbbell,
  Moon,
  AlertCircle,
  FileText,
  Target,
  Trophy,
  Activity,
  Flame,
  Zap,
  Check
} from 'lucide-react';

interface TrainingCalendarProps {
  pitcher: Pitcher;
  sessions: PitchSession[];
  dailyLogs: DailyLog[];
  onSaveDailyLog: (log: DailyLog) => void;
  pitchSequences: PitchSequence[];
  onAddPitchSequence: (seq: Omit<PitchSequence, 'id'>) => void;
  goalRoadmap: GoalRoadmap;
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({
  pitcher,
  sessions,
  dailyLogs,
  onSaveDailyLog,
  pitchSequences,
  onAddPitchSequence,
  goalRoadmap,
}) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // July (0-indexed 6)
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-29');
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'game' | 'roadmap'>('calendar');

  // Filter logs & sessions for selected pitcher
  const pitcherSessions = sessions.filter((s) => s.pitcherId === pitcher.id);
  const pitcherDailyLogs = dailyLogs.filter((l) => l.pitcherId === pitcher.id);
  const pitcherSequences = pitchSequences.filter((s) => s.pitcherId === pitcher.id);

  // Get selected day log or default
  const currentDayLog = pitcherDailyLogs.find((l) => l.date === selectedDate) || {
    id: `dl-${selectedDate}`,
    pitcherId: pitcher.id,
    date: selectedDate,
    trainingType: 'REST' as const,
    painScore: 0,
    painLocation: '',
    sleepHours: 7.5,
    sleepQuality: 'GOOD' as const,
    diary: '',
    routines: [
      { id: 'r1', title: '어깨/팔꿈치 밴드 익스텐션 3세트', category: 'ARM_CARE', completed: false },
      { id: 'r2', title: '슬리퍼 스트레칭 (GIRD 예방)', category: 'STRETCH', completed: false },
      { id: 'r3', title: '단백질 보충제 및 글루타민 섭취', category: 'NUTRITION', completed: false },
      { id: 'r4', title: '아이스 팩 마사지 15분', category: 'RECOVERY', completed: false },
    ],
    weightVolumeKg: 0,
  };

  const currentDaySessions = pitcherSessions.filter((s) => s.date === selectedDate);

  // Form states for selected day log editing
  const [editPainScore, setEditPainScore] = useState<number>(currentDayLog.painScore);
  const [editPainLocation, setEditPainLocation] = useState<string>(currentDayLog.painLocation || '');
  const [editSleepHours, setEditSleepHours] = useState<number>(currentDayLog.sleepHours);
  const [editDiary, setEditDiary] = useState<string>(currentDayLog.diary);
  const [editWeightVolume, setEditWeightVolume] = useState<number>(currentDayLog.weightVolumeKg);
  const [routinesState, setRoutinesState] = useState<RoutineItem[]>(currentDayLog.routines);

  // New Pitch Sequence state
  const [newSeqOpponent, setNewSeqOpponent] = useState('라이벌 A팀');
  const [newSeqInning, setNewSeqInning] = useState(1);
  const [newSeqBatter, setNewSeqBatter] = useState('1번 타자');
  const [newSeqBallCount, setNewSeqBallCount] = useState('0-0');
  const [newSeqPitchType, setNewSeqPitchType] = useState('포심 직구');
  const [newSeqVelocity, setNewSeqVelocity] = useState(150);
  const [newSeqResult, setNewSeqResult] = useState<PitchSequence['result']>('STRIKE_SWINGING');

  // Handle routine toggle
  const toggleRoutine = (rId: string) => {
    setRoutinesState((prev) =>
      prev.map((r) => (r.id === rId ? { ...r, completed: !r.completed } : r))
    );
  };

  // Handle saving daily log
  const handleSaveDayLog = () => {
    const updatedLog: DailyLog = {
      ...currentDayLog,
      painScore: editPainScore,
      painLocation: editPainLocation,
      sleepHours: editSleepHours,
      diary: editDiary,
      weightVolumeKg: editWeightVolume,
      routines: routinesState,
    };
    onSaveDailyLog(updatedLog);
    alert(`${selectedDate} 일지와 루틴이 저장되었습니다!`);
  };

  // Handle adding new pitch sequence
  const handleCreateSequence = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPitchSequence({
      pitcherId: pitcher.id,
      date: selectedDate,
      opponent: newSeqOpponent,
      inning: Number(newSeqInning),
      batter: newSeqBatter,
      ballCount: newSeqBallCount,
      pitchType: newSeqPitchType,
      velocity: Number(newSeqVelocity),
      result: newSeqResult,
    });
    alert('새 투구 시퀀스가 기록되었습니다!');
  };

  // Calendar math (July 2026 has 31 days)
  const daysInMonth = 31;
  const startDayOfWeek = 3; // Wednesday for July 1 2026

  const calendarCells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDay = d < 10 ? `0${d}` : `${d}`;
    calendarCells.push(`2026-07-${formattedDay}`);
  }

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-white space-y-8">
      {/* Top Title & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30 tracking-wider">
              ATHLETE LOG SYSTEM
            </span>
            <span className="text-gray-400 text-xs">#{pitcher.number} {pitcher.name} 선수</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-white">
            훈련 캘린더 & 종합 선수 관리
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            일별 훈련 데이터, 통증 모니터링, 루틴 체크, 볼카운트 시퀀스, 목표 로드맵을 통합 관리합니다.
          </p>
        </div>

        {/* Apple Segmented Control */}
        <div className="flex items-center bg-black/40 border border-white/10 p-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-inner">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'calendar' ? 'bg-white text-black font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>월간 캘린더</span>
          </button>
          <button
            onClick={() => setActiveSubTab('game')}
            className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'game' ? 'bg-white text-black font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>게임로그 시퀀스</span>
          </button>
          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-4 py-2 rounded-full transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'roadmap' ? 'bg-white text-black font-bold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>목표 로드맵</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MONTHLY CALENDAR */}
      {activeSubTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Monthly Calendar Grid */}
          <div className="lg:col-span-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl">
            {/* Month Nav Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#34C759]/20 flex items-center justify-center border border-[#34C759]/30">
                  <CalendarIcon className="w-4 h-4 text-[#34C759]" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">2026년 7월 훈련 일정표</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-full bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 border border-white/10">2026. 07</span>
                <button className="p-2 rounded-full bg-white/10 border border-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-400 mb-3 border-b border-white/10 pb-2">
              <span className="text-rose-400">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className="text-blue-400">토</span>
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((dateStr, idx) => {
                if (!dateStr) {
                  return <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-white/[0.02]" />;
                }

                const isSelected = dateStr === selectedDate;
                const dayNum = parseInt(dateStr.slice(-2), 10);
                const daySessions = pitcherSessions.filter((s) => s.date === dateStr);
                const dayLog = pitcherDailyLogs.find((l) => l.date === dateStr);
                const totalPitches = daySessions.reduce((acc, s) => acc + s.totalPitches, 0);

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      if (dayLog) {
                        setEditPainScore(dayLog.painScore);
                        setEditPainLocation(dayLog.painLocation || '');
                        setEditSleepHours(dayLog.sleepHours);
                        setEditDiary(dayLog.diary);
                        setEditWeightVolume(dayLog.weightVolumeKg);
                        setRoutinesState(dayLog.routines);
                      }
                    }}
                    className={`h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg'
                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${isSelected ? 'text-emerald-300' : 'text-gray-300'}`}>
                        {dayNum}
                      </span>
                      {dayLog?.painScore && dayLog.painScore > 0 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">
                          통증 {dayLog.painScore}
                        </span>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      {totalPitches > 0 && (
                        <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 truncate">
                          피칭 {totalPitches}구
                        </div>
                      )}
                      {dayLog?.weightVolumeKg && dayLog.weightVolumeKg > 0 ? (
                        <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 truncate">
                          웨이트 {dayLog.weightVolumeKg}kg
                        </div>
                      ) : null}
                      {!totalPitches && (!dayLog || dayLog.weightVolumeKg === 0) && (
                        <div className="text-[9px] text-gray-500 italic">휴식/기록대기</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monthly Summary Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-gray-300">투구 세션</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-gray-300">웨이트 볼륨</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-gray-300">통증 감지</span>
                </div>
              </div>

              <div className="text-gray-400 font-medium">
                7월 총 투구수: <strong className="text-white">313구</strong> • 평균 통증: <strong className="text-emerald-400">0.8/10</strong>
              </div>
            </div>
          </div>

          {/* Right Col: Selected Date Detail Editor */}
          <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">DAILY ATHLETE LOG</span>
                <h3 className="text-lg font-extrabold">{selectedDate} 상세 일지</h3>
              </div>
              <button
                onClick={handleSaveDayLog}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-3.5 py-2 rounded-xl transition shadow-md flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>저장</span>
              </button>
            </div>

            {/* Pitching Summary on selected day */}
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-2xl space-y-2">
              <div className="text-xs font-bold text-gray-300 flex items-center justify-between">
                <span>오늘의 피칭 기록</span>
                <span className="text-emerald-400">{currentDaySessions.length}개 세션</span>
              </div>
              {currentDaySessions.length > 0 ? (
                currentDaySessions.map((s) => (
                  <div key={s.id} className="text-xs text-gray-300 bg-black/40 p-2.5 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">{s.sessionType}</span> • {s.totalPitches}구 (최고 {s.maxVel}km/h)
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400">RPE {s.rpe}/10</span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic py-1">이 날짜의 상기 투구 기록이 없습니다.</div>
              )}
            </div>

            {/* Pain Score Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-300 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  통증/뻐근함 수치 (0-10)
                </span>
                <span className={`px-2 py-0.5 rounded font-extrabold ${editPainScore > 3 ? 'bg-rose-500 text-white' : 'bg-white/10 text-emerald-300'}`}>
                  {editPainScore}점
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                value={editPainScore}
                onChange={(e) => setEditPainScore(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <input
                type="text"
                placeholder="통증 부위 (예: 팔꿈치 내측, 어깨 후면)"
                value={editPainLocation}
                onChange={(e) => setEditPainLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Sleep & Weight Volume */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                  <Moon className="w-3 h-3 text-cyan-400" /> 수면 시간 (시간)
                </label>
                <input
                  type="number"
                  step={0.5}
                  value={editSleepHours}
                  onChange={(e) => setEditSleepHours(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-gray-400 font-bold flex items-center gap-1">
                  <Dumbbell className="w-3 h-3 text-emerald-400" /> 웨이트 볼륨 (kg)
                </label>
                <input
                  type="number"
                  step={100}
                  value={editWeightVolume}
                  onChange={(e) => setEditWeightVolume(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            {/* Daily Routine Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-300 flex items-center justify-between">
                <span>데일리 리커버리 루틴</span>
                <span className="text-[10px] text-gray-400">
                  {routinesState.filter((r) => r.completed).length} / {routinesState.length} 달성
                </span>
              </span>

              <div className="space-y-1.5">
                {routinesState.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => toggleRoutine(r.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center gap-2.5 ${
                      r.completed
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {r.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                    <span className={r.completed ? 'line-through opacity-80' : ''}>{r.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Diary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> 훈련일기 및 개인 소감
              </label>
              <textarea
                rows={3}
                placeholder="오늘 훈련 시 투구 폼, 피로도, 보강이 필요한 점을 자유롭게 기록하세요..."
                value={editDiary}
                onChange={(e) => setEditDiary(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-white/30 resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: GAME LOG SEQUENCES */}
      {activeSubTab === 'game' && (
        <div className="space-y-8">
          {/* New Sequence Form Box */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-900/80 to-black border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              볼카운트별 실전 피칭 시퀀스 입력
            </h2>
            <p className="text-gray-400 text-xs mb-4">
              실전 경기에서 상대 타자별 투구 구종, 구속, 구사 결과 및 피칭 시퀀스를 정밀하게 기록합니다.
            </p>

            <form onSubmit={handleCreateSequence} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
              <div>
                <label className="text-gray-400 block mb-1">상대 팀</label>
                <input
                  type="text"
                  value={newSeqOpponent}
                  onChange={(e) => setNewSeqOpponent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">이닝</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={newSeqInning}
                  onChange={(e) => setNewSeqInning(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">타자 정보</label>
                <input
                  type="text"
                  value={newSeqBatter}
                  onChange={(e) => setNewSeqBatter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">볼카운트</label>
                <input
                  type="text"
                  value={newSeqBallCount}
                  onChange={(e) => setNewSeqBallCount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">구종</label>
                <select
                  value={newSeqPitchType}
                  onChange={(e) => setNewSeqPitchType(e.target.value)}
                  className="w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                >
                  <option value="포심 직구">포심 직구</option>
                  <option value="슬라이더">슬라이더</option>
                  <option value="커브">커브</option>
                  <option value="체인지업">체인지업</option>
                  <option value="투심/커터">투심/커터</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 block mb-1">구속 (km/h)</label>
                <input
                  type="number"
                  value={newSeqVelocity}
                  onChange={(e) => setNewSeqVelocity(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white font-semibold"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-end">
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>추가</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Sequences Table */}
          <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-base font-bold mb-4">누적 경기 시퀀스 이력 ({pitcherSequences.length}건)</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">날짜</th>
                    <th className="py-3 px-3">상대팀</th>
                    <th className="py-3 px-3">이닝/타자</th>
                    <th className="py-3 px-3">볼카운트</th>
                    <th className="py-3 px-3">구종</th>
                    <th className="py-3 px-3">구속</th>
                    <th className="py-3 px-3">결과</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pitcherSequences.map((seq) => (
                    <tr key={seq.id} className="hover:bg-white/5 transition">
                      <td className="py-3 px-3 font-semibold text-gray-300">{seq.date}</td>
                      <td className="py-3 px-3 font-bold text-white">{seq.opponent}</td>
                      <td className="py-3 px-3 text-gray-300">{seq.inning}회 • {seq.batter}</td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">{seq.ballCount}</td>
                      <td className="py-3 px-3 font-bold text-blue-400">{seq.pitchType}</td>
                      <td className="py-3 px-3 font-extrabold text-emerald-400">{seq.velocity} km/h</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full bg-white/10 font-bold text-[10px] text-gray-200">
                          {seq.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: GOAL ROADMAP */}
      {activeSubTab === 'roadmap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Target Metrics Cards */}
          <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              선수 단기/장기 목표 로드맵
            </h2>

            {/* Velocity Progress */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-300">목표 구속 (Fastball Target)</span>
                <span className="text-amber-400 font-extrabold">{goalRoadmap.currentVelocity} / {goalRoadmap.targetVelocity} km/h</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${(goalRoadmap.currentVelocity / goalRoadmap.targetVelocity) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 text-right">+4 km/h 구속 향상 목표 달성률 97%</div>
            </div>

            {/* Weight Progress */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-gray-300">목표 체중 (Body Weight Target)</span>
                <span className="text-cyan-400 font-extrabold">{goalRoadmap.currentWeight} / {goalRoadmap.targetWeight} kg</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${(goalRoadmap.currentWeight / goalRoadmap.targetWeight) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-gray-400 text-right">체중 벌크업 2kg 추가 목표</div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl text-xs space-y-1">
              <div className="font-bold text-emerald-300">목표 달성 예정일</div>
              <div className="text-lg font-black text-white">{goalRoadmap.targetDate}</div>
              <p className="text-gray-400 text-[11px]">바이오메카닉스 파워 분석을 기반으로 설정된 개별 타임라인입니다.</p>
            </div>
          </div>

          {/* Phase Roadmap Timeline */}
          <div className="lg:col-span-2 bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6">
            <h3 className="text-lg font-bold">단계별 훈련 로드맵 (Periodization)</h3>

            <div className="space-y-4">
              {goalRoadmap.phases.map((ph, idx) => (
                <div
                  key={ph.id}
                  className={`p-5 rounded-2xl border transition ${
                    ph.isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold uppercase text-amber-300">PHASE 0{idx + 1}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      ph.isCompleted ? 'bg-emerald-500 text-black' : 'bg-white/10 text-gray-300'
                    }`}>
                      {ph.duration}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{ph.phaseName}</h4>
                  <p className="text-xs text-gray-400">{ph.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
