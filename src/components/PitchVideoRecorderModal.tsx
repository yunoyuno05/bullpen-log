import i18n from '../lib/i18n';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PitchVideo } from '../types';
import { uploadVideoToServer } from '../lib/serverSync';
import {
  X,
  Video,
  Camera,
  Upload,
  Square,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Zap,
  AlertTriangle,
  Sliders,
  Sparkles,
  Info,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';


const t = i18n.t.bind(i18n);

interface PitchVideoRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pitcherId: string;
  defaultDate?: string;
  currentUserEmail?: string;
  onAddVideo: (video: PitchVideo) => void;
}

export const PitchVideoRecorderModal: React.FC<PitchVideoRecorderModalProps> = ({
  isOpen,
  onClose,
  pitcherId,
  defaultDate,
  currentUserEmail,
  onAddVideo,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [mode, setMode] = useState<'record' | 'upload'>('record');

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || todayStr);
  const [pitchType, setPitchType] = useState('포심 직구');
  const [velocity, setVelocity] = useState<number>(148);
  const [cameraAngle, setCameraAngle] = useState<'Behind Mound' | 'Side View' | 'High Home' | 'Slow-Mo 240fps'>('Behind Mound');
  const [notes, setNotes] = useState('');

  // Recording State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedDuration, setRecordedDuration] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // File Upload State
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadDurationWarning, setUploadDurationWarning] = useState<boolean>(false);

  // Refs
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update date when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setDate(defaultDate);
    }
  }, [defaultDate]);

  // Clean up camera stream on unmount or modal close
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      resetRecordingState();
    }
  }, [isOpen]);

  const resetRecordingState = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    setRecordedBlobUrl(null);
    setCameraError(null);
  };

  // Start Webcam Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 60 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('카메라 및 마이크 권한이 필요하거나 기기에서 카메라를 찾을 수 없습니다.');
    }
  };

  // Start 15-second Pitch Video Recording
  const startRecording = () => {
    if (!streamRef.current) return;

    recordedChunksRef.current = [];
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm';

    try {
      const recorder = new MediaRecorder(streamRef.current, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
      };

      recorder.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      // Timer to count up to 15 seconds
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= 15.0) {
          // Reached 15 seconds max! Stop recording automatically
          stopRecording();
        } else {
          setRecordingSeconds(elapsed);
        }
      }, 50);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
      setCameraError('영상 녹화를 시작하는 도중 오류가 발생했습니다.');
    }
  };

  // Upload & Save Progress State
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // File / Blob Refs
  const uploadedFileRef = useRef<File | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);

  // Stop Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          recordedBlobRef.current = blob;
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
        }
      };
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);
    setRecordedDuration(recordingSeconds);
  };

  // Handle Video File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadedFileRef.current = file;
    setUploadFileName(file.name);
    const url = URL.createObjectURL(file);
    setUploadUrl(url);

    // Validate video duration
    const tempVideo = document.createElement('video');
    tempVideo.src = url;
    tempVideo.onloadedmetadata = () => {
      if (tempVideo.duration > 15.5) {
        setUploadDurationWarning(true);
      } else {
        setUploadDurationWarning(false);
      }
    };

    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // Form Submission (Server Video Upload & Account Save)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) return;

    setIsUploading(true);

    const defaultTitleName = `${date} ${pitchType} ${velocity}km/h 투구 메커니즘`;
    const videoMetadata: Omit<PitchVideo, 'id'> = {
      pitcherId,
      title: title.trim() || defaultTitleName,
      date,
      videoUrl: '',
      pitchType,
      velocity,
      cameraAngle,
      notes: notes.trim() || '15초 이내 고속 투구 메커니즘 녹화 영상.',
    };

    let videoSource: Blob | File | string = 'https://assets.mixkit.co/videos/preview/mixkit-baseball-pitcher-throwing-a-ball-41584-large.mp4';

    if (mode === 'record') {
      if (recordedBlobRef.current) {
        videoSource = recordedBlobRef.current;
      } else if (recordedBlobUrl) {
        videoSource = recordedBlobUrl;
      }
    } else {
      if (uploadedFileRef.current) {
        videoSource = uploadedFileRef.current;
      } else if (uploadUrl) {
        videoSource = uploadUrl;
      }
    }

    try {
      const savedVideo = await uploadVideoToServer(videoSource, videoMetadata, currentUserEmail);
      onAddVideo(savedVideo);
    } catch (err) {
      console.error('Error uploading video in modal:', err);
      // Fallback
      onAddVideo({
        ...videoMetadata,
        id: `vid_${Date.now()}`,
        videoUrl: typeof videoSource === 'string' ? videoSource : URL.createObjectURL(videoSource as Blob),
      });
    } finally {
      setIsUploading(false);
      stopCameraStream();
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[#121214] border border-white/15 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl text-white space-y-5 relative overflow-hidden my-auto max-h-[92vh] overflow-y-auto scrollbar-thin"
        >
          {/* Upload Progress Overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center space-y-4 p-6 text-center">
              <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">동영상 서버 저장 중...</h3>
                <p className="text-xs text-gray-300 max-w-xs">다른 기기 및 계정 어디서든 접근할 수 있도록 동영상을 서버로 안전하게 업로드하고 있습니다.</p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>투구 영상 촬영 & 저장</span>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    Max 15s
                  </span>
                </h3>
                <p className="text-xs text-gray-400">
                  투구 메커니즘 분석을 위해 영상이 녹화/저장됩니다. <span className="text-emerald-400/90 font-medium">(※ 15초 이하의 영상만 저장 가능합니다)</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopCameraStream();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs: Direct Webcam Record vs File Upload */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 border border-white/10 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('record')}
              className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'record'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>웹캠 / 카메라 직접 촬영</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopCameraStream();
                setMode('upload');
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                mode === 'upload'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>영상 파일 업로드 (.mp4)</span>
            </button>
          </div>

          {/* Mode 1: Direct Webcam Record */}
          {mode === 'record' && (
            <div className="space-y-4">
              {/* Video Preview Box */}
              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-white/15 flex flex-col items-center justify-center group shadow-inner">
                {recordedBlobUrl ? (
                  // Recorded Result Preview
                  <video src={recordedBlobUrl || undefined} controls autoPlay className="w-full h-full object-contain" />
                ) : (
                  // Live Camera Stream or Placeholder
                  <>
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      onError={(e) => { console.warn('Camera preview failed:', e); e.preventDefault(); }}
                      className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : 'block'}`}
                    />

                    {!isCameraActive && (
                      <div className="text-center p-6 space-y-3">
                        <Camera className="w-10 h-10 text-gray-500 mx-auto animate-pulse" />
                        <p className="text-xs text-gray-300">
                          카메라를 켜서 투구 모션을 촬영하세요.
                        </p>
                        <p className="text-[11px] text-emerald-400/80">※ 15초 이하의 영상만 저장 가능합니다.</p>
                        <button
                          type="button"
                          onClick={startCamera}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-md cursor-pointer"
                        >
                          카메라 켜기
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Live Recording Overlay & Progress Bar */}
                {isRecording && (
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between bg-black/75 backdrop-blur-md border border-rose-500/40 px-3 py-1.5 rounded-xl text-xs font-mono z-10">
                    <div className="flex items-center gap-2 text-rose-400 font-bold animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>녹화 중...</span>
                    </div>

                    <div className="text-white font-bold">
                      {recordingSeconds.toFixed(1)}s / 15.0s
                    </div>
                  </div>
                )}

                {/* Progress Bar for 15 Seconds */}
                {isRecording && (
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800">
                    <div
                      className="h-full bg-rose-500 transition-all duration-75"
                      style={{ width: `${Math.min(100, (recordingSeconds / 15.0) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Camera Error Alert */}
              {cameraError && (
                <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Recording Controls */}
              {isCameraActive && (
                <div className="flex items-center justify-center gap-3">
                  {!isRecording && !recordedBlobUrl && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-6 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-white" />
                      <span>촬영 시작</span>
                    </button>
                  )}

                  {isRecording && (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="bg-white text-black hover:bg-gray-200 font-extrabold text-xs px-6 py-2.5 rounded-full transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Square className="w-4 h-4 fill-black" />
                      <span>촬영 완료 ({recordingSeconds.toFixed(1)}초)</span>
                    </button>
                  )}

                  {recordedBlobUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRecordedBlobUrl(null);
                          startCamera();
                        }}
                        className="bg-white/10 hover:bg-white/20 text-white text-xs px-3.5 py-2 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>재촬영하기</span>
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>💾 영상 저장하기</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Mode 2: File Upload */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-white/20 hover:border-emerald-400/50 rounded-2xl p-6 text-center space-y-3 bg-black/40 transition-colors">
                <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-white">투구 영상 파일 선택 (.mp4, .webm, .mov)</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    ※ 15초 이하의 영상만 저장 가능합니다.
                  </p>
                </div>

                <label className="inline-block bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer border border-white/10">
                  <span>파일 찾아보기</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadFileName && (
                  <p className="text-xs font-mono text-emerald-400 font-bold">
                    선택된 파일: {uploadFileName}
                  </p>
                )}
              </div>

              {uploadDurationWarning && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-3 rounded-xl text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    안내: 업로드된 영상이 15초를 초과합니다. 릴리스 포인트 분석을 위해 앞 15초 구간 위주로 플레이어에 표시됩니다.
                  </span>
                </div>
              )}

              {uploadUrl && (
                <div className="space-y-3">
                  <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/15">
                    <video src={uploadUrl || undefined} controls className="w-full h-full object-contain" />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs px-5 py-2 rounded-full transition-all flex items-center gap-1.5 shadow-lg cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>💾 업로드한 영상 저장하기</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Metadata Section */}
          <form onSubmit={handleSubmit} className="space-y-4 border-t border-white/10 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Date (Bound to Calendar Date!) */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>저장 날짜 (캘린더 연동)</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Pitch Type */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-bold">구종 선택</label>
                <select
                  value={pitchType}
                  onChange={(e) => setPitchType(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="포심 직구">포심 직구 (4-Seam)</option>
                  <option value="투심 직구">투심 직구 (2-Seam)</option>
                  <option value="슬라이더">슬라이더 (Slider)</option>
                  <option value="커브">커브ball (Curveball)</option>
                  <option value="체인지업">체인지업 (Changeup)</option>
                  <option value="커터">커터 (Cutter)</option>
                  <option value="스플리터">스플리터 (Splitter)</option>
                  <option value="기타 모션">기타 피칭 모션</option>
                </select>
              </div>

              {/* Velocity */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-bold">측정 구속 (km/h)</label>
                <input
                  type="number"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  required
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              {/* Camera Angle */}
              <div className="space-y-1">
                <label className="text-[11px] text-gray-300 font-bold">카메라 촬영 각도</label>
                <select
                  value={cameraAngle}
                  onChange={(e) => setCameraAngle(e.target.value as any)}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                >
                  <option value="Behind Mound">Behind Mound (마운드 후방)</option>
                  <option value="Side View">Side View (측면 메커니즘)</option>
                  <option value="High Home">High Home (포수 후방)</option>
                  <option value="Slow-Mo 240fps">Slow-Mo 240fps (초고속 슬로우)</option>
                </select>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-300 font-bold">영상 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 8월 2일 불펜 149km/h 포심 릴리스 순간"
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Analysis Notes */}
            <div className="space-y-1">
              <label className="text-[11px] text-gray-300 font-bold">피칭 메커니즘 메모 & 체크포인트</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="예: 디딤발 착지 시 골반 회전 타이밍 양호, 릴리스 포인트 고정 점검"
                className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 resize-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  stopCameraStream();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                취소
              </button>

              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>💾 영상 저장하기 ({date} 날짜 기록)</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
