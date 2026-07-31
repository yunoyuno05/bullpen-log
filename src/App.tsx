import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { supabase } from './lib/supabase';
import { Pitcher, PitchSession, ROMRecord, PitchVideo, DailyLog, PitchSequence, GoalRoadmap, UserAccount, TrainingScheduleItem } from './types';
import {
  INITIAL_PITCHERS,
  INITIAL_SESSIONS,
  INITIAL_ROM_RECORDS,
  INITIAL_VIDEOS,
  INITIAL_DAILY_LOGS,
  INITIAL_PITCH_SEQUENCES,
  INITIAL_GOAL_ROADMAP,
  INITIAL_TRAINING_SCHEDULES
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
import { SignUpPage } from './components/SignUpPage';
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id !== 'usr_default' && parsed.id !== 'usr_demo') {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
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

  // Training Schedules state
  const [trainingSchedules, setTrainingSchedules] = useState<TrainingScheduleItem[]>(() => {
    const saved = localStorage.getItem('bullpen_training_schedules');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_SCHEDULES;
  });

  // Auto-Archive passed schedules setting state
  const [autoArchivePassedSchedules, setAutoArchivePassedSchedules] = useState<boolean>(() => {
    const saved = localStorage.getItem('bullpen_auto_archive');
    return saved !== null ? JSON.parse(saved) : true;
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
    localStorage.setItem('bullpen_training_schedules', JSON.stringify(trainingSchedules));
  }, [trainingSchedules]);

  useEffect(() => {
    localStorage.setItem('bullpen_auto_archive', JSON.stringify(autoArchivePassedSchedules));
  }, [autoArchivePassedSchedules]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bullpen_user_account', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bullpen_user_account');
    }
  }, [currentUser]);

  // Sync Supabase Auth Session on mount
  useEffect(() => {
    const checkSupabaseAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const sbUser = session.user;
          const metadata = sbUser.user_metadata || {};
          const syncedUser: UserAccount = {
            id: sbUser.id,
            email: sbUser.email || '',
            name: metadata.name || '김투수',
            number: typeof metadata.number === 'number' ? metadata.number : 18,
            team: metadata.team || '서울 자이언츠',
            throwingArm: metadata.throwingArm || 'RHP',
            joinedDate: sbUser.created_at ? sbUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            maxVelocity: metadata.maxVelocity || 153.2,
            height: metadata.height || 185,
            weight: metadata.weight || 85,
            wingspan: metadata.wingspan || 190,
            age: metadata.age || 24,
            birthdate: metadata.birthdate || '2000-01-15',
            avatarUrl: metadata.avatarUrl || '',
          };
          setCurrentUser(syncedUser);
        }
      } catch (e) {
        console.log('Supabase session check:', e);
      }
    };

    checkSupabaseAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const sbUser = session.user;
        const metadata = sbUser.user_metadata || {};
        const syncedUser: UserAccount = {
          id: sbUser.id,
          email: sbUser.email || '',
          name: metadata.name || '김투수',
          number: typeof metadata.number === 'number' ? metadata.number : 18,
          team: metadata.team || '서울 자이언츠',
          throwingArm: metadata.throwingArm || 'RHP',
          joinedDate: sbUser.created_at ? sbUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          maxVelocity: metadata.maxVelocity || 153.2,
          height: metadata.height || 185,
          weight: metadata.weight || 85,
          wingspan: metadata.wingspan || 190,
          age: metadata.age || 24,
          birthdate: metadata.birthdate || '2000-01-15',
          avatarUrl: metadata.avatarUrl || '',
        };
        setCurrentUser(syncedUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    // Automatically navigate to live dashboard upon login
    setActiveTab('dashboard');

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

  const handleUpdateProfile = async (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);

    // Update pitcher state so active pitching stats reflect changes
    setPitchers((prev) =>
      prev.map((p) =>
        p.id === updatedUser.id || p.email === updatedUser.email
          ? {
              ...p,
              name: updatedUser.name,
              number: updatedUser.number,
              team: updatedUser.team,
              throwingArm: updatedUser.throwingArm,
              maxVelocity: updatedUser.maxVelocity || p.maxVelocity,
              height: updatedUser.height,
              weight: updatedUser.weight,
              wingspan: updatedUser.wingspan,
              age: updatedUser.age || p.age,
              birthdate: updatedUser.birthdate || p.birthdate,
              avatarUrl: updatedUser.avatarUrl || p.avatarUrl,
              heightWeight: updatedUser.height && updatedUser.weight
                ? `${updatedUser.height}cm / ${updatedUser.weight}kg`
                : p.heightWeight,
            }
          : p
      )
    );

    // Sync with Supabase Auth user metadata & profile table if available
    try {
      await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          number: updatedUser.number,
          team: updatedUser.team,
          throwingArm: updatedUser.throwingArm,
          maxVelocity: updatedUser.maxVelocity,
          height: updatedUser.height,
          weight: updatedUser.weight,
          wingspan: updatedUser.wingspan,
          age: updatedUser.age,
          birthdate: updatedUser.birthdate,
          avatarUrl: updatedUser.avatarUrl,
        },
      });

      await supabase.from('profiles').upsert({
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        number: updatedUser.number,
        team: updatedUser.team,
        throwing_arm: updatedUser.throwingArm,
        max_velocity: updatedUser.maxVelocity,
        height: updatedUser.height,
        weight: updatedUser.weight,
        wingspan: updatedUser.wingspan,
        age: updatedUser.age,
        birthdate: updatedUser.birthdate,
        avatar_url: updatedUser.avatarUrl,
        updated_at: new Date().toISOString(),
      });
    } catch (e) {
      console.log('Supabase profile sync note:', e);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.log('Signout error:', e);
    }
    setCurrentUser(null);
    setActiveTab('hero');
  };

  // Auth Guard: Unauthenticated users cannot view functional tabs and stay on hero
  useEffect(() => {
    if (!currentUser && activeTab !== 'hero') {
      setActiveTab('hero');
      setIsAuthModalOpen(true);
    }
  }, [currentUser, activeTab]);

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

  // Handler to add or update Training Schedule
  const handleSaveSchedule = (schedule: TrainingScheduleItem) => {
    setTrainingSchedules((prev) => {
      const idx = prev.findIndex((s) => s.id === schedule.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = schedule;
        return next;
      }
      return [schedule, ...prev];
    });
  };

  // Handler to delete Training Schedule
  const handleDeleteSchedule = (scheduleId: string) => {
    setTrainingSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  // Handler to toggle Training Schedule completion
  const handleToggleScheduleCompleted = (scheduleId: string) => {
    setTrainingSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, completed: !s.completed } : s))
    );
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
                onLoginSuccess={handleLoginSuccess}
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
                schedules={trainingSchedules}
                onSaveSchedule={handleSaveSchedule}
                onDeleteSchedule={handleDeleteSchedule}
                onToggleScheduleCompleted={handleToggleScheduleCompleted}
                autoArchivePassedSchedules={autoArchivePassedSchedules}
                onToggleAutoArchive={() => setAutoArchivePassedSchedules((prev) => !prev)}
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

            {activeTab === 'signup' && (
              <SignUpPage
                onReturnHome={() => setActiveTab('hero')}
                onOpenLogin={() => setIsAuthModalOpen(true)}
                onLoginSuccess={(user) => {
                  handleLoginSuccess(user);
                  setActiveTab('dashboard');
                }}
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

      {/* Auth Modal (Login & Sign Up) */}
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
        onUpdateProfile={handleUpdateProfile}
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
