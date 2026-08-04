import { useUnits } from '../lib/units';
import i18n from '../lib/i18n';
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Pitcher, PitchVideo } from '../types';
import { uploadVideoToServer } from '../lib/serverSync';
import {
  Video,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Film,
  Pencil,
  Plus,
  Zap,
  Sliders,
  Sparkles,
  Loader2,
  Upload
} from 'lucide-react';


const t = i18n.t.bind(i18n);

interface VideoArchiveProps {
  pitcher: Pitcher;
  videos: PitchVideo[];
  onAddVideo: (video: PitchVideo) => void;
  currentUserEmail?: string;
  onSaveAllRecords?: () => void;
}

export const VideoArchive: React.FC<VideoArchiveProps> = ({
  pitcher,
  videos,
  onAddVideo,
  currentUserEmail,
  onSaveAllRecords,
}) => {
  const { formatSpeed, formatWeight, speedUnit, weightUnit } = useUnits();

  const pitcherVideos = videos.filter((v) => v.pitcherId === pitcher.id);

  // Dual Video Selection
  const [leftVideoId, setLeftVideoId] = useState<string>(pitcherVideos[0]?.id || '');
  const [rightVideoId, setRightVideoId] = useState<string>(pitcherVideos[1]?.id || pitcherVideos[0]?.id || '');

  const leftVideo = pitcherVideos.find((v) => v.id === leftVideoId) || pitcherVideos[0];
  const rightVideo = pitcherVideos.find((v) => v.id === rightVideoId) || pitcherVideos[0];

  // Playback States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);

  const leftRef = useRef<HTMLVideoElement>(null);
  const rightRef = useRef<HTMLVideoElement>(null);

  // Toggle synced play/pause
  const togglePlay = () => {
    if (isPlaying) {
      leftRef.current?.pause();
      rightRef.current?.pause();
      setIsPlaying(false);
    } else {
      leftRef.current?.play();
      rightRef.current?.play();
      setIsPlaying(true);
    }
  };

  // Change playback speed
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (leftRef.current) leftRef.current.playbackRate = speed;
    if (rightRef.current) rightRef.current.playbackRate = speed;
  };

  // Step frame forward/backward (approx 0.04s)
  const stepFrame = (direction: 'prev' | 'next') => {
    const delta = direction === 'next' ? 0.04 : -0.04;
    if (leftRef.current) leftRef.current.currentTime = Math.max(0, leftRef.current.currentTime + delta);
    if (rightRef.current) rightRef.current.currentTime = Math.max(0, rightRef.current.currentTime + delta);
  };

  // Reset videos
  const resetVideos = () => {
    if (leftRef.current) leftRef.current.currentTime = 0;
    if (rightRef.current) rightRef.current.currentTime = 0;
  };

  // Add Video Modal State
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPitchType, setNewPitchType] = useState('포심 직구');
  const [newVel, setNewVel] = useState<number>(148);
  const [newAngle, setNewAngle] = useState<'Behind Mound' | 'Side View' | 'High Home' | 'Slow-Mo 240fps'>('Behind Mound');
  const [newNotes, setNewNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    setIsUploading(true);

    const dateStr = new Date().toISOString().split('T')[0];
    const videoMetadata: Omit<PitchVideo, 'id'> = {
      pitcherId: pitcher.id,
      title: newTitle.trim() || '새 피칭 메커니즘 영상',
      date: dateStr,
      videoUrl: '',
      pitchType: newPitchType,
      velocity: newVel,
      cameraAngle: newAngle,
      notes: newNotes,
    };

    let videoSource: File | string = newUrl || 'https://assets.mixkit.co/videos/preview/mixkit-baseball-pitcher-throwing-a-ball-41584-large.mp4';
    if (selectedFile) {
      videoSource = selectedFile;
    }

    try {
      const savedVideo = await uploadVideoToServer(videoSource, videoMetadata, currentUserEmail);
      onAddVideo(savedVideo);
    } catch (err) {
      console.error('Error saving video in archive modal:', err);
      onAddVideo({
        ...videoMetadata,
        id: `vid_${Date.now()}`,
        videoUrl: typeof videoSource === 'string' ? videoSource : URL.createObjectURL(videoSource),
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setNewTitle('');
      setNewUrl('');
      setShowModal(false);
    }
  };

  return (
    <div className="pt-20 pb-12 px-4 md:px-8 max-w-5xl mx-auto text-white space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 mb-1">
            <Video className="w-4 h-4" />
            <span>Split-Screen Motion Analysis</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">메커니즘 영상 아카이브</h1>
          <p className="text-gray-400 text-sm mt-1">
            투구 폼을 저장하고 시점별/날짜별 영상을 2분할 화면으로 비교하여 릴리스 포인트 및 팔각도 변화를 분석하세요.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onSaveAllRecords && (
            <button
              onClick={onSaveAllRecords}
              className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs px-4 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              title="저장된 영상과 기록을 서버로 동기화합니다."
            >
              <span>💾 서버에 영상 저장 (계정 동기화)</span>
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="bg-white text-black hover:bg-gray-200 font-bold text-xs px-5 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ 영상 추가하기</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Dual Video Comparison Area */}
      <div className="bg-gradient-to-b from-gray-900 via-black to-gray-950 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? '일시정지' : '동시 재생'}</span>
            </button>

            <button
              onClick={resetVideos}
              className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-xl text-xs transition-all"
              title="처음으로"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Frame Steppers */}
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1 text-xs">
              <button onClick={() => stepFrame('prev')} className="px-2 py-1 hover:bg-white/10 rounded">
                ◀ 이전프레임
              </button>
              <button onClick={() => stepFrame('next')} className="px-2 py-1 hover:bg-white/10 rounded">
                다음프레임 ▶
              </button>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400 font-semibold">재생 속도:</span>
            {[0.25, 0.5, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-3 py-1 rounded-lg font-mono font-bold transition-all ${
                  playbackSpeed === s ? 'bg-sky-500 text-black' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Dual Screen Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Screen */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-400 flex items-center gap-1">
                <Film className="w-3.5 h-3.5" /> Screen A (기준 영상)
              </span>
              <select
                value={leftVideoId}
                onChange={(e) => setLeftVideoId(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                {pitcherVideos.map((v) => (
                  <option key={v.id} value={v.id} className="bg-gray-900 text-white">
                    {v.date} - {v.title} ({formatSpeed(v.velocity)})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
              {leftVideo && leftVideo.videoUrl ? (
                <video
                  ref={leftRef}
                  src={leftVideo.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  onError={(e) => {
                    console.warn('Left video load failed:', e);
                    e.preventDefault();
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                  영상이 없습니다.
                </div>
              )}
              {leftVideo && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono border border-white/20">
                  {leftVideo.pitchType} ({formatSpeed(leftVideo.velocity)}) • {leftVideo.cameraAngle}
                </div>
              )}
            </div>

            {leftVideo && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-300">
                💡 <strong className="text-white">분석 메모:</strong> {leftVideo.notes}
              </div>
            )}
          </div>

          {/* Right Screen */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <Film className="w-3.5 h-3.5" /> Screen B (비교 영상)
              </span>
              <select
                value={rightVideoId}
                onChange={(e) => setRightVideoId(e.target.value)}
                className="bg-white/10 border border-white/20 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                {pitcherVideos.map((v) => (
                  <option key={v.id} value={v.id} className="bg-gray-900 text-white">
                    {v.date} - {v.title} ({formatSpeed(v.velocity)})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-inner group">
              {rightVideo && rightVideo.videoUrl ? (
                <video
                  ref={rightRef}
                  src={rightVideo.videoUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  onError={(e) => {
                    console.warn('Right video load failed:', e);
                    e.preventDefault();
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                  영상이 없습니다.
                </div>
              )}
              {rightVideo && (
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono border border-white/20">
                  {rightVideo.pitchType} ({formatSpeed(rightVideo.velocity)}) • {rightVideo.cameraAngle}
                </div>
              )}
            </div>

            {rightVideo && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-xs text-gray-300">
                💡 <strong className="text-white">분석 메모:</strong> {rightVideo.notes}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Library Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">보관된 피칭 영상 목록 ({pitcherVideos.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pitcherVideos.map((v) => (
            <div
              key={v.id}
              className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3 hover:border-white/30 transition-all"
            >
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                <video src={v.videoUrl || undefined} className="w-full h-full object-cover" muted />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-gray-300">
                  {v.cameraAngle}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-1">
                  <span>{v.date}</span>
                  <span className="text-amber-400 font-bold">{formatSpeed(v.velocity)}</span>
                </div>
                <h4 className="font-bold text-sm text-white line-clamp-1">{v.title}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{v.notes}</p>
              </div>

              <button
                onClick={() => {
                  setLeftVideoId(v.id);
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2 rounded-xl transition-all cursor-pointer"
              >
                비교 플레이어로 불러오기
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Video Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full space-y-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Video className="w-5 h-5 text-sky-400" />
                <span>새 피칭 메커니즘 영상 추가</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-xl">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVideoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">영상 제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 7월 29일 불펜 피칭 포심 메커니즘"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              {/* Video File Upload */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-bold">내 기기에서 영상 파일 직접 선택 (서버 저장)</label>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 px-3.5 py-2 rounded-xl cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>파일 업로드</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          if (!newTitle) {
                            setNewTitle(file.name.replace(/\.[^/.]+$/, ""));
                          }
                        }
                      }}
                    />
                  </label>
                  <span className="text-gray-400 font-mono text-[11px] truncate">
                    {selectedFile ? selectedFile.name : '선택된 파일 없음'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">또는 영상 URL 입력 (URL 직접 입력시)</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://... (비워두면 기본 MP4 적용)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">구종</label>
                  <select
                    value={newPitchType}
                    onChange={(e) => setNewPitchType(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  >
                    <option value="포심 직구">포심 직구 (Fastball)</option>
                    <option value="슬라이더">슬라이더 (Slider)</option>
                    <option value="커브">커브 (Curveball)</option>
                    <option value="체인지업">체인지업 (Changeup)</option>
                    <option value="커터">커터/스플리터</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">구속 (km/h)</label>
                  <input
                    type="number"
                    value={newVel}
                    onChange={(e) => setNewVel(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">카메라 촬영 각도</label>
                <select
                  value={newAngle}
                  onChange={(e) => setNewAngle(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                >
                  <option value="Behind Mound">Behind Mound (마운드 후방)</option>
                  <option value="Side View">Side View (측면 90도)</option>
                  <option value="High Home">High Home (포수 후면 상단)</option>
                  <option value="Slow-Mo 240fps">Slow-Mo 240fps 초고속</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">바이오메카닉스 특징 및 메모</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="예: 디딤발 착지 시 골반 회전 타이밍이 양호함."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white/10 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-black font-extrabold px-6 py-2.5 rounded-xl cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>서버 업로드 중...</span>
                    </>
                  ) : (
                    <span>💾 서버에 영상 저장하기</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
