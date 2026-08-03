import React, { useState, useEffect } from 'react';
import {
  Pitcher,
  PitchSession,
  DailyLog,
  PitchSequence,
  GoalRoadmap,
  RoutineItem,
  TrainingScheduleItem,
  PitchVideo
} from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  CheckCircle2,
  Circle,
  Dumbbell,
  Moon,
  AlertCircle,
  FileText,
  Target,
  Flame,
  Zap,
  Check,
  Clock,
  Trash2,
  Tag,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  Activity,
  ChevronDown,
  Video,
  Play
} from 'lucide-react';
import { CalendarVideoTab } from './CalendarVideoTab';

interface TrainingCalendarProps {
  pitcher: Pitcher;
  sessions: PitchSession[];
  dailyLogs: DailyLog[];
  onSaveDailyLog: (log: DailyLog) => void;
  pitchSequences: PitchSequence[];
  onAddPitchSequence: (seq: Omit<PitchSequence, 'id'>) => void;
  goalRoadmap: GoalRoadmap;
  schedules: TrainingScheduleItem[];
  onSaveSchedule: (schedule: TrainingScheduleItem) => void;
  onDeleteSchedule: (id: string) => void;
  onToggleScheduleCompleted: (id: string) => void;
  autoArchivePassedSchedules: boolean;
  onToggleAutoArchive: () => void;
  videos?: PitchVideo[];
  onAddVideo?: (video: Omit<PitchVideo, 'id'>) => void;
  onOpenVideoArchive?: (videoId?: string) => void;
}

export const TrainingCalendar: React.FC<TrainingCalendarProps> = ({
  pitcher,
  sessions,
  dailyLogs,
  onSaveDailyLog,
  pitchSequences,
  onAddPitchSequence,
  goalRoadmap,
  schedules,
  onSaveSchedule,
  onDeleteSchedule,
  onToggleScheduleCompleted,
  autoArchivePassedSchedules,
  onToggleAutoArchive,
  videos = [],
  onAddVideo = () => {},
  onOpenVideoArchive,
}) => {
  const todayObj = new Date();
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  const [currentYear, setCurrentYear] = useState<number>(todayObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayObj.getMonth() + 1); // 1-12
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  
  // Subtab navigation: 'main' (Main summary calendar), 'calendar-video' (15s pitch video tab), 'schedule' (Schedule planning), 'history' (Past logs & records), 'game' (Game sequence), 'roadmap' (Goal roadmap)
  const [activeSubTab, setActiveSubTab] = useState<'main' | 'calendar-video' | 'schedule' | 'history' | 'game' | 'roadmap'>('main');

  // Schedule creation form states
  const [schedDate, setSchedDate] = useState<string>(todayStr);
  const [schedTime, setSchedTime] = useState<string>('14:00');
  const [schedCategory, setSchedCategory] = useState<TrainingScheduleItem['category']>('WEIGHT');
  const [schedTitle, setSchedTitle] = useState<string>('');
  const [schedIntensity, setSchedIntensity] = useState<TrainingScheduleItem['intensity']>('HIGH');
  const [schedDetails, setSchedDetails] = useState<string>('');
  const [schedDuration, setSchedDuration] = useState<number>(60);
  const [schedFilterCategory, setSchedFilterCategory] = useState<string>('ALL');

  // Auto-Archive effect: when turned ON, automatically mark passed schedules as completed
  useEffect(() => {
    if (autoArchivePassedSchedules && schedules.length > 0) {
      schedules.forEach((sch) => {
        if (sch.date < todayStr && !sch.completed) {
          onToggleScheduleCompleted(sch.id);
        }
      });
    }
  }, [autoArchivePassedSchedules, schedules, todayStr]);

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0: Sun, 1: Mon...

  const calendarCells: (string | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formattedDay = d < 10 ? `0${d}` : `${d}`;
    const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
    calendarCells.push(`${currentYear}-${formattedMonth}-${formattedDay}`);
  }

  // Navigation handlers
  const handlePrevYear = () => setCurrentYear((y) => y - 1);
  const handleNextYear = () => setCurrentYear((y) => y + 1);
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };
  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth() + 1);
    setSelectedDate(todayStr);
  };

  // Pitcher filtered items
  const pitcherSessions = sessions.filter((s) => s.pitcherId === pitcher.id);
  const pitcherDailyLogs = dailyLogs.filter((l) => l.pitcherId === pitcher.id);
  const pitcherSequences = pitchSequences.filter((s) => s.pitcherId === pitcher.id);
  const pitcherSchedules = schedules.filter((s) => s.pitcherId === pitcher.id);
  const pitcherVideos = (videos || []).filter((v) => v.pitcherId === pitcher.id);

  // Selected date items
  const selectedDateSchedules = pitcherSchedules.filter((s) => s.date === selectedDate);
  const selectedDateSessions = pitcherSessions.filter((s) => s.date === selectedDate);
  const selectedDateLog = pitcherDailyLogs.find((l) => l.date === selectedDate);
  const selectedDateVideos = pitcherVideos.filter((v) => v.date === selectedDate);

  // Record Form States for History subtab
  const currentDayLog = selectedDateLog || {
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

  const [editPainScore, setEditPainScore] = useState<number>(currentDayLog.painScore);
  const [editPainLocation, setEditPainLocation] = useState<string>(currentDayLog.painLocation || '');
  const [editSleepHours, setEditSleepHours] = useState<number>(currentDayLog.sleepHours);
  const [editDiary, setEditDiary] = useState<string>(currentDayLog.diary);
  const [editWeightVolume, setEditWeightVolume] = useState<number>(currentDayLog.weightVolumeKg);
  const [editTrainingType, setEditTrainingType] = useState<DailyLog['trainingType']>(currentDayLog.trainingType);
  const [routinesState, setRoutinesState] = useState<RoutineItem[]>(currentDayLog.routines);

  // Update record form state when selectedDate changes
  useEffect(() => {
    setEditPainScore(currentDayLog.painScore);
    setEditPainLocation(currentDayLog.painLocation || '');
    setEditSleepHours(currentDayLog.sleepHours);
    setEditDiary(currentDayLog.diary);
    setEditWeightVolume(currentDayLog.weightVolumeKg);
    setEditTrainingType(currentDayLog.trainingType);
    setRoutinesState(currentDayLog.routines);
  }, [selectedDate, selectedDateLog]);

  // Handle routine toggle
  const toggleRoutine = (rId: string) => {
    setRoutinesState((prev) =>
      prev.map((r) => (r.id === rId ? { ...r, completed: !r.completed } : r))
    );
  };

  // Handle saving past daily record log
  const handleSaveDayLog = () => {
    const updatedLog: DailyLog = {
      ...currentDayLog,
      trainingType: editTrainingType,
      painScore: editPainScore,
      painLocation: editPainLocation,
      sleepHours: editSleepHours,
      diary: editDiary,
      weightVolumeKg: editWeightVolume,
      routines: routinesState,
    };
    onSaveDailyLog(updatedLog);
    alert(`${selectedDate} 과거 훈련 기록이 성공적으로 저장되었습니다!`);
  };

  // Schedule Submit Handler
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle.trim()) {
      alert('훈련 제목을 입력해주세요.');
      return;
    }

    const newSch: TrainingScheduleItem = {
      id: `ts-${Date.now()}`,
      pitcherId: pitcher.id,
      date: schedDate,
      time: schedTime,
      category: schedCategory,
      title: schedTitle.trim(),
      intensity: schedIntensity,
      details: schedDetails.trim(),
      durationMinutes: Number(schedDuration),
      completed: false,
    };

    onSaveSchedule(newSch);
    setSchedTitle('');
    setSchedDetails('');
    alert(`${schedDate} 훈련 스케줄이 성공적으로 등록되었습니다!`);
  };

  // New Pitch Sequence form state
  const [newSeqOpponent, setNewSeqOpponent] = useState('라이벌 A팀');
  const [newSeqInning, setNewSeqInning] = useState(1);
  const [newSeqBatter, setNewSeqBatter] = useState('1번 타자');
  const [newSeqBallCount, setNewSeqBallCount] = useState('0-0');
  const [newSeqPitchType, setNewSeqPitchType] = useState('포심 직구');
  const [newSeqVelocity, setNewSeqVelocity] = useState(150);
  const [newSeqResult, setNewSeqResult] = useState<PitchSequence['result']>('STRIKE_SWINGING');

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

  // Category labels and badges helper
  const getCategoryBadge = (cat: TrainingScheduleItem['category']) => {
    switch (cat) {
      case 'WEIGHT':
        return { label: '웨이트', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'BULLPEN':
        return { label: '불펜피칭', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'LONG_TOSS':
        return { label: '롱토스', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'CONDITIONING':
        return { label: '컨디셔닝', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' };
      case 'RECOVERY':
        return { label: '리커버리', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'TACTICAL':
        return { label: '전술훈련', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'REST':
        return { label: '휴식', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
      default:
        return { label: '맞춤훈련', color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' };
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-white space-y-8">
      {/* Top Header & Navigation Segmented Control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase bg-[#34C759]/20 text-[#34C759] border border-[#34C759]/30 tracking-wider">
              ATHLETE TRAINER HUB
            </span>
            <span className="text-gray-400 text-xs">#{pitcher.number} {pitcher.name} 선수</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight text-white">
            훈련 캘린더
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            훈련 스케줄 계획, 과거 피칭/웨이트 기록
          </p>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center bg-black/50 border border-white/10 p-1.5 rounded-2xl text-xs font-semibold backdrop-blur-md gap-1">
          <button
            onClick={() => setActiveSubTab('main')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'main' ? 'bg-white text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>메인 캘린더</span>
          </button>

          <button
            onClick={() => setActiveSubTab('calendar-video')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'calendar-video' ? 'bg-emerald-500 text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>투구 영상 저장</span>
            {pitcherVideos.length > 0 && (
              <span className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                activeSubTab === 'calendar-video' ? 'bg-black/20 text-black' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {pitcherVideos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('schedule')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'schedule' ? 'bg-white text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>일정 계획</span>
            {pitcherSchedules.filter((s) => !s.completed).length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-black font-black">
                {pitcherSchedules.filter((s) => !s.completed).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('history')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'history' ? 'bg-white text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>기록</span>
          </button>

          <button
            onClick={() => setActiveSubTab('game')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'game' ? 'bg-white text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>게임로그 시퀀스</span>
          </button>

          <button
            onClick={() => setActiveSubTab('roadmap')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'roadmap' ? 'bg-white text-black font-extrabold shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 text-cyan-400" />
            <span>목표 로드맵</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBTAB 1: MAIN CALENDAR TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'main' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Monthly Calendar Grid */}
            <div className="lg:col-span-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 sm:p-7 shadow-2xl space-y-6">
              {/* Year & Month Navigation Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-emerald-400" />
                  <div className="flex items-center gap-2">
                    {/* Year Dropdown Select */}
                    <div className="relative">
                      <select
                        value={currentYear}
                        onChange={(e) => setCurrentYear(Number(e.target.value))}
                        className="bg-black/60 border border-white/20 text-white text-lg sm:text-2xl font-black rounded-xl pl-3 pr-8 py-1 appearance-none focus:outline-none focus:border-emerald-400 cursor-pointer"
                      >
                        {Array.from({ length: 21 }, (_, i) => todayObj.getFullYear() - 10 + i).map((y) => (
                          <option key={y} value={y} className="bg-[#1c1c1e] text-white">
                            {y}년
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Month Dropdown Select */}
                    <div className="relative">
                      <select
                        value={currentMonth}
                        onChange={(e) => setCurrentMonth(Number(e.target.value))}
                        className="bg-black/60 border border-white/20 text-white text-lg sm:text-2xl font-black rounded-xl pl-3 pr-8 py-1 appearance-none focus:outline-none focus:border-emerald-400 cursor-pointer"
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m} className="bg-[#1c1c1e] text-white">
                            {m}월
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                {/* Navigation Controls: Prev/Next Month & Year */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 rounded-2xl p-1 backdrop-blur-md">
                  <button
                    onClick={handlePrevYear}
                    title="1년 전"
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handlePrevMonth}
                    title="1달 전"
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleToday}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer border border-white/10"
                    title="오늘 날짜로 이동"
                  >
                    오늘
                  </button>

                  <button
                    onClick={handleNextMonth}
                    title="1달 후"
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextYear}
                    title="1년 후"
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition cursor-pointer"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Month Selection Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <span className="text-gray-400 text-[11px] font-bold mr-1 shrink-0">빠른 월 선택:</span>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const isCurrent = m === currentMonth;
                  return (
                    <button
                      key={`main-m-pill-${m}`}
                      onClick={() => setCurrentMonth(m)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500 text-black shadow-md scale-105'
                          : 'bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white border border-white/10'
                      }`}
                    >
                      {m}월
                    </button>
                  );
                })}
              </div>

              {/* Day of week headers */}
              <div className="grid grid-cols-7 text-center text-xs font-extrabold text-gray-400">
                <div className="text-rose-400 py-1">일</div>
                <div className="py-1">월</div>
                <div className="py-1">화</div>
                <div className="py-1">수</div>
                <div className="py-1">목</div>
                <div className="py-1">금</div>
                <div className="text-blue-400 py-1">토</div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((dateStr, idx) => {
                  if (!dateStr) {
                    return <div key={`empty-${idx}`} className="h-24 sm:h-28 rounded-2xl bg-white/[0.02]" />;
                  }

                  const dayNum = parseInt(dateStr.split('-')[2]);
                  const isToday = dateStr === todayStr;
                  const isSelected = dateStr === selectedDate;

                  const daySchedules = pitcherSchedules.filter((s) => s.date === dateStr);
                  const daySessions = pitcherSessions.filter((s) => s.date === dateStr);
                  const dayLog = pitcherDailyLogs.find((l) => l.date === dateStr);
                  const dayVideos = pitcherVideos.filter((v) => v.date === dateStr);

                  const upcomingCount = daySchedules.filter((s) => !s.completed).length;
                  const completedSchedCount = daySchedules.filter((s) => s.completed).length;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDate(dateStr);
                        setSchedDate(dateStr);
                      }}
                      className={`h-24 sm:h-28 rounded-2xl p-2 border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                        isSelected
                          ? 'bg-white/15 border-white shadow-lg ring-2 ring-white/50 z-10'
                          : isToday
                          ? 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20'
                          : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {/* Day number & Today badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs sm:text-sm font-extrabold ${
                            isToday
                              ? 'text-emerald-400'
                              : isSelected
                              ? 'text-white'
                              : 'text-gray-300 group-hover:text-white'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {isToday && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-black">
                            오늘
                          </span>
                        )}
                      </div>

                      {/* Day summary badges */}
                      <div className="space-y-1 w-full overflow-hidden">
                        {/* Pitch Video Badge */}
                        {dayVideos.length > 0 && (
                          <div className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 truncate flex items-center gap-1">
                            <Video className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>투구 영상 {dayVideos.length}개</span>
                          </div>
                        )}

                        {/* Upcoming Schedules Badge */}
                        {upcomingCount > 0 && (
                          <div className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                            <span>일정 {upcomingCount}건</span>
                          </div>
                        )}

                        {/* Completed Records Badge */}
                        {(completedSchedCount > 0 || daySessions.length > 0 || (dayLog && dayLog.diary)) && (
                          <div className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 truncate flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>
                              기록 {completedSchedCount + daySessions.length + (dayLog?.diary ? 1 : 0)}건
                            </span>
                          </div>
                        )}

                        {/* Soreness warning badge */}
                        {dayLog && dayLog.painScore > 0 && (
                          <div className="text-[10px] px-1 py-0.2 rounded-md bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 truncate">
                            ⚠️ 통증 {dayLog.painScore}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Selected Date Quick Overview Card */}
            <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs text-gray-400 font-bold">선택한 날짜 요약</span>
                    <h3 className="text-xl font-extrabold text-white">{selectedDate}</h3>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSchedDate(selectedDate);
                        setActiveSubTab('schedule');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-bold border border-blue-500/40 transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>일정 추가</span>
                    </button>

                    <button
                      onClick={() => setActiveSubTab('history')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-500/40 transition cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>기록 입력</span>
                    </button>
                  </div>
                </div>

                {/* 1. Schedule Summary section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>📅 해당 일자 예정 훈련 ({selectedDateSchedules.filter((s) => !s.completed).length})</span>
                    </h4>
                  </div>

                  {selectedDateSchedules.filter((s) => !s.completed).length === 0 ? (
                    <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-xs text-gray-400 text-center">
                      예정된 훈련 스케줄이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {selectedDateSchedules
                        .filter((s) => !s.completed)
                        .map((sch) => {
                          const badge = getCategoryBadge(sch.category);
                          return (
                            <div
                              key={sch.id}
                              className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1.5 hover:bg-white/10 transition"
                            >
                              <div className="flex items-center justify-between">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badge.color}`}>
                                  {badge.label}
                                </span>
                                <span className="text-[11px] text-gray-400">{sch.time || '시간 미지정'}</span>
                              </div>
                              <div className="text-xs font-extrabold text-white">{sch.title}</div>
                              {sch.details && (
                                <div className="text-[11px] text-gray-400 line-clamp-2">{sch.details}</div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* 2. Record Summary section */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>📋 완료된 기록 요약</span>
                  </h4>

                  <div className="space-y-2">
                    {/* Pitching session history */}
                    {selectedDateSessions.length > 0 && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                        <div className="text-xs font-extrabold text-emerald-300">
                          ⚾ 투구 세션: 총 {selectedDateSessions.reduce((acc, s) => acc + s.totalPitches, 0)}구
                        </div>
                        <div className="text-[11px] text-gray-300">
                          최고 구속: {Math.max(...selectedDateSessions.map((s) => s.maxVel))} km/h | RPE:{' '}
                          {selectedDateSessions[0]?.rpe}
                        </div>
                      </div>
                    )}

                    {/* Weight volume history */}
                    {selectedDateLog && selectedDateLog.weightVolumeKg > 0 && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs font-extrabold text-blue-300">
                        🏋️‍♂️ 웨이트 볼륨: {selectedDateLog.weightVolumeKg.toLocaleString()} kg
                      </div>
                    )}

                    {/* Pitch Video Section */}
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-emerald-300 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-emerald-400" />
                          <span>🎥 투구 영상 ({selectedDateVideos.length}개)</span>
                        </span>
                        <button
                          onClick={() => setActiveSubTab('calendar-video')}
                          className="text-[10px] font-extrabold text-emerald-400 hover:underline cursor-pointer"
                        >
                          영상 탭 이동 ▶
                        </button>
                      </div>

                      {selectedDateVideos.length === 0 ? (
                        <p className="text-[11px] text-gray-400">
                          이 날짜에 저장된 투구 영상이 없습니다.
                        </p>
                      ) : (
                        <div className="space-y-1 pt-1">
                          {selectedDateVideos.map((v) => (
                            <div
                              key={v.id}
                              onClick={() => setActiveSubTab('calendar-video')}
                              className="p-2 bg-black/60 rounded-xl flex items-center justify-between text-[11px] hover:bg-black transition cursor-pointer"
                            >
                              <span className="font-bold text-white truncate max-w-[150px]">{v.title}</span>
                              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                                {v.velocity}km/h <Play className="w-3 h-3 fill-emerald-400" />
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Diary */}
                    {selectedDateLog && selectedDateLog.diary ? (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-gray-300 leading-relaxed italic">
                        "{selectedDateLog.diary}"
                      </div>
                    ) : (
                      selectedDateSessions.length === 0 &&
                      selectedDateVideos.length === 0 &&
                      (!selectedDateLog || selectedDateLog.weightVolumeKg === 0) && (
                        <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-xs text-gray-400 text-center">
                          완료된 훈련 기록이 아직 없습니다.
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Nav Banner */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-2xl text-xs space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>스케줄 & 영상 관리 팁</span>
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  '투구 영상 저장' 탭에서 웹캠으로 바로 투구 모션을 녹화하면 캘린더 해당 일자에 자동 저장 및 프레임 단위 분석이 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB: 15-SECOND CALENDAR PITCH VIDEO TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'calendar-video' && (
        <CalendarVideoTab
          pitcher={pitcher}
          videos={videos || []}
          onAddVideo={onAddVideo || (() => {})}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpenArchive={onOpenVideoArchive}
        />
      )}

      {/* ========================================================= */}
      {/* SUBTAB 2: SCHEDULE PLANNING TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'schedule' && (
        <div className="space-y-8">
          {/* Header Banner with Auto-Archive Toggle Switch */}
          <div className="bg-[#1c1c1e]/90 border border-white/15 rounded-[28px] p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-extrabold text-white">야구 & 웨이트 훈련 스케줄 계획 및 세분화</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                웨이트 트레이닝, 불펜 피칭, 롱토스, 컨디셔닝, 리커버리 등 모든 야구 훈련 일정을 체계적으로 계획하세요.
              </p>
            </div>

            {/* Auto-Move Passed Schedules Toggle */}
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 p-3 rounded-2xl backdrop-blur-md">
              <div className="text-right">
                <div className="text-xs font-bold text-white">지나간 일정 자동 기록 전환</div>
                <div className="text-[10px] text-gray-400">날짜가 지나면 자동으로 기록으로 백업</div>
              </div>

              <button
                type="button"
                onClick={onToggleAutoArchive}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoArchivePassedSchedules ? 'bg-emerald-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoArchivePassedSchedules ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 1 Col: Schedule Creation Form */}
            <form
              onSubmit={handleCreateSchedule}
              className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-extrabold text-white">새 훈련 일정 추가</h3>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">훈련 날짜</label>
                  <input
                    type="date"
                    required
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">시간</label>
                  <input
                    type="time"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">훈련 분류</label>
                <select
                  value={schedCategory}
                  onChange={(e) => setSchedCategory(e.target.value as any)}
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40 cursor-pointer"
                >
                  <option value="WEIGHT">🏋️‍♂️ 웨이트 트레이닝 (Weight)</option>
                  <option value="BULLPEN">⚾ 불펜 피칭 (Bullpen)</option>
                  <option value="LONG_TOSS">🎯 롱토스 & 캐치볼 (Long Toss)</option>
                  <option value="CONDITIONING">🏃‍♂️ 러닝 & 컨디셔닝 (Conditioning)</option>
                  <option value="RECOVERY">🧊 리커버리 & 보강운동 (Recovery)</option>
                  <option value="TACTICAL">📋 전술 & 수비 훈련 (Tactical)</option>
                  <option value="REST">💤 휴식 & 멘탈 (Rest)</option>
                  <option value="CUSTOM">⚙️ 기타 맞춤 훈련 (Custom)</option>
                </select>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">훈련 제목</label>
                <input
                  type="text"
                  required
                  placeholder="예: 하체 폭발력 스쿼트 & 회전 코어 세션"
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              {/* Intensity & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">운동 강도</label>
                  <select
                    value={schedIntensity}
                    onChange={(e) => setSchedIntensity(e.target.value as any)}
                    className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                  >
                    <option value="HIGH">고강도 (High)</option>
                    <option value="MEDIUM">중강도 (Medium)</option>
                    <option value="LOW">저강도 (Low)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-300">소요 시간(분)</label>
                  <input
                    type="number"
                    value={schedDuration}
                    onChange={(e) => setSchedDuration(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              {/* Details & Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">세부 종목 / 세트 / 노트</label>
                <textarea
                  rows={3}
                  placeholder="예: 하프 스쿼트 120kg 5x5, 데드리프트 140kg 3x5, 어깨 밴드 보강 3세트"
                  value={schedDetails}
                  onChange={(e) => setSchedDetails(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>훈련 스케줄 등록하기</span>
              </button>
            </form>

            {/* Right 2 Cols: Schedule List with Filters */}
            <div className="lg:col-span-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">등록된 훈련 스케줄 목록</h3>
                  <p className="text-xs text-gray-400">체크박스를 눌러 완료 여부를 토글할 수 있습니다.</p>
                </div>

                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <select
                    value={schedFilterCategory}
                    onChange={(e) => setSchedFilterCategory(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white cursor-pointer"
                  >
                    <option value="ALL">전체 보기</option>
                    <option value="WEIGHT">웨이트 트레이닝</option>
                    <option value="BULLPEN">불펜 피칭</option>
                    <option value="LONG_TOSS">롱토스</option>
                    <option value="CONDITIONING">컨디셔닝</option>
                    <option value="RECOVERY">리커버리</option>
                  </select>
                </div>
              </div>

              {/* Schedule cards list */}
              {pitcherSchedules.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-2 bg-white/5 rounded-2xl border border-white/5">
                  <Clock className="w-10 h-10 mx-auto text-gray-500" />
                  <p className="text-sm font-bold">등록된 훈련 스케줄이 없습니다.</p>
                  <p className="text-xs">왼쪽 폼에서 첫 야구/웨이트 훈련 일정을 등록해보세요.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {pitcherSchedules
                    .filter((s) => schedFilterCategory === 'ALL' || s.category === schedFilterCategory)
                    .map((sch) => {
                      const badge = getCategoryBadge(sch.category);
                      const isPast = sch.date < todayStr;

                      return (
                        <div
                          key={sch.id}
                          className={`p-4 border rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                            sch.completed
                              ? 'bg-white/5 border-emerald-500/30 opacity-80'
                              : isPast
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => onToggleScheduleCompleted(sch.id)}
                              className="mt-1 cursor-pointer hover:scale-110 transition"
                            >
                              {sch.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 hover:text-white" />
                              )}
                            </button>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${badge.color}`}>
                                  {badge.label}
                                </span>

                                <span className="text-xs font-bold text-gray-300">📅 {sch.date}</span>
                                {sch.time && <span className="text-xs text-gray-400">⏰ {sch.time}</span>}

                                {sch.intensity && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/10 text-gray-300">
                                    강도: {sch.intensity}
                                  </span>
                                )}

                                {isPast && !sch.completed && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                    지나간 일정
                                  </span>
                                )}
                              </div>

                              <div className={`text-sm font-extrabold ${sch.completed ? 'line-through text-gray-400' : 'text-white'}`}>
                                {sch.title}
                              </div>

                              {sch.details && (
                                <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                                  {sch.details}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                            <button
                              onClick={() => onDeleteSchedule(sch.id)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 3: RECORD & HISTORY TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'history' && (
        <div className="space-y-8">
          <div className="bg-[#1c1c1e]/90 border border-white/15 rounded-[28px] p-6 shadow-2xl space-y-2 backdrop-blur-2xl">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-extrabold text-white">과거 훈련 기록 및 피드백 일지 입력</h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400">
              선택한 날짜 ({selectedDate})의 훈련 종목, 통증 점수, 수면 시간, 웨이트 중량 및 세부 일지를 남기고 관리하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 1 Col: Record Input Form for Selected Date */}
            <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-extrabold text-white">📝 {selectedDate} 훈련 기록 남기기</h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white"
                />
              </div>

              {/* Training Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">메인 훈련 구체 유형</label>
                <select
                  value={editTrainingType}
                  onChange={(e) => setEditTrainingType(e.target.value as any)}
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="BULLPEN">불펜 피칭 (Bullpen)</option>
                  <option value="GAME">실전 경기 (Game)</option>
                  <option value="WEIGHT">웨이트 트레이닝 (Weight)</option>
                  <option value="REHAB">재활 & 보강 (Rehab)</option>
                  <option value="REST">휴식 (Rest)</option>
                </select>
              </div>

              {/* Weight volume */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">총 웨이트 볼륨 (kg)</label>
                <input
                  type="number"
                  placeholder="예: 7800"
                  value={editWeightVolume}
                  onChange={(e) => setEditWeightVolume(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/40"
                />
              </div>

              {/* Pain score & location */}
              <div className="space-y-2 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-rose-300">관절/근육 통증 점수 (0-10)</span>
                  <span className="text-rose-400 font-extrabold">{editPainScore}점</span>
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
                  placeholder="통증 부위 (예: 우측 팔꿈치 내측 UCL)"
                  value={editPainLocation}
                  onChange={(e) => setEditPainLocation(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500"
                />
              </div>

              {/* Sleep Hours */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">수면 시간 (시간)</label>
                <input
                  type="number"
                  step={0.5}
                  value={editSleepHours}
                  onChange={(e) => setEditSleepHours(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Diary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">오늘의 피드백 & 훈련 일지</label>
                <textarea
                  rows={4}
                  placeholder="투구 밸런스, 하체 지면반발력 체감, 피로도 등을 자유롭게 남겨보세요."
                  value={editDiary}
                  onChange={(e) => setEditDiary(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/40 resize-none"
                />
              </div>

              {/* Routine Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">보강 & 리커버리 루틴 체크</label>
                <div className="space-y-1.5">
                  {routinesState.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => toggleRoutine(r.id)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
                        r.completed
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      <span>{r.title}</span>
                      {r.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Circle className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveDayLog}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>훈련 기록 저장하기</span>
              </button>
            </div>

            {/* Right 2 Cols: Timeline of Recorded History */}
            <div className="lg:col-span-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-6">
              <h3 className="text-lg font-black text-white border-b border-white/10 pb-4">
                과거 기록 이력 타임라인
              </h3>

              {pitcherDailyLogs.length === 0 ? (
                <div className="p-12 text-center text-gray-400 space-y-2 bg-white/5 rounded-2xl border border-white/5">
                  <FileText className="w-10 h-10 mx-auto text-gray-500" />
                  <p className="text-sm font-bold">저장된 기록 일지가 아직 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                  {pitcherDailyLogs.map((log) => {
                    const sessionForLog = pitcherSessions.filter((s) => s.date === log.date);

                    return (
                      <div
                        key={log.id}
                        className="p-5 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl space-y-3 transition"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-white">📅 {log.date}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-emerald-300">
                              {log.trainingType}
                            </span>
                          </div>

                          <span className="text-xs text-gray-400">수면 {log.sleepHours}시간</span>
                        </div>

                        {/* Pitching details if logged */}
                        {sessionForLog.length > 0 && (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs space-y-1">
                            <div className="font-extrabold text-emerald-300">
                              ⚾ 피칭 세션: {sessionForLog.reduce((acc, s) => acc + s.totalPitches, 0)}구 완료 (최고{' '}
                              {Math.max(...sessionForLog.map((s) => s.maxVel))}km/h)
                            </div>
                            <p className="text-gray-300 italic">{sessionForLog[0]?.notes}</p>
                          </div>
                        )}

                        {/* Weight volume */}
                        {log.weightVolumeKg > 0 && (
                          <div className="text-xs font-bold text-blue-300">
                            🏋️‍♂️ 수행 웨이트 볼륨: {log.weightVolumeKg.toLocaleString()} kg
                          </div>
                        )}

                        {/* Diary feedback */}
                        {log.diary && (
                          <div className="text-xs text-gray-300 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">
                            "{log.diary}"
                          </div>
                        )}

                        {/* Pain warning */}
                        {log.painScore > 0 && (
                          <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>
                              통증 {log.painScore}점 ({log.painLocation || '부위 미기재'})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 4: GAME LOG SEQUENCES */}
      {/* ========================================================= */}
      {activeSubTab === 'game' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Sequence Input Form */}
          <form
            onSubmit={handleCreateSequence}
            className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-extrabold text-white">볼카운트 시퀀스 추가</h3>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-300">상대 팀명</label>
              <input
                type="text"
                required
                value={newSeqOpponent}
                onChange={(e) => setNewSeqOpponent(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">이닝</label>
                <input
                  type="number"
                  value={newSeqInning}
                  onChange={(e) => setNewSeqInning(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">타자 정보</label>
                <input
                  type="text"
                  value={newSeqBatter}
                  onChange={(e) => setNewSeqBatter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">볼카운트 (B-S)</label>
                <input
                  type="text"
                  placeholder="e.g. 1-2"
                  value={newSeqBallCount}
                  onChange={(e) => setNewSeqBallCount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">구종</label>
                <input
                  type="text"
                  value={newSeqPitchType}
                  onChange={(e) => setNewSeqPitchType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">구속 (km/h)</label>
                <input
                  type="number"
                  value={newSeqVelocity}
                  onChange={(e) => setNewSeqVelocity(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">결과</label>
                <select
                  value={newSeqResult}
                  onChange={(e) => setNewSeqResult(e.target.value as any)}
                  className="w-full bg-[#2c2c2e] border border-white/10 rounded-xl px-2 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="STRIKE_SWINGING">헛스윙 스트라이크</option>
                  <option value="STRIKE_CALLED">루킹 스트라이크</option>
                  <option value="BALL">볼</option>
                  <option value="FOUL">파울</option>
                  <option value="IN_PLAY_OUT">범타 아웃</option>
                  <option value="IN_PLAY_HIT">피안타</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-extrabold py-3 rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>투구 시퀀스 기록 저장</span>
            </button>
          </form>

          {/* Right 2 Cols: Sequence Table */}
          <div className="lg:col-span-2 bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-white border-b border-white/10 pb-3">
              볼카운트별 투구 시퀀스 이력
            </h3>

            {pitcherSequences.length === 0 ? (
              <div className="p-12 text-center text-gray-400 bg-white/5 rounded-2xl border border-white/5">
                등록된 시퀀스가 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      <th className="py-2.5 px-3">날짜</th>
                      <th className="py-2.5 px-3">상대</th>
                      <th className="py-2.5 px-3">이닝/타자</th>
                      <th className="py-2.5 px-3">카운트</th>
                      <th className="py-2.5 px-3">구종/구속</th>
                      <th className="py-2.5 px-3">결과</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pitcherSequences.map((seq) => (
                      <tr key={seq.id} className="hover:bg-white/5 transition">
                        <td className="py-3 px-3 text-gray-300 font-bold">{seq.date}</td>
                        <td className="py-3 px-3 text-white font-extrabold">{seq.opponent}</td>
                        <td className="py-3 px-3 text-gray-300">
                          {seq.inning}회 / {seq.batter}
                        </td>
                        <td className="py-3 px-3 font-mono text-amber-400 font-bold">{seq.ballCount}</td>
                        <td className="py-3 px-3 font-bold text-white">
                          {seq.pitchType} ({seq.velocity}km/h)
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/10 text-white border border-white/10">
                            {seq.result}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SUBTAB 5: GOAL ROADMAP */}
      {/* ========================================================= */}
      {activeSubTab === 'roadmap' && (
        <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-[28px] p-6 sm:p-8 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl sm:text-2xl font-black text-white">선수 목표 트레이닝 로드맵</h2>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                목표 구속 달성 및 체중 증량을 위한 단계별 구체적 트레이닝 마일스톤
              </p>
            </div>

            <div className="flex gap-4">
              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                <div className="text-[10px] text-gray-400 uppercase font-bold">목표 구속</div>
                <div className="text-lg font-black text-emerald-400">{goalRoadmap.targetVelocity} km/h</div>
              </div>

              <div className="bg-white/5 border border-white/10 p-3 rounded-2xl text-center">
                <div className="text-[10px] text-gray-400 uppercase font-bold">목표 체중</div>
                <div className="text-lg font-black text-blue-400">{goalRoadmap.targetWeight} kg</div>
              </div>
            </div>
          </div>

          {/* Phase cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {goalRoadmap.phases.map((ph, idx) => (
              <div
                key={ph.id}
                className={`p-6 rounded-2xl border space-y-4 relative ${
                  ph.isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-400 uppercase">PHASE 0{idx + 1}</span>
                  {ph.isCompleted ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      달성 완료
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      진행 중
                    </span>
                  )}
                </div>

                <h4 className="text-base font-extrabold text-white">{ph.phaseName}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{ph.focus}</p>

                <div className="text-[11px] text-gray-400 pt-2 border-t border-white/10">
                  기간: {ph.duration}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
