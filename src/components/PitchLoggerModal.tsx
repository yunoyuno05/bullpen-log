import i18n from '../lib/i18n';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Pitcher, PitchSession, PitchSessionType } from '../types';
import { BaseballIcon } from './BaseballIcon';
import { AlertTriangle, Plus, Minus, Flame, Check } from 'lucide-react';


const t = i18n.t.bind(i18n);

interface PitchLoggerModalProps {
  pitcher: Pitcher;
  isOpen: boolean;
  onClose: () => void;
  onSaveSession: (session: Omit<PitchSession, 'id'>) => void;
}

export const PitchLoggerModal: React.FC<PitchLoggerModalProps> = ({
  pitcher,
  isOpen,
  onClose,
  onSaveSession,
}) => {
  if (!isOpen) return null;

  // Session state
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState<PitchSessionType>('BULLPEN');

  // Live pitch counter state
  const [fastball, setFastball] = useState<number>(20);
  const [slider, setSlider] = useState<number>(10);
  const [curveball, setCurveball] = useState<number>(5);
  const [changeup, setChangeup] = useState<number>(5);
  const [cutter, setCutter] = useState<number>(0);

  const totalPitches = fastball + slider + curveball + changeup + cutter;

  // Metrics
  const [maxVel, setMaxVel] = useState<number>(pitcher.maxVelocity || 148);
  const [avgVel, setAvgVel] = useState<number>(142);
  const [rpe, setRpe] = useState<number>(7);
  const [fatigue, setFatigue] = useState<number>(4);
  const [armSoreness, setArmSoreness] = useState<boolean>(false);
  const [sorenessLocation, setSorenessLocation] = useState<string>('팔꿈치 내측 (UCL 근처)');
  const [notes, setNotes] = useState<string>('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate dynamic ACWR impact based on new pitch count
    const baseAcwr = pitcher.currentAcwr;
    const acwrImpact = parseFloat((baseAcwr + (totalPitches > 60 ? 0.08 : 0.02)).toFixed(2));

    onSaveSession({
      pitcherId: pitcher.id,
      date,
      sessionType,
      totalPitches,
      fastballCount: fastball,
      sliderCount: slider,
      curveballCount: curveball,
      changeupCount: changeup,
      cutterCount: cutter,
      maxVel,
      avgVel,
      rpe,
      fatigue,
      armSoreness,
      sorenessLocation: armSoreness ? sorenessLocation : undefined,
      notes,
      acwrImpact,
    });

    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1c1c1e]/95 border border-white/20 rounded-[28px] p-6 md:p-8 max-w-2xl w-full text-white shadow-2xl my-8 space-y-6 backdrop-blur-3xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#34C759] font-bold uppercase tracking-wider">NEW BULLPEN LOG</span>
            <h2 className="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
              <BaseballIcon className="w-5 h-5 text-white" />
              <span>#{pitcher.number} {pitcher.name} 피칭/불펜 세션 등록</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
          {/* Top Row: Date & Session Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">날짜</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1 font-semibold">세션 유구 종류</label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as PitchSessionType)}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white font-semibold"
              >
                <option value="BULLPEN">불펜 훈련 (Bullpen)</option>
                <option value="GAME">실전 경기 (Game)</option>
                <option value="LIVE_BP">라이브 BP (Live Pitching)</option>
                <option value="CATCH">캐치볼 / 롱토스 (Catch Ball)</option>
                <option value="PLYO">플라이오 볼 / 보강 (Plyo Ball)</option>
              </select>
            </div>
          </div>

          {/* Live Pitch Counter Section */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="font-bold text-sm text-white">실시간 구종별 카운터 (Total: {totalPitches}구)</span>
                <p className="text-[11px] text-gray-400">버튼을 눌러 피칭 중에 터치 카운트할 수 있습니다.</p>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-400">{totalPitches} 구</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Fastball */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center space-y-1">
                <div className="text-[10px] text-blue-400 font-bold">포심 직구</div>
                <div className="text-xl font-bold font-mono">{fastball}</div>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFastball(Math.max(0, fastball - 1))}
                    className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setFastball(fastball + 1)}
                    className="w-6 h-6 rounded bg-blue-500 hover:bg-blue-400 text-xs font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center space-y-1">
                <div className="text-[10px] text-amber-400 font-bold">슬라이더</div>
                <div className="text-xl font-bold font-mono">{slider}</div>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSlider(Math.max(0, slider - 1))}
                    className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlider(slider + 1)}
                    className="w-6 h-6 rounded bg-amber-500 hover:bg-amber-400 text-xs font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Curveball */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center space-y-1">
                <div className="text-[10px] text-emerald-400 font-bold">커브</div>
                <div className="text-xl font-bold font-mono">{curveball}</div>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurveball(Math.max(0, curveball - 1))}
                    className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurveball(curveball + 1)}
                    className="w-6 h-6 rounded bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Changeup */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center space-y-1">
                <div className="text-[10px] text-pink-400 font-bold">체인지업</div>
                <div className="text-xl font-bold font-mono">{changeup}</div>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setChangeup(Math.max(0, changeup - 1))}
                    className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangeup(changeup + 1)}
                    className="w-6 h-6 rounded bg-pink-500 hover:bg-pink-400 text-xs font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Cutter/Splitter */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center space-y-1">
                <div className="text-[10px] text-teal-400 font-bold">커터/스플리터</div>
                <div className="text-xl font-bold font-mono">{cutter}</div>
                <div className="flex justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCutter(Math.max(0, cutter - 1))}
                    className="w-6 h-6 rounded bg-white/10 hover:bg-white/20 text-xs font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => setCutter(cutter + 1)}
                    className="w-6 h-6 rounded bg-teal-500 hover:bg-teal-400 text-xs font-bold text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Velocity & Exertion */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-400 mb-1">최고 구속 (km/h)</label>
              <input
                type="number"
                value={maxVel}
                onChange={(e) => setMaxVel(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">평균 구속 (km/h)</label>
              <input
                type="number"
                value={avgVel}
                onChange={(e) => setAvgVel(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white font-mono font-bold text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">운동 자각도 (RPE 1-10)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={rpe}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-amber-400 font-mono font-bold text-sm"
                required
              />
            </div>
          </div>

          {/* Arm Soreness Check */}
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={armSoreness}
                onChange={(e) => setArmSoreness(e.target.checked)}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
              <span className="font-bold text-rose-300 text-xs">피칭 후 팔꿈치/어깨 통증 및 뻐근함 발생 여부</span>
            </label>

            {armSoreness && (
              <div>
                <label className="block text-gray-400 mb-1">통증 주요 위치 설명</label>
                <input
                  type="text"
                  value={sorenessLocation}
                  onChange={(e) => setSorenessLocation(e.target.value)}
                  placeholder="예: 팔꿈치 내측 (UCL 근처) 타이트함"
                  className="w-full bg-black/60 border border-rose-500/30 rounded-xl p-2.5 text-white"
                />
              </div>
            )}
          </div>

          {/* Session Notes */}
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">특이사항 & 코칭 메모</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="예: 30구 투구 후 체인지업 떨어지는 각 양호. 팔꿈치 특이사항 없음."
              className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white h-20"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 hover:bg-white/15 text-white font-semibold px-5 py-2.5 rounded-full cursor-pointer transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-7 py-2.5 rounded-full transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
            >
              <span>💾 피칭 기록 저장하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
