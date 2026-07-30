import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pitcher, PitchSession, ROMRecord, PitchVideo, DailyLog, PitchSequence, GoalRoadmap, UserAccount } from './types';
import {
  INITIAL_PITCHERS,
  INITIAL_SESSIONS,
  INITIAL_ROM_RECORDS,
  INITIAL_VIDEOS,
  INITIAL_DAILY_LOGS,
  INITIAL_PITCH_SEQUENCES,
  INITIAL_GOAL_ROADMAP
} from './data/initialData';
import { Navbar } from './components/Navbar';
import { HeroLanding } from './components/HeroLanding';
import { Dashboard } from './components/Dashboard';
import { TrainingCalendar } from './components/TrainingCalendar';
import { ACWRAnalytics } from './components/ACWRAnalytics';
import { ROMTracker } from './components/ROMTracker';
import { VideoArchive } from './components/VideoArchive';
import { AICareReport } from './components/AICareReport';
import { PitchLogsTable } from './components/PitchLogsTable';
import { PitchLoggerModal } from './components/PitchLoggerModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { BaseballIcon } from './components/BaseballIcon';
import { Twitter, Instagram, Mail } from 'lucide-react';

export default function App() {
  // Pitchers state
  const [pitchers, setPitchers] = useState<Pitcher[]>(() => {
    const saved = localStorage.getItem('bullpen_pitchers');
    return saved ? JSON.parse(saved) : INITIAL_PITCHERS;
  });

  const [selectedPitcherId, setSelectedPitcherId] = useState<string>('p1');

  // User Account state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('bullpen_user_account');
    return saved ? JSON.parse(saved) : {
      id: 'usr_default',
      email: 'pitcher18@bullpen.com',
      name: '김투수',
      number: 18,
      team: '서울 자이언츠',
      throwingArm: 'RHP',
      role: '선발 (SP)',
      joinedDate: '2026-01-15',
      maxVelocity: 153.2,
    };
  });

  // Auth & Profile Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<PitchSession[]>(() => {
    const saved = localStorage.getItem('bullpen_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // ROM state
  const [romRecords, setRomRecords] = useState<ROMRecord[]>(() => {
    const saved = localStorage.getItem('bullpen_rom_records');
    return saved ? JSON.parse(saved) : INITIAL_ROM_RECORDS;
  });

  // Videos state
  const [videos, setVideos] = useState<PitchVideo[]>(() => {
    const saved = localStorage.getItem('bullpen_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  // Daily Logs state
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('bullpen_daily_logs');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_LOGS;
  });

  // Pitch Sequences state
  const [pitchSequences, setPitchSequences] = useState<PitchSequence[]>(() => {
    const saved = localStorage.getItem('bullpen_pitch_sequences');
    return saved ? JSON.parse(saved) : INITIAL_PITCH_SEQUENCES;
  });

  // Goal Roadmap state
  const [goalRoadmap, setGoalRoadmap] = useState<GoalRoadmap>(() => {
    const saved = localStorage.getItem('bullpen_goal_roadmap');
    return saved ? JSON.parse(saved) : INITIAL_GOAL_ROADMAP;
  });

  // Active Tab View State ('hero' | 'dashboard' | 'calendar' | 'acwr' | 'rom' | 'video' | 'ai-report' | 'logs')
  const [activeTab, setActiveTab] = useState<string>('hero');

  // Logger Modal State
  const [isLoggerOpen, setIsLoggerOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bullpen_pitchers', JSON.stringify(pitchers));
  }, [pitchers]);

  useEffect(() => {
    localStorage.setItem('bullpen_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('bullpen_rom_records', JSON.stringify(romRecords));
  }, [romRecords]);

  useEffect(() => {
    localStorage.setItem('bullpen_videos', JSON.stringify(videos));
  }, [videos]);

  useEffect(() => {
    localStorage.setItem('bullpen_daily_logs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('bullpen_pitch_sequences', JSON.stringify(pitchSequences));
  }, [pitchSequences]);

  useEffect(() => {
    localStorage.setItem('bullpen_goal_roadmap', JSON.stringify(goalRoadmap));
  }, [goalRoadmap]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bullpen_user_account', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bullpen_user_account');
    }
  }, [currentUser]);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    // Also create or sync with pitcher profile
    const existingPitcher = pitchers.find((p) => p.name === user.name || p.number === user.number);
    if (!existingPitcher) {
      const newPitcher: Pitcher = {
        id: user.id,
        name: user.name,
        number: user.number,
        team: user.team,
        throwingArm: user.throwingArm,
        role: user.role,
        age: 24,
        heightWeight: '185cm / 84kg',
        maxVelocity: user.maxVelocity || 151,
        currentAcwr: 1.15,
        email: user.email,
      };
      setPitchers((prev) => [newPitcher, ...prev]);
      setSelectedPitcherId(newPitcher.id);
    } else {
      setSelectedPitcherId(existingPitcher.id);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const currentPitcher: Pitcher = currentUser
    ? {
        id: currentUser.id,
        name: currentUser.name,
        number: currentUser.number,
        team: currentUser.team,
        throwingArm: currentUser.throwingArm,
        role: currentUser.role,
        age: 24,
        heightWeight: '185cm / 84kg',
        maxVelocity: currentUser.maxVelocity || 151,
        currentAcwr: 1.15,
        email: currentUser.email,
      }
    : (pitchers.find((p) => p.id === selectedPitcherId) || pitchers[0]);

  // Handler to save new pitching session
  const handleSaveSession = (newSessionData: Omit<PitchSession, 'id'>) => {
    const newSession: PitchSession = {
      ...newSessionData,
      id: `session-${Date.now()}`,
    };

    setSessions((prev) => [newSession, ...prev]);

    // Update current pitcher's ACWR if needed
    if (newSessionData.acwrImpact) {
      setPitchers((prev) =>
        prev.map((p) =>
          p.id === newSessionData.pitcherId
            ? { ...p, currentAcwr: newSessionData.acwrImpact! }
            : p
        )
      );
    }
  };

  // Handler to delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Handler to add ROM record
  const handleAddROMRecord = (newRomData: Omit<ROMRecord, 'id'>) => {
    const newRom: ROMRecord = {
      ...newRomData,
      id: `rom-${Date.now()}`,
    };
    setRomRecords((prev) => [newRom, ...prev]);
  };

  // Handler to add Video
  const handleAddVideo = (newVideoData: Omit<PitchVideo, 'id'>) => {
    const newVideo: PitchVideo = {
      ...newVideoData,
      id: `video-${Date.now()}`,
    };
    setVideos((prev) => [newVideo, ...prev]);
  };

  // Handler to save DailyLog
  const handleSaveDailyLog = (updatedLog: DailyLog) => {
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === updatedLog.date && l.pitcherId === updatedLog.pitcherId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedLog;
        return next;
      }
      return [updatedLog, ...prev];
    });
  };

  // Handler to add PitchSequence
  const handleAddPitchSequence = (seqData: Omit<PitchSequence, 'id'>) => {
    const newSeq: PitchSequence = {
      ...seqData,
      id: `seq-${Date.now()}`,
    };
    setPitchSequences((prev) => [newSeq, ...prev]);
  };

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans antialiased">
      {/* Top Fixed Navbar */}
      <Navbar
        pitchers={pitchers}
        selectedPitcherId={selectedPitcherId}
        onSelectPitcher={setSelectedPitcherId}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogger={() => setIsLoggerOpen(true)}
        currentUser={currentUser}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Active Tab Content with Smooth Transitions */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'hero' && (
              <HeroLanding
                currentPitcher={currentPitcher}
                setActiveTab={setActiveTab}
                onOpenLogger={() => setIsLoggerOpen(true)}
                currentUser={currentUser}
                onOpenAuth={handleOpenAuth}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                pitcher={currentPitcher}
                sessions={sessions}
                romRecords={romRecords}
                setActiveTab={setActiveTab}
                onOpenLogger={() => setIsLoggerOpen(true)}
              />
            )}

            {activeTab === 'calendar' && (
              <TrainingCalendar
                pitcher={currentPitcher}
                sessions={sessions}
                dailyLogs={dailyLogs}
                onSaveDailyLog={handleSaveDailyLog}
                pitchSequences={pitchSequences}
                onAddPitchSequence={handleAddPitchSequence}
                goalRoadmap={goalRoadmap}
              />
            )}

            {activeTab === 'acwr' && (
              <ACWRAnalytics
                pitcher={currentPitcher}
                sessions={sessions}
                setActiveTab={setActiveTab}
                onOpenLogger={() => setIsLoggerOpen(true)}
              />
            )}

            {activeTab === 'rom' && (
              <ROMTracker
                pitcher={currentPitcher}
                romRecords={romRecords}
                onAddROMRecord={handleAddROMRecord}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'video' && (
              <VideoArchive
                pitcher={currentPitcher}
                videos={videos}
                onAddVideo={handleAddVideo}
              />
            )}

            {activeTab === 'ai-report' && (
              <AICareReport
                pitcher={currentPitcher}
                sessions={sessions}
                romRecords={romRecords}
              />
            )}

            {activeTab === 'logs' && (
              <PitchLogsTable
                pitcher={currentPitcher}
                sessions={sessions}
                onDeleteSession={handleDeleteSession}
                onOpenLogger={() => setIsLoggerOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Pitch Logger Modal */}
      <PitchLoggerModal
        pitcher={currentPitcher}
        isOpen={isLoggerOpen}
        onClose={() => setIsLoggerOpen(false)}
        onSaveSession={handleSaveSession}
      />

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authMode}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
      />

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-12 px-6 md:px-12 text-center md:text-left text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('hero')}>
            <BaseballIcon className="w-5 h-5 text-white" />
            <span className="font-bold text-lg tracking-tight text-white">Bullpen Log</span>
          </div>

          <div>
            &copy; 2026 Bullpen Log. All rights reserved. <br className="md:hidden" />
            Designed for Pitchers & Biomechanics Coaches.
          </div>

          <div className="flex gap-4 text-gray-400">
            <a href="#" className="hover:text-white transition"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition"><Instagram className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition"><Mail className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
