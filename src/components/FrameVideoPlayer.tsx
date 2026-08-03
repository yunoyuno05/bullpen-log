import React, { useState, useRef, useEffect } from 'react';
import { PitchVideo } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Pencil,
  Trash2,
  Target,
  Zap,
  CheckCircle2,
  Clock,
  Film,
  Sparkles,
  Layers,
  Bookmark,
  Share2
} from 'lucide-react';

interface FrameVideoPlayerProps {
  video: PitchVideo;
  onOpenArchive?: (videoId: string) => void;
}

export const FrameVideoPlayer: React.FC<FrameVideoPlayerProps> = ({ video, onOpenArchive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [frameIndex, setFrameIndex] = useState<number>(0);

  // FPS estimate (30 FPS default for standard pitch videos)
  const fps = 30;
  const frameTime = 1 / fps; // ~0.0333s

  // Mechanics Phase Bookmarks
  const [phaseBookmarks, setPhaseBookmarks] = useState<Record<string, number>>({
    '1. 밸런스 포인트': 0.8,
    '2. 디딤발 착지': 1.6,
    '3. 어깨 최대외회전': 2.2,
    '4. 릴리스 포인트': 2.5,
    '5. 팔로우 스루': 3.2,
  });

  // Canvas Drawing State
  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawColor, setDrawColor] = useState<string>('#34C759'); // Emerald
  const [drawWidth, setDrawWidth] = useState<number>(3);
  const [hasDrawings, setHasDrawings] = useState<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);

  // Sync video time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      setFrameIndex(Math.floor(cur * fps));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 15);
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Change Speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Step Frame
  const stepFrame = (frames: number) => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsPlaying(false);
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + frames * frameTime));
    videoRef.current.currentTime = newTime;
  };

  // Seek Timeline
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
      setCurrentTime(val);
      setFrameIndex(Math.floor(val * fps));
    }
  };

  // Phase Bookmark Setter
  const setBookmarkForCurrentFrame = (phaseName: string) => {
    setPhaseBookmarks((prev) => ({
      ...prev,
      [phaseName]: currentTime,
    }));
  };

  const jumpToPhase = (timeVal: number) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = timeVal;
    }
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    startPosRef.current = { x, y };

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawingMode || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
      setHasDrawings(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setHasDrawings(false);
    }
  };

  // Sync canvas dimensions with video player size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.clientWidth;
        canvasRef.current.height = videoRef.current.clientHeight;
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  return (
    <div className="bg-[#18181b] border border-white/10 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5 text-white">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Film className="w-4 h-4" />
            <span>15초 투구 프레임 분석 & 바이오메카닉스</span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight mt-0.5">{video.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
            <span>{video.date}</span>
            <span>•</span>
            <span className="text-emerald-300 font-bold">{video.pitchType}</span>
            <span>•</span>
            <span className="font-mono">{video.velocity} km/h</span>
            <span>•</span>
            <span className="text-sky-300">{video.cameraAngle}</span>
          </p>
        </div>

        {onOpenArchive && (
          <button
            onClick={() => onOpenArchive(video.id)}
            className="self-start sm:self-auto bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-extrabold px-4 py-2 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>전문 2분할 비교 아카이브로 이동</span>
          </button>
        )}
      </div>

      {/* Main Player Display Area with Canvas Overlay */}
      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/15 shadow-2xl group flex items-center justify-center">
        <video
          ref={videoRef}
          src={video.videoUrl || undefined}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Canvas Annotation Layer */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 z-10 w-full h-full ${
            isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'
          }`}
        />

        {/* Current Time Overlay HUD */}
        <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono z-20 flex items-center gap-3">
          <span className="text-emerald-400 font-bold">
            {currentTime.toFixed(2)}s / {duration.toFixed(1)}s
          </span>
          <span className="text-gray-400 font-bold border-l border-white/20 pl-3">
            프레임 #{frameIndex} ({fps} FPS)
          </span>
        </div>

        {/* Play/Pause Overlay Button */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center backdrop-blur-md hover:scale-110 transition-transform cursor-pointer z-20 shadow-2xl"
          >
            <Play className="w-8 h-8 fill-white translate-x-0.5" />
          </button>
        )}
      </div>

      {/* Primary Player Controls Toolbar */}
      <div className="space-y-3 bg-black/60 border border-white/10 p-4 rounded-2xl">
        {/* Timeline Scrubber */}
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 15}
            step={frameTime}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-mono">
            <span>00:00.00</span>
            <span>{video.pitchType} ({video.velocity}km/h) 릴리스 파악</span>
            <span>00:{duration.toFixed(2)}</span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Left: Play/Pause, Reset & Frame Steppers */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="bg-emerald-500 text-black hover:bg-emerald-400 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 fill-black" />}
              <span>{isPlaying ? '일시정지' : '재생'}</span>
            </button>

            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime = 0;
              }}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors cursor-pointer border border-white/10"
              title="처음으로"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Frame Stepper Group */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => stepFrame(-5)}
                className="px-2 py-1 hover:bg-white/10 rounded font-mono font-bold text-gray-300 hover:text-white cursor-pointer"
                title="5프레임 뒤로"
              >
                ◀◀ -5F
              </button>
              <button
                onClick={() => stepFrame(-1)}
                className="px-2 py-1 hover:bg-white/10 rounded font-mono font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                title="1프레임 뒤로 (~0.03초)"
              >
                ◀ -1F
              </button>
              <button
                onClick={() => stepFrame(1)}
                className="px-2 py-1 hover:bg-white/10 rounded font-mono font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                title="1프레임 앞으로 (~0.03초)"
              >
                +1F ▶
              </button>
              <button
                onClick={() => stepFrame(5)}
                className="px-2 py-1 hover:bg-white/10 rounded font-mono font-bold text-gray-300 hover:text-white cursor-pointer"
                title="5프레임 앞으로"
              >
                +5F ▶▶
              </button>
            </div>
          </div>

          {/* Right: Speed Selectors & Drawing Mode Toggle */}
          <div className="flex items-center gap-3">
            {/* Playback Speed */}
            <div className="flex items-center gap-1.5 text-xs bg-white/5 border border-white/10 p-1 rounded-xl">
              <span className="text-gray-400 font-bold px-1 text-[11px]">속도:</span>
              {[0.1, 0.25, 0.5, 1.0].map((s) => (
                <button
                  key={`speed-${s}`}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1 rounded-lg font-mono font-bold transition-all text-xs cursor-pointer ${
                    playbackSpeed === s
                      ? 'bg-emerald-500 text-black shadow-sm'
                      : 'hover:bg-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Canvas Drawing Tools */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDrawingMode(!isDrawingMode)}
                className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isDrawingMode
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300 border-white/10'
                }`}
                title="영상 위에 각도/궤적 그리기"
              >
                <Pencil className="w-4 h-4" />
                <span className="hidden md:inline">{isDrawingMode ? '그리기 켜짐' : '그리기 툴'}</span>
              </button>

              {hasDrawings && (
                <button
                  onClick={clearCanvas}
                  className="p-2 bg-white/10 hover:bg-rose-500/30 text-gray-300 hover:text-rose-300 rounded-xl text-xs transition-colors cursor-pointer border border-white/10"
                  title="지우기"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mechanics Phase Tagging & Quick Bookmark Bar */}
      <div className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-emerald-400" />
            <span>투구 메커니즘 5단계 프레임 북마크</span>
          </span>
          <span className="text-[11px] text-gray-400">
            현재 프레임을 해당 구간으로 설정하거나 이동할 수 있습니다.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          {Object.entries(phaseBookmarks).map(([phaseName, phaseTime]) => {
            const timeVal = Number(phaseTime);
            return (
              <div
                key={phaseName}
                className="bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-xl p-2.5 flex flex-col justify-between space-y-2 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => jumpToPhase(timeVal)}
                    className="text-left font-bold text-gray-200 group-hover:text-emerald-300 text-[11px] truncate cursor-pointer"
                  >
                    {phaseName}
                  </button>
                  <span className="text-[10px] font-mono text-emerald-400 font-extrabold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {timeVal.toFixed(2)}s
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px]">
                  <button
                    onClick={() => jumpToPhase(timeVal)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                  >
                    이동 ▶
                  </button>
                  <button
                    onClick={() => setBookmarkForCurrentFrame(phaseName)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                    title="현재 프레임으로 업데이트"
                  >
                    [현재 세팅]
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Biomechanics Notes & Checklist */}
      <div className="bg-black/40 border border-white/10 p-4 rounded-2xl space-y-2 text-xs">
        <h4 className="font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>등록된 메모 & 메커니즘 관찰평가</span>
        </h4>
        <p className="text-gray-300 bg-white/5 border border-white/10 p-3 rounded-xl leading-relaxed">
          {video.notes || '메커니즘 메모가 등록되어 있지 않습니다.'}
        </p>
      </div>
    </div>
  );
};
