import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Pitcher, PitchVideo } from '../types';
import { FrameVideoPlayer } from './FrameVideoPlayer';
import { PitchVideoRecorderModal } from './PitchVideoRecorderModal';
import {
  Video,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Film,
  Sparkles,
  Maximize2,
  Filter,
  CheckCircle2,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  Info
} from 'lucide-react';

interface CalendarVideoTabProps {
  pitcher: Pitcher;
  videos: PitchVideo[];
  onAddVideo: (video: Omit<PitchVideo, 'id'>) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenArchive?: (videoId: string) => void;
  currentUserEmail?: string;
  onSaveAllRecords?: () => void;
}

export const CalendarVideoTab: React.FC<CalendarVideoTabProps> = ({
  pitcher,
  videos,
  onAddVideo,
  selectedDate,
  onSelectDate,
  onOpenArchive,
  currentUserEmail,
  onSaveAllRecords,
}) => {
  const pitcherVideos = videos.filter((v) => v.pitcherId === pitcher.id);

  // Modal State for Video Recorder
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  // Modal State for Mini Calendar Date Picker
  const [isMiniCalendarOpen, setIsMiniCalendarOpen] = useState(false);

  // Mini Calendar Month/Year View State
  const [calYear, setCalYear] = useState<number>(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || new Date().getFullYear();
  });
  const [calMonth, setCalMonth] = useState<number>(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return m || new Date().getMonth() + 1;
  });

  // Selected Video state for current date
  const dateVideos = pitcherVideos.filter((v) => v.date === selectedDate);
  const [activeVideoId, setActiveVideoId] = useState<string>(
    dateVideos[0]?.id || pitcherVideos[0]?.id || ''
  );

  const activeVideo = pitcherVideos.find((v) => v.id === activeVideoId) || pitcherVideos[0];

  // Group videos by unique dates (ascending for adjacent date search, descending for dropdown)
  const sortedDatesAsc: string[] = (Array.from(new Set(pitcherVideos.map((v) => v.date))).sort()) as string[];
  const uniqueDatesDesc: string[] = [...sortedDatesAsc].reverse();

  // Find previous and next dates that actually have saved videos
  const prevDateWithVideo = sortedDatesAsc.slice().reverse().find((d) => d < selectedDate);
  const nextDateWithVideo = sortedDatesAsc.find((d) => d > selectedDate);

  // Jump to a specific date and set the first video on that date
  const handleJumpToDate = (targetDate: string) => {
    onSelectDate(targetDate);
    const firstVid = pitcherVideos.find((v) => v.date === targetDate);
    if (firstVid) {
      setActiveVideoId(firstVid.id);
    }
  };

  // Mini Calendar Calculations
  const daysInMonth = new Date(calYear, calMonth, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay(); // 0 = Sun
  const todayStr = new Date().toISOString().split('T')[0];

  const handlePrevMonth = () => {
    if (calMonth === 1) {
      setCalYear((prev) => prev - 1);
      setCalMonth(12);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 12) {
      setCalYear((prev) => prev + 1);
      setCalMonth(1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#18181b] via-[#1c1c1e] to-[#0f172a] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-400 mb-1">
            <Video className="w-4 h-4" />
            <span>투구 영상 저장 및 분석</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">투구 영상 저장</h2>
          <p className="text-gray-400 text-xs mt-1">
            날짜별로 저장된 투구 메커니즘 영상을 프레임 단위로 재생하여 릴리스 포인트 및 팔각도를 점검하세요.
          </p>
          <p className="text-[11px] text-emerald-400/90 font-medium mt-1 flex items-center gap-1">
            <Info className="w-3 h-3 shrink-0 text-emerald-400" />
            <span>※ 15초 이하의 영상만 저장 가능합니다.</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {onSaveAllRecords && (
            <button
              onClick={onSaveAllRecords}
              className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs px-4 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              title="현재 저장된 모든 영상 및 기록을 서버에 저장하여 다른 기기에서도 볼 수 있게 합니다."
            >
              <span>💾 서버에 영상 저장 (계정 동기화)</span>
            </button>
          )}
          <button
            onClick={() => setIsRecorderOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-3 rounded-2xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(52,199,89,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ 투구 영상 촬영 / 저장</span>
          </button>
        </div>
      </div>

      {/* Primary Date Navigation Toolbar */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Selected Date Summary & Date Picker Trigger Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-mono">
            <CalendarIcon className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold text-white">{selectedDate}</span>
            <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-md text-[11px]">
              {dateVideos.length > 0 ? `투구 영상 ${dateVideos.length}개` : '영상 없음'}
            </span>
          </div>

          {/* Date Picker Trigger Button */}
          <button
            onClick={() => {
              const [y, m] = selectedDate.split('-').map(Number);
              if (y && m) {
                setCalYear(y);
                setCalMonth(m);
              }
              setIsMiniCalendarOpen(true);
            }}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
          >
            <CalendarIcon className="w-4 h-4 text-emerald-400" />
            <span>🗓️ 날짜 변경</span>
          </button>
        </div>

        {/* Right: Previous / Next Date with Video Quick Jump Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <button
            disabled={!prevDateWithVideo}
            onClick={() => prevDateWithVideo && handleJumpToDate(prevDateWithVideo)}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              prevDateWithVideo
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                : 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed'
            }`}
            title={prevDateWithVideo ? `${prevDateWithVideo}로 이동` : '이전 저장 날짜 없음'}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 저장 날짜</span>
            {prevDateWithVideo && (
              <span className="font-mono text-[10px] text-emerald-400">({prevDateWithVideo.slice(5)})</span>
            )}
          </button>

          <button
            disabled={!nextDateWithVideo}
            onClick={() => nextDateWithVideo && handleJumpToDate(nextDateWithVideo)}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer border ${
              nextDateWithVideo
                ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                : 'bg-white/5 text-gray-600 border-white/5 cursor-not-allowed'
            }`}
            title={nextDateWithVideo ? `${nextDateWithVideo}로 이동` : '다음 저장 날짜 없음'}
          >
            <span>다음 저장 날짜</span>
            {nextDateWithVideo && (
              <span className="font-mono text-[10px] text-emerald-400">({nextDateWithVideo.slice(5)})</span>
            )}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Grid: Video Cards List vs Active Frame Video Player */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Video List for Selected Date */}
        <div className="lg:col-span-4 bg-black/40 border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-emerald-400" />
              <span>{selectedDate} 투구 영상 목록</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              총 {dateVideos.length}개
            </span>
          </div>

          {dateVideos.length === 0 ? (
            <div className="text-center py-10 space-y-3 bg-white/5 border border-white/5 rounded-2xl p-4">
              <Video className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-xs text-gray-400">
                {selectedDate}에 저장된 투구 영상이 없습니다.
              </p>
              <p className="text-[11px] text-gray-500">※ 15초 이하의 영상만 저장 가능합니다.</p>
              <button
                onClick={() => setIsRecorderOpen(true)}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer mt-1"
              >
                + 이 날짜에 영상 추가하기
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {dateVideos.map((v) => {
                const isActive = v.id === activeVideoId;
                return (
                  <div
                    key={v.id}
                    onClick={() => setActiveVideoId(v.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 relative overflow-hidden group ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-950/60 to-black border-emerald-500 shadow-lg'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                          {v.title}
                        </h4>
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {v.date} • {v.cameraAngle}
                        </p>
                      </div>

                      <span className="text-[11px] font-mono font-extrabold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0">
                        {v.velocity} km/h
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5 text-gray-400">
                      <span className="font-semibold text-gray-300">{v.pitchType}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <Play className="w-3 h-3 fill-emerald-400" /> 프레임 분석
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Recorder Launcher Card */}
          <div className="bg-gradient-to-b from-emerald-950/30 to-black border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
            <Sparkles className="w-5 h-5 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">현장에서 즉시 녹화하기</h4>
            <p className="text-[11px] text-gray-400">
              불펜 피칭이나 캐치볼 모션을 웹캠으로 촬영하여 바로 분석하세요.
            </p>
            <p className="text-[10px] text-emerald-400/80">※ 15초 이하의 영상만 저장 가능합니다.</p>
            <button
              onClick={() => setIsRecorderOpen(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs py-2 rounded-xl transition-all shadow-md cursor-pointer mt-1"
            >
              웹캠 / 카메라 녹화
            </button>
          </div>
        </div>

        {/* Right 8 Cols: High Precision Frame Video Player */}
        <div className="lg:col-span-8 space-y-4">
          {activeVideo ? (
            <FrameVideoPlayer video={activeVideo} onOpenArchive={onOpenArchive} />
          ) : (
            <div className="bg-[#18181b] border border-white/10 rounded-3xl p-12 text-center text-gray-400 space-y-3">
              <Video className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-sm">선택된 영상이 없습니다. 날짜 변경이나 저장 날짜 이동을 통해 영상을 선택하세요.</p>
            </div>
          )}

          {/* Bottom Video Save & Add Button Bar */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-gray-300 flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>새로운 투구 모션 영상이나 불펜 피칭 영상이 있나요?</span>
            </div>
            <button
              onClick={() => setIsRecorderOpen(true)}
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>💾 영상 촬영 / 저장하기</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* POPUP MODAL: DATE SELECTION FOR VIDEO NAVIGATION */}
      {/* ========================================================= */}
      {isMiniCalendarOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#18181b] border border-white/20 rounded-2xl max-w-[320px] sm:max-w-[340px] w-full p-4 shadow-2xl space-y-3 relative my-auto max-h-[90vh] overflow-y-auto scrollbar-thin">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">날짜 선택</h3>
              </div>
              <button
                onClick={() => setIsMiniCalendarOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Navigation Header */}
            <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl p-2">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center">
                <div className="text-xs font-bold text-white font-mono">
                  {calYear}년 {calMonth}월
                </div>
                <button
                  onClick={() => {
                    const today = new Date();
                    setCalYear(today.getFullYear());
                    setCalMonth(today.getMonth() + 1);
                  }}
                  className="text-[9px] font-extrabold text-emerald-400 hover:underline cursor-pointer"
                >
                  이번 달로 이동
                </button>
              </div>

              <button
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 7-Day Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 pb-1 border-b border-white/5">
              <span className="text-rose-400">일</span>
              <span>월</span>
              <span>화</span>
              <span>수</span>
              <span>목</span>
              <span>금</span>
              <span className="text-sky-400">토</span>
            </div>

            {/* Calendar Day Grid - Compact Sizing */}
            <div className="grid grid-cols-7 gap-1 text-xs">
              {/* Offset Blank Cells */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`blank-${idx}`} className="h-8 rounded-lg bg-transparent" />
              ))}

              {/* Month Day Cells */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === todayStr;

                const dayVidCount = pitcherVideos.filter((v) => v.date === dateStr).length;

                return (
                  <button
                    key={`day-${dateStr}`}
                    onClick={() => {
                      handleJumpToDate(dateStr);
                      setIsMiniCalendarOpen(false);
                    }}
                    className={`h-8 rounded-lg flex flex-col items-center justify-center p-0.5 font-mono transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-emerald-500 text-black font-black shadow-md scale-105 z-10'
                        : isToday
                        ? 'bg-white/15 text-white border border-emerald-400/50 font-bold'
                        : 'bg-white/5 hover:bg-white/15 text-gray-200'
                    }`}
                  >
                    <span className="text-[10px] leading-tight">{dayNum}</span>

                    {/* Badge for Saved Video Count */}
                    {dayVidCount > 0 && (
                      <span
                        className={`text-[8px] px-0.5 rounded font-bold leading-none ${
                          isSelected
                            ? 'bg-black/30 text-black'
                            : 'bg-emerald-500/40 text-emerald-200'
                        }`}
                      >
                        ●{dayVidCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Notice */}
            <div className="pt-1.5 border-t border-white/10 text-center text-[10px] text-gray-400">
              <span className="text-emerald-400 font-bold">●N</span> 표시된 날짜에 저장된 투구 영상이 있습니다.
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Video Recorder Modal */}
      <PitchVideoRecorderModal
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        pitcherId={pitcher.id}
        defaultDate={selectedDate}
        currentUserEmail={currentUserEmail}
        onAddVideo={onAddVideo}
      />
    </div>
  );
};

