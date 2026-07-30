import React, { useState } from 'react';
import { Pitcher, PitchSession } from '../types';
import { BaseballIcon } from './BaseballIcon';
import {
  Search,
  Filter,
  Download,
  Trash2,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface PitchLogsTableProps {
  pitcher: Pitcher;
  sessions: PitchSession[];
  onDeleteSession: (sessionId: string) => void;
  onOpenLogger: () => void;
}

export const PitchLogsTable: React.FC<PitchLogsTableProps> = ({
  pitcher,
  sessions,
  onDeleteSession,
  onOpenLogger,
}) => {
  const pitcherSessions = sessions.filter((s) => s.pitcherId === pitcher.id);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredSessions = pitcherSessions.filter((s) => {
    const matchesSearch =
      s.date.includes(searchTerm) || (s.notes && s.notes.includes(searchTerm));
    const matchesFilter = filterType === 'ALL' || s.sessionType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Export CSV function
  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Total Pitches', 'Fastball', 'Slider', 'Curveball', 'Changeup', 'Cutter', 'Max Vel (km/h)', 'Avg Vel (km/h)', 'RPE', 'Fatigue', 'Arm Soreness', 'Notes'];
    const rows = filteredSessions.map((s) => [
      s.date,
      s.sessionType,
      s.totalPitches,
      s.fastballCount,
      s.sliderCount,
      s.curveballCount,
      s.changeupCount,
      s.cutterCount,
      s.maxVel,
      s.avgVel,
      s.rpe,
      s.fatigue,
      s.armSoreness ? 'Yes' : 'No',
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${pitcher.name}_Pitch_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToHTML = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pitcher.name} Pitch Logs - Bullpen Log</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 2rem; margin: 0; }
    .container { max-width: 1000px; margin: 0 auto; }
    h1 { margin-bottom: 0.25rem; font-size: 1.75rem; }
    .meta { color: #a3a3a3; font-size: 13px; margin-bottom: 1.5rem; }
    table { width: 100%; border-collapse: collapse; background: #171717; border-radius: 12px; overflow: hidden; border: 1px solid #262626; }
    th, td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #262626; font-size: 13px; }
    th { background: #262626; color: #a3a3a3; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    tr:hover { background: #222; }
    .badge { padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold; background: rgba(255,255,255,0.1); color: #e5e5e5; }
    .pain { color: #f87171; font-weight: bold; }
    .ok { color: #4ade80; }
  </style>
</head>
<body>
  <div class="container">
    <h1>#{pitcher.number} ${pitcher.name} 선수 피칭 로그 이력</h1>
    <div class="meta">출력일: ${new Date().toLocaleDateString('ko-KR')} | Bullpen Log System</div>
    <table>
      <thead>
        <tr>
          <th>날짜</th>
          <th>세션 유형</th>
          <th>총 투구수</th>
          <th>최고 구속</th>
          <th>평균 구속</th>
          <th>RPE 강도</th>
          <th>피로도</th>
          <th>통증 여부</th>
          <th>메모</th>
        </tr>
      </thead>
      <tbody>
        ${filteredSessions.map(s => `
          <tr>
            <td>${s.date}</td>
            <td><span class="badge">${s.type}</span></td>
            <td><strong>${s.totalPitches}구</strong></td>
            <td>${s.maxVel} km/h</td>
            <td>${s.avgVel} km/h</td>
            <td>${s.rpe}/10</td>
            <td>${s.fatigue}/10</td>
            <td>${s.armSoreness ? '<span class="pain">⚠️ 통증있음</span>' : '<span class="ok">정상</span>'}</td>
            <td>${s.notes || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${pitcher.name}_Pitch_Logs_${new Date().toISOString().split('T')[0]}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
            <BaseballIcon className="w-4 h-4 text-emerald-400" />
            <span>Pitch History Archive</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">전체 피칭 일지 (Pitch Logs)</h1>
          <p className="text-gray-400 text-sm mt-1">
            #{pitcher.number} {pitcher.name} 선수의 모든 불펜 피칭, 경기, 라이브 BP 데이터 이력
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToHTML}
            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-semibold text-xs px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>HTML 다운로드</span>
          </button>
          <button
            onClick={exportToCSV}
            className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV 다운로드</span>
          </button>

          <button
            onClick={onOpenLogger}
            className="bg-white text-black hover:bg-gray-200 font-bold text-xs px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ 새 세션 추가</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="날짜 또는 메모 검색..."
            className="w-full bg-black/60 border border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-white/40"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'ALL' ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            전체 ({pitcherSessions.length})
          </button>
          <button
            onClick={() => setFilterType('BULLPEN')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'BULLPEN' ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            불펜 피칭
          </button>
          <button
            onClick={() => setFilterType('GAME')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'GAME' ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            실전 경기
          </button>
          <button
            onClick={() => setFilterType('LIVE_BP')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'LIVE_BP' ? 'bg-white text-black font-bold' : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            라이브 BP
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300 font-mono">
            <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
              <tr>
                <th className="p-4">날짜</th>
                <th className="p-4">세션 유형</th>
                <th className="p-4">총 투구수</th>
                <th className="p-4">구종 믹스 (FB/SL/CB/CH/CT)</th>
                <th className="p-4">최고 / 평균 구속</th>
                <th className="p-4">RPE / 피로도</th>
                <th className="p-4">팔 통증</th>
                <th className="p-4">메모</th>
                <th className="p-4 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-bold">{session.date}</td>
                  <td className="p-4">
                    <span className="bg-white/10 text-white border border-white/15 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                      {session.sessionType}
                    </span>
                  </td>
                  <td className="p-4 text-emerald-400 font-bold text-sm">{session.totalPitches}구</td>
                  <td className="p-4">
                    <div className="flex gap-1 text-[10px]">
                      <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
                        F:{session.fastballCount}
                      </span>
                      <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                        S:{session.sliderCount}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
                        C:{session.curveballCount}
                      </span>
                      <span className="bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-mono">
                        CH:{session.changeupCount}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-white">
                    <span className="text-amber-400 font-bold">{session.maxVel}</span> / {session.avgVel} km/h
                  </td>
                  <td className="p-4">
                    RPE <strong className="text-white">{session.rpe}</strong> (피로 {session.fatigue}/10)
                  </td>
                  <td className="p-4">
                    {session.armSoreness ? (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" />
                        있음
                      </span>
                    ) : (
                      <span className="text-gray-500">없음</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 max-w-xs truncate">{session.notes || '-'}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onDeleteSession(session.id)}
                      className="text-gray-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredSessions.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500 font-sans text-xs">
                    등록된 피칭 일지가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
