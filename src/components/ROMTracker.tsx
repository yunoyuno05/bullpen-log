import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Pitcher, ROMRecord } from '../types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Compass,
  Zap,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

interface ROMTrackerProps {
  pitcher: Pitcher;
  romRecords: ROMRecord[];
  onAddROMRecord: (record: Omit<ROMRecord, 'id'>) => void;
  setActiveTab: (tab: string) => void;
}

export const ROMTracker: React.FC<ROMTrackerProps> = ({
  pitcher,
  romRecords,
  onAddROMRecord,
  setActiveTab,
}) => {
  const pitcherRom = romRecords.filter((r) => r.pitcherId === pitcher.id);
  const latestRom = pitcherRom[0] || {
    shoulderFlexion: 170,
    shoulderExtension: 55,
    shoulderIntRotation: 42,
    shoulderExtRotation: 110,
    elbowFlexion: 140,
    elbowExtension: 0,
    painScore: 2,
    painLocation: '우측 팔꿈치 내측 (UCL 주변)',
  };

  const [showModal, setShowModal] = useState(false);

  // New ROM Form State
  const [sFlex, setSFlex] = useState<number>(170);
  const [sExt, setSExt] = useState<number>(55);
  const [sIntRot, setSIntRot] = useState<number>(42);
  const [sExtRot, setSExtRot] = useState<number>(110);
  const [eFlex, setEFlex] = useState<number>(140);
  const [eExt, setEExt] = useState<number>(0);
  const [painScore, setPainScore] = useState<number>(2);
  const [painLoc, setPainLoc] = useState<string>('우측 팔꿈치 내측 (UCL 주변)');
  const [notes, setNotes] = useState<string>('');

  const handleSubmitNewROM = (e: React.FormEvent) => {
    e.preventDefault();
    onAddROMRecord({
      pitcherId: pitcher.id,
      date: new Date().toISOString().split('T')[0],
      shoulderFlexion: sFlex,
      shoulderExtension: sExt,
      shoulderIntRotation: sIntRot,
      shoulderExtRotation: sExtRot,
      elbowFlexion: eFlex,
      elbowExtension: eExt,
      painScore,
      painLocation: painLoc,
      testerNotes: notes,
    });
    setShowModal(false);
  };

  // Check GIRD status (Glenohumeral Internal Rotation Deficit)
  const isGirdDeficit = latestRom.shoulderIntRotation < 45;

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <Activity className="w-4 h-4" />
            <span>Range of Motion & Pain Mapping</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">가동범위(ROM) & 신체 히트맵</h1>
          <p className="text-gray-400 text-sm mt-1">
            어깨 내회전 결핍(GIRD) 및 팔꿈치 내측(UCL) 가동범위를 추적하여 투수 특화 근골격계 안전성을 진단합니다.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-5 py-2.5 rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ ROM 측정치 등록</span>
        </button>
      </div>

      {/* Main ROM Angle Cards & Visual Joint Diagram */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Joint Interactive Diagram */}
        <div className="bg-gradient-to-b from-gray-900 via-black to-gray-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between items-center text-center space-y-6 relative overflow-hidden">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 font-semibold">통증 히트맵 매핑</span>
            <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
              통증 {latestRom.painScore}/10
            </span>
          </div>

          {/* Body Pitching Arm Graphic Diagram */}
          <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center bg-black/60 shadow-inner">
            {/* Concentric Circles */}
            <div className="absolute inset-4 rounded-full border border-dashed border-white/10 animate-spin-slow" />
            <div className="absolute inset-12 rounded-full border border-white/5" />

            {/* Arm Silhouette & Joint Indicators */}
            <div className="relative z-10 space-y-3">
              {/* Shoulder Joint Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-emerald-400/30 border border-emerald-400 flex items-center justify-center animate-ping" />
                <span className="text-xs font-bold font-mono text-emerald-300">어깨 관절 (Shoulder)</span>
              </div>

              {/* Elbow Joint Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-rose-500/50 border border-rose-400 flex items-center justify-center animate-pulse" />
                <span className="text-xs font-bold font-mono text-rose-300">팔꿈치 UCL 관절 (Elbow)</span>
              </div>

              {/* Wrist Indicator */}
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-sky-400/30 border border-sky-400" />
                <span className="text-xs font-bold font-mono text-sky-300">손목/손가락 (Wrist)</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-1">
            <div className="text-[11px] font-semibold text-gray-400 uppercase">최근 등록된 통증 위치</div>
            <div className="text-sm font-bold text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>{latestRom.painLocation || '통증 없음'}</span>
            </div>
            <p className="text-[11px] text-gray-400 pt-1">
              {latestRom.testerNotes || '특이사항 없음'}
            </p>
          </div>
        </div>

        {/* ROM Angle Gauges (2 Cols) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gauge 1: Shoulder Int Rotation (GIRD) */}
          <div className={`bg-white/[0.03] backdrop-blur-md border rounded-2xl p-5 space-y-3 ${isGirdDeficit ? 'border-amber-500/40 bg-amber-500/5' : 'border-white/10'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">어깨 내회전 (Internal Rotation)</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isGirdDeficit ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {isGirdDeficit ? 'GIRD 경고' : '정상'}
              </span>
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {latestRom.shoulderIntRotation}° <span className="text-xs font-sans text-gray-400 font-normal">/ 정상 50~60°</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {isGirdDeficit
                ? '내회전 가동범위가 45도 미만으로 감소되었습니다 (GIRD). 슬리퍼 스트레칭이 시급합니다.'
                : '양호한 어깨 내회전 가동성 확보 중입니다.'}
            </p>
          </div>

          {/* Gauge 2: Shoulder Ext Rotation */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">어깨 외회전 (External Rotation)</span>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">정상</span>
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {latestRom.shoulderExtRotation}° <span className="text-xs font-sans text-gray-400 font-normal">/ 정상 90~110°</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              투구 코킹 단계(Late Cocking)에서 충분한 회전 각도를 제공합니다.
            </p>
          </div>

          {/* Gauge 3: Elbow Flexion */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">팔꿈치 굴곡 (Elbow Flexion)</span>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">정상</span>
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {latestRom.elbowFlexion}° <span className="text-xs font-sans text-gray-400 font-normal">/ 정상 140~150°</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              이두근 및 상완근 유연성 정상범위입니다.
            </p>
          </div>

          {/* Gauge 4: Elbow Extension */}
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">팔꿈치 신전 (Elbow Extension)</span>
              <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">정상</span>
            </div>
            <div className="text-3xl font-black font-mono text-white">
              {latestRom.elbowExtension}° <span className="text-xs font-sans text-gray-400 font-normal">/ 정상 0°</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              팔꿈치가 완전히 펴지는 각도입니다. 삼두근 수축 결핍 없음.
            </p>
          </div>
        </div>
      </div>

      {/* ROM Historical Table */}
      <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4">
        <h3 className="text-lg font-bold text-white">가동범위(ROM) 측정 이력 기록</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
              <tr>
                <th className="p-3">측정 일자</th>
                <th className="p-3">어깨 내회전</th>
                <th className="p-3">어깨 외회전</th>
                <th className="p-3">팔꿈치 굴곡/신전</th>
                <th className="p-3">통증 점수</th>
                <th className="p-3">통증 부위 / 메모</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {pitcherRom.map((r) => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-white font-bold">{r.date}</td>
                  <td className={`p-3 font-bold ${r.shoulderIntRotation < 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {r.shoulderIntRotation}°
                  </td>
                  <td className="p-3 text-white">{r.shoulderExtRotation}°</td>
                  <td className="p-3 text-white">{r.elbowFlexion}° / {r.elbowExtension}°</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full ${r.painScore > 3 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {r.painScore}/10
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 max-w-xs truncate">{r.painLocation} ({r.testerNotes || '없음'})</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New ROM Record Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-white/15 rounded-3xl p-6 md:p-8 max-w-lg w-full space-y-6 text-white shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span>새 ROM & 통증 측정 등록</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNewROM} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">어깨 내회전 (°)</label>
                  <input
                    type="number"
                    value={sIntRot}
                    onChange={(e) => setSIntRot(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">어깨 외회전 (°)</label>
                  <input
                    type="number"
                    value={sExtRot}
                    onChange={(e) => setSExtRot(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1">팔꿈치 굴곡 (°)</label>
                  <input
                    type="number"
                    value={eFlex}
                    onChange={(e) => setEFlex(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1">팔꿈치 신전 (°)</label>
                  <input
                    type="number"
                    value={eExt}
                    onChange={(e) => setEExt(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">주관적 통증 점수 (0 ~ 10)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={painScore}
                    onChange={(e) => setPainScore(Number(e.target.value))}
                    className="w-full accent-rose-500 bg-gray-800 rounded-lg cursor-pointer h-2"
                  />
                  <span className="font-mono font-bold text-rose-400 text-sm">{painScore}점</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">통증 주요 위치</label>
                <input
                  type="text"
                  value={painLoc}
                  onChange={(e) => setPainLoc(e.target.value)}
                  placeholder="예: 우측 팔꿈치 내측 (UCL 근처)"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">테스터 관찰 메모</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="예: 슬리퍼 스트레칭 수행 후 5도 회복됨"
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-2.5 text-white h-20"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-xl"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-6 py-2.5 rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  💾 측정 기록 저장하기
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
