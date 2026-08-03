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
import { Twitter, Instagram, Mail, CheckCircle2, Save } from 'lucide-react';

export function loadAccountData(user: UserAccount) {
  if (!user || !user.email) {
    return null;
  }
  const key = `bullpen_account_data_${user.email.trim().toLowerCase()}`;
  const saved = localStorage.getItem(key);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const updatedUser: UserAccount = {
          ...parsed.user,
          ...user,
          id: user.id || parsed.user?.id || 'usr_' + Date.now(),
          email: user.email,
        };

        let pitchersList: Pitcher[] = Array.isArray(parsed.pitchers) ? parsed.pitchers : [];
        const existingIdx = pitchersList.findIndex(
          (p) => p.id === updatedUser.id || (p.email && p.email.toLowerCase() === updatedUser.email.toLowerCase())
        );

        const userPitcher: Pitcher = {
          id: updatedUser.id,
          name: updatedUser.name,
          number: updatedUser.number,
          team: updatedUser.team,
          throwingArm: updatedUser.throwingArm,
          role: updatedUser.role || '미정 (Unassigned)',
          age: updatedUser.age || 24,
          birthdate: updatedUser.birthdate,
          heightWeight: updatedUser.height && updatedUser.weight ? `${updatedUser.height}cm / ${updatedUser.weight}kg` : '185cm / 84kg',
          height: updatedUser.height,
          weight: updatedUser.weight,
          wingspan: updatedUser.wingspan,
          maxVelocity: updatedUser.maxVelocity || 151,
          currentAcwr: existingIdx >= 0 ? pitchersList[existingIdx].currentAcwr : 1.15,
          avatarUrl: updatedUser.avatarUrl || '',
          email: updatedUser.email,
        };

        if (existingIdx >= 0) {
          pitchersList[existingIdx] = { ...pitchersList[existingIdx], ...userPitcher };
        } else {
          pitchersList = [userPitcher, ...pitchersList];
        }

        return {
          user: updatedUser,
          pitchers: pitchersList,
          sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
          romRecords: Array.isArray(parsed.romRecords) ? parsed.romRecords : [],
          videos: Array.isArray(parsed.videos) ? parsed.videos : [],
          dailyLogs: Array.isArray(parsed.dailyLogs) ? parsed.dailyLogs : [],
          pitchSequences: Array.isArray(parsed.pitchSequences) ? parsed.pitchSequences : [],
          goalRoadmap: parsed.goalRoadmap || { ...INITIAL_GOAL_ROADMAP, pitcherId: updatedUser.id },
          trainingSchedules: Array.isArray(parsed.trainingSchedules) ? parsed.trainingSchedules : [],
          autoArchivePassedSchedules: typeof parsed.autoArchivePassedSchedules === 'boolean' ? parsed.autoArchivePassedSchedules : true,
        };
      }
    } catch (e) {
      console.error('Error parsing stored account data:', e);
    }
  }

  // Generate initial default data bound to user.id if key does not exist
  const initialUserPitcher: Pitcher = {
    id: user.id,
    name: user.name || '투수',
    number: typeof user.number === 'number' ? user.number : 18,
    team: user.team || 'Bullpen Stars',
    throwingArm: user.throwingArm || 'RHP',
    role: user.role || '미정 (Unassigned)',
    age: user.age || 24,
    birthdate: user.birthdate,
    heightWeight: user.height && user.weight ? `${user.height}cm / ${user.weight}kg` : '185cm / 84kg',
    height: user.height || 185,
    weight: user.weight || 84,
    wingspan: user.wingspan || 190,
    maxVelocity: user.maxVelocity || 151,
    currentAcwr: 1.15,
    avatarUrl: user.avatarUrl || '',
    email: user.email,
  };

  const initialSessions = INITIAL_SESSIONS.map((s) => (s.pitcherId === 'p1' ? { ...s, pitcherId: user.id } : s));
  const initialRomRecords = INITIAL_ROM_RECORDS.map((r) => (r.pitcherId === 'p1' ? { ...r, pitcherId: user.id } : r));
  const initialVideos = INITIAL_VIDEOS.map((v) => (v.pitcherId === 'p1' ? { ...v, pitcherId: user.id } : v));
  const initialDailyLogs = INITIAL_DAILY_LOGS.map((l) => (l.pitcherId === 'p1' ? { ...l, pitcherId: user.id } : l));
  const initialPitchSequences = INITIAL_PITCH_SEQUENCES.map((ps) => (ps.pitcherId === 'p1' ? { ...ps, pitcherId: user.id } : ps));
  const initialRoadmap: GoalRoadmap = {
    ...INITIAL_GOAL_ROADMAP,
    pitcherId: user.id,
    targetVelocity: user.maxVelocity ? Math.round(user.maxVelocity + 4) : 155,
    currentVelocity: user.maxVelocity || 151,
    targetWeight: user.weight ? user.weight + 3 : 88,
    currentWeight: user.weight || 84,
  };
  const initialSchedules = INITIAL_TRAINING_SCHEDULES.map((ts) => (ts.pitcherId === 'p1' ? { ...ts, pitcherId: user.id } : ts));

  const accountData = {
    user,
    pitchers: [initialUserPitcher, ...INITIAL_PITCHERS.filter((p) => p.id !== 'p1')],
    sessions: initialSessions,
    romRecords: initialRomRecords,
    videos: initialVideos,
    dailyLogs: initialDailyLogs,
    pitchSequences: initialPitchSequences,
    goalRoadmap: initialRoadmap,
    trainingSchedules: initialSchedules,
    autoArchivePassedSchedules: true,
  };

  try {
    localStorage.setItem(key, JSON.stringify(accountData));
  } catch (e) {
    console.error('Error saving new initial account data:', e);
  }

  return accountData;
}

export default function App() {
  // User Account state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('bullpen_user_account');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  // Load account data if currentUser is present on initial mount
  const initialAccountData = currentUser ? loadAccountData(currentUser) : null;

  // Pitchers state
  const [pitchers, setPitchers] = useState<Pitcher[]>(() => {
    if (initialAccountData) return initialAccountData.pitchers;
    const saved = localStorage.getItem('bullpen_pitchers');
    return saved ? JSON.parse(saved) : INITIAL_PITCHERS;
  });

  const [selectedPitcherId, setSelectedPitcherId] = useState<string>(() => {
    return currentUser ? currentUser.id : 'p1';
  });

  // Auth & Profile Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<PitchSession[]>(() => {
    if (initialAccountData) return initialAccountData.sessions;
    const saved = localStorage.getItem('bullpen_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  // ROM state
  const [romRecords, setRomRecords] = useState<ROMRecord[]>(() => {
    if (initialAccountData) return initialAccountData.romRecords;
    const saved = localStorage.getItem('bullpen_rom_records');
    return saved ? JSON.parse(saved) : INITIAL_ROM_RECORDS;
  });

  // Videos state
  const [videos, setVideos] = useState<PitchVideo[]>(() => {
    if (initialAccountData) return initialAccountData.videos;
    const saved = localStorage.getItem('bullpen_videos');
    return saved ? JSON.parse(saved) : INITIAL_VIDEOS;
  });

  // Daily Logs state
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    if (initialAccountData) return initialAccountData.dailyLogs;
    const saved = localStorage.getItem('bullpen_daily_logs');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_LOGS;
  });

  // Pitch Sequences state
  const [pitchSequences, setPitchSequences] = useState<PitchSequence[]>(() => {
    if (initialAccountData) return initialAccountData.pitchSequences;
    const saved = localStorage.getItem('bullpen_pitch_sequences');
    return saved ? JSON.parse(saved) : INITIAL_PITCH_SEQUENCES;
  });

  // Goal Roadmap state
  const [goalRoadmap, setGoalRoadmap] = useState<GoalRoadmap>(() => {
    if (initialAccountData) return initialAccountData.goalRoadmap;
    const saved = localStorage.getItem('bullpen_goal_roadmap');
    return saved ? JSON.parse(saved) : INITIAL_GOAL_ROADMAP;
  });

  // Training Schedules state
  const [trainingSchedules, setTrainingSchedules] = useState<TrainingScheduleItem[]>(() => {
    if (initialAccountData) return initialAccountData.trainingSchedules;
    const saved = localStorage.getItem('bullpen_training_schedules');
    return saved ? JSON.parse(saved) : INITIAL_TRAINING_SCHEDULES;
  });

  // Auto-Archive passed schedules setting state
  const [autoArchivePassedSchedules, setAutoArchivePassedSchedules] = useState<boolean>(() => {
    if (initialAccountData) return initialAccountData.autoArchivePassedSchedules;
    const saved = localStorage.getItem('bullpen_auto_archive');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Active Tab View State
  const [activeTab, setActiveTab] = useState<string>('hero');

  // Logger Modal State
  const [isLoggerOpen, setIsLoggerOpen] = useState<boolean>(false);

  // Auto-save account data whenever active state or logged-in user updates
  useEffect(() => {
    if (currentUser && currentUser.email) {
      const key = `bullpen_account_data_${currentUser.email.trim().toLowerCase()}`;
      const accountData = {
        user: currentUser,
        pitchers,
        sessions,
        romRecords,
        videos,
        dailyLogs,
        pitchSequences,
        goalRoadmap,
        trainingSchedules,
        autoArchivePassedSchedules,
      };
      try {
        localStorage.setItem(key, JSON.stringify(accountData));
        localStorage.setItem('bullpen_user_account', JSON.stringify(currentUser));
        const regKey = `registered_user_${currentUser.email.trim().toLowerCase()}`;
        const rawReg = localStorage.getItem(regKey);
        if (rawReg) {
          const regObj = JSON.parse(rawReg);
          regObj.userData = currentUser;
          localStorage.setItem(regKey, JSON.stringify(regObj));
        }
      } catch (e) {
        console.error('Error auto-saving account data:', e);
      }
    }
  }, [
    currentUser,
    pitchers,
    sessions,
    romRecords,
    videos,
    dailyLogs,
    pitchSequences,
    goalRoadmap,
    trainingSchedules,
    autoArchivePassedSchedules,
  ]);

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
    const accData = loadAccountData(user);
    if (accData) {
      setCurrentUser(accData.user);
      setPitchers(accData.pitchers);
      setSelectedPitcherId(accData.user.id);
      setSessions(accData.sessions);
      setRomRecords(accData.romRecords);
      setVideos(accData.videos);
      setDailyLogs(accData.dailyLogs);
      setPitchSequences(accData.pitchSequences);
      setGoalRoadmap(accData.goalRoadmap);
      setTrainingSchedules(accData.trainingSchedules);
      setAutoArchivePassedSchedules(accData.autoArchivePassedSchedules);
      localStorage.setItem('bullpen_user_account', JSON.stringify(accData.user));
    } else {
      setCurrentUser(user);
    }
    setActiveTab('dashboard');
  };

  const handleUpdateProfile = async (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);

    setPitchers((prev) => {
      const existingIdx = prev.findIndex(
        (p) => p.id === updatedUser.id || (p.email && p.email.toLowerCase() === updatedUser.email.toLowerCase())
      );
      const updatedPitcher: Pitcher = {
        id: updatedUser.id,
        name: updatedUser.name,
        number: updatedUser.number,
        team: updatedUser.team,
        throwingArm: updatedUser.throwingArm,
        role: updatedUser.role || '미정 (Unassigned)',
        age: updatedUser.age || 24,
        birthdate: updatedUser.birthdate,
        heightWeight: updatedUser.height && updatedUser.weight ? `${updatedUser.height}cm / ${updatedUser.weight}kg` : '185cm / 84kg',
        height: updatedUser.height,
        weight: updatedUser.weight,
        wingspan: updatedUser.wingspan,
        maxVelocity: updatedUser.maxVelocity || 151,
        currentAcwr: existingIdx >= 0 ? prev[existingIdx].currentAcwr : 1.15,
        avatarUrl: updatedUser.avatarUrl || '',
        email: updatedUser.email,
      };

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], ...updatedPitcher };
        return next;
      }
      return [updatedPitcher, ...prev];
    });

    try {
      const regKey = `registered_user_${updatedUser.email.trim().toLowerCase()}`;
      const rawReg = localStorage.getItem(regKey);
      if (rawReg) {
        const regObj = JSON.parse(rawReg);
        regObj.userData = updatedUser;
        localStorage.setItem(regKey, JSON.stringify(regObj));
      }
    } catch (e) {
      console.error('Failed to update local reg record:', e);
    }

    localStorage.setItem('bullpen_user_account', JSON.stringify(updatedUser));

    // Sync with Supabase Auth user metadata & profile table if available
    try {
      await supabase.auth.updateUser({
        data: {
          name: updatedUser.name,
          number: updatedUser.number,
          team: updatedUser.team,
          throwingArm: updatedUser.throwingArm,
          role: updatedUser.role,
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
        role: updatedUser.role,
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
    localStorage.removeItem('bullpen_user_account');
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
        role: currentUser.role || '미정 (Unassigned)',
        age: currentUser.age || 24,
        birthdate: currentUser.birthdate,
        heightWeight: currentUser.height && currentUser.weight
          ? `${currentUser.height}cm / ${currentUser.weight}kg`
          : '185cm / 84kg',
        height: currentUser.height || 185,
        weight: currentUser.weight || 84,
        wingspan: currentUser.wingspan || 190,
        maxVelocity: currentUser.maxVelocity || 151,
        currentAcwr: pitchers.find((p) => p.id === currentUser.id)?.currentAcwr || 1.15,
        avatarUrl: currentUser.avatarUrl || pitchers.find((p) => p.id === currentUser.id)?.avatarUrl || '',
        email: currentUser.email,
      }
    : (pitchers.find((p) => p.id === selectedPitcherId) || pitchers[0] || INITIAL_PITCHERS[0]);

  // Handler to save new pitching session (Auto-syncs across Pitchers, DailyLogs, Schedules, Roadmap)
  const handleSaveSession = (newSessionData: Omit<PitchSession, 'id'>) => {
    const newSession: PitchSession = {
      ...newSessionData,
      id: `session-${Date.now()}`,
    };

    setSessions((prev) => [newSession, ...prev]);

    // 1. Sync ACWR & Max Velocity for Pitcher & User Account & Roadmap
    setPitchers((prev) =>
      prev.map((p) => {
        if (p.id === newSessionData.pitcherId) {
          return {
            ...p,
            currentAcwr: newSessionData.acwrImpact || p.currentAcwr,
            maxVelocity: Math.max(p.maxVelocity || 0, newSessionData.maxVel || 0),
          };
        }
        return p;
      })
    );

    if (currentUser && currentUser.id === newSessionData.pitcherId && newSessionData.maxVel > (currentUser.maxVelocity || 0)) {
      handleUpdateProfile({ ...currentUser, maxVelocity: newSessionData.maxVel });
    }

    setGoalRoadmap((prev) => {
      if (prev.pitcherId === newSessionData.pitcherId && newSessionData.maxVel > prev.currentVelocity) {
        return { ...prev, currentVelocity: newSessionData.maxVel };
      }
      return prev;
    });

    // 2. Auto-sync to Daily Logs
    setDailyLogs((prev) => {
      const existingIdx = prev.findIndex(
        (l) => l.pitcherId === newSessionData.pitcherId && l.date === newSessionData.date
      );
      const sessionNote = `⚾ [피칭 세션 자동 연동] ${newSessionData.sessionType} ${newSessionData.totalPitches}구 완료 (최고 ${newSessionData.maxVel}km/h) ${newSessionData.notes || ''}`;

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const next = [...prev];
        next[existingIdx] = {
          ...existing,
          trainingType: existing.trainingType || (newSessionData.sessionType === 'GAME' ? 'GAME' : 'BULLPEN'),
          diary: existing.diary ? `${existing.diary}\n${sessionNote}` : sessionNote,
        };
        return next;
      } else {
        const newLog: DailyLog = {
          id: `daily-auto-${Date.now()}`,
          pitcherId: newSessionData.pitcherId,
          date: newSessionData.date,
          trainingType: newSessionData.sessionType === 'GAME' ? 'GAME' : 'BULLPEN',
          painScore: newSessionData.armSoreness ? 4 : 0,
          painLocation: newSessionData.sorenessLocation || '',
          sleepHours: 8,
          sleepQuality: 'GOOD',
          diary: sessionNote,
          routines: [
            { id: 'r1', title: '불펜/경기 후 아이싱 및 어깨 보강', category: 'RECOVERY', completed: true },
          ],
          weightVolumeKg: 0,
        };
        return [newLog, ...prev];
      }
    });

    // 3. Auto-sync to Training Schedules
    setTrainingSchedules((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.pitcherId === newSessionData.pitcherId && s.date === newSessionData.date && (s.category === 'BULLPEN' || s.category === 'TACTICAL')
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], completed: true };
        return next;
      } else {
        const newSched: TrainingScheduleItem = {
          id: `sched-auto-${Date.now()}`,
          pitcherId: newSessionData.pitcherId,
          date: newSessionData.date,
          time: '14:00',
          category: 'BULLPEN',
          title: `⚾ [자동 기록] ${newSessionData.sessionType} ${newSessionData.totalPitches}구 피칭`,
          intensity: 'HIGH',
          details: `최고 ${newSessionData.maxVel}km/h, RPE ${newSessionData.rpe}`,
          durationMinutes: 45,
          completed: true,
        };
        return [newSched, ...prev];
      }
    });
  };

  // Handler to delete session
  const handleDeleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  // Handler to add ROM record (Auto-syncs with DailyLog & Recovery Schedule)
  const handleAddROMRecord = (newRomData: Omit<ROMRecord, 'id'>) => {
    const newRom: ROMRecord = {
      ...newRomData,
      id: `rom-${Date.now()}`,
    };
    setRomRecords((prev) => [newRom, ...prev]);

    // Auto-sync to Daily Log
    setDailyLogs((prev) => {
      const existingIdx = prev.findIndex(
        (l) => l.pitcherId === newRomData.pitcherId && l.date === newRomData.date
      );
      const romNote = `🏥 [어깨 ROM 검사 자동 연동] 굴곡/신전/회전 측정 완료 (통증 ${newRomData.painScore}/10 - ${newRomData.painLocation || '이상 없음'})`;

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const next = [...prev];
        next[existingIdx] = {
          ...existing,
          painScore: newRomData.painScore,
          painLocation: newRomData.painLocation || existing.painLocation,
          diary: existing.diary ? `${existing.diary}\n${romNote}` : romNote,
        };
        return next;
      } else {
        const newLog: DailyLog = {
          id: `daily-auto-${Date.now()}`,
          pitcherId: newRomData.pitcherId,
          date: newRomData.date,
          trainingType: 'REHAB',
          painScore: newRomData.painScore,
          painLocation: newRomData.painLocation || '',
          sleepHours: 8,
          sleepQuality: 'GOOD',
          diary: romNote,
          routines: [
            { id: 'r1', title: '어깨 회전근개 가동성 모니터링', category: 'ARM_CARE', completed: true },
          ],
          weightVolumeKg: 0,
        };
        return [newLog, ...prev];
      }
    });

    // Auto-sync to Training Schedules
    setTrainingSchedules((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.pitcherId === newRomData.pitcherId && s.date === newRomData.date && (s.category === 'RECOVERY' || s.category === 'REST')
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], completed: true };
        return next;
      } else {
        const newSched: TrainingScheduleItem = {
          id: `sched-auto-${Date.now()}`,
          pitcherId: newRomData.pitcherId,
          date: newRomData.date,
          time: '10:00',
          category: 'RECOVERY',
          title: `🏥 [자동 기록] 어깨 가동범위(ROM) 측정 완료`,
          intensity: 'LOW',
          details: `통증 ${newRomData.painScore}/10`,
          durationMinutes: 20,
          completed: true,
        };
        return [newSched, ...prev];
      }
    });
  };

  // Handler to add Video (Auto-syncs across PitchSessions, Pitchers, DailyLogs, Schedules, Roadmap)
  const handleAddVideo = (newVideoData: Omit<PitchVideo, 'id'>) => {
    const newVideo: PitchVideo = {
      ...newVideoData,
      id: `video-${Date.now()}`,
    };

    setVideos((prev) => [newVideo, ...prev]);

    // 1. Sync Pitcher Max Velocity & Profile & Roadmap
    if (newVideo.velocity > 0) {
      setPitchers((prev) =>
        prev.map((p) =>
          p.id === newVideo.pitcherId
            ? { ...p, maxVelocity: Math.max(p.maxVelocity || 0, newVideo.velocity) }
            : p
        )
      );
      if (currentUser && currentUser.id === newVideo.pitcherId) {
        if (newVideo.velocity > (currentUser.maxVelocity || 0)) {
          handleUpdateProfile({ ...currentUser, maxVelocity: newVideo.velocity });
        }
      }
      setGoalRoadmap((prev) => {
        if (prev.pitcherId === newVideo.pitcherId && newVideo.velocity > prev.currentVelocity) {
          return { ...prev, currentVelocity: newVideo.velocity };
        }
        return prev;
      });
    }

    // 2. Auto-sync to Pitch Sessions (투구 기록 시스템)
    setSessions((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.pitcherId === newVideo.pitcherId && s.date === newVideo.date
      );

      const typeKey = (newVideo.pitchType || '').toLowerCase();
      const isFastball = typeKey.includes('포심') || typeKey.includes('직구') || typeKey.includes('fastball');
      const isSlider = typeKey.includes('슬라이더') || typeKey.includes('slider');
      const isCurve = typeKey.includes('커브') || typeKey.includes('curve');
      const isChangeup = typeKey.includes('체인지업') || typeKey.includes('changeup');
      const isCutter = typeKey.includes('커터') || typeKey.includes('cutter');

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const newTotalPitches = existing.totalPitches + 1;
        const newMaxVel = Math.max(existing.maxVel, newVideo.velocity || 0);
        const newAvgVel = Math.round(
          (existing.avgVel * existing.totalPitches + (newVideo.velocity || 0)) / newTotalPitches
        );

        const updatedSession: PitchSession = {
          ...existing,
          totalPitches: newTotalPitches,
          fastballCount: existing.fastballCount + (isFastball ? 1 : 0),
          sliderCount: existing.sliderCount + (isSlider ? 1 : 0),
          curveballCount: existing.curveballCount + (isCurve ? 1 : 0),
          changeupCount: existing.changeupCount + (isChangeup ? 1 : 0),
          cutterCount: existing.cutterCount + (isCutter ? 1 : 0),
          maxVel: newMaxVel,
          avgVel: newAvgVel,
          notes: existing.notes
            ? `${existing.notes} | 🎥 [투구 영상 연동] ${newVideo.title}`
            : `🎥 [투구 영상 연동] ${newVideo.title}`,
        };

        const next = [...prev];
        next[existingIdx] = updatedSession;
        return next;
      } else {
        const targetPitcher = pitchers.find((p) => p.id === newVideo.pitcherId);
        const newSession: PitchSession = {
          id: `session-auto-${Date.now()}`,
          pitcherId: newVideo.pitcherId,
          date: newVideo.date,
          sessionType: 'BULLPEN',
          totalPitches: 1,
          fastballCount: isFastball ? 1 : 0,
          sliderCount: isSlider ? 1 : 0,
          curveballCount: isCurve ? 1 : 0,
          changeupCount: isChangeup ? 1 : 0,
          cutterCount: isCutter ? 1 : 0,
          maxVel: newVideo.velocity || 145,
          avgVel: newVideo.velocity || 145,
          rpe: 7,
          fatigue: 4,
          armSoreness: false,
          notes: `🎥 [투구 영상 자동 연동] ${newVideo.title} (${newVideo.pitchType} ${newVideo.velocity}km/h)`,
          acwrImpact: parseFloat(
            ((targetPitcher?.currentAcwr || 1.15) + 0.02).toFixed(2)
          ),
        };
        return [newSession, ...prev];
      }
    });

    // 3. Auto-sync to Daily Log
    setDailyLogs((prev) => {
      const existingIdx = prev.findIndex(
        (l) => l.pitcherId === newVideo.pitcherId && l.date === newVideo.date
      );
      const vidNote = `🎥 [투구 영상 자동 연동] ${newVideo.title} (${newVideo.pitchType} ${newVideo.velocity}km/h)`;

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const next = [...prev];
        next[existingIdx] = {
          ...existing,
          diary: existing.diary ? `${existing.diary}\n${vidNote}` : vidNote,
        };
        return next;
      } else {
        const newLog: DailyLog = {
          id: `daily-auto-${Date.now()}`,
          pitcherId: newVideo.pitcherId,
          date: newVideo.date,
          trainingType: 'BULLPEN',
          painScore: 0,
          sleepHours: 8,
          sleepQuality: 'GOOD',
          diary: vidNote,
          routines: [
            { id: 'r1', title: '투구 모션 영상 촬영 및 스피드 분석', category: 'ARM_CARE', completed: true },
          ],
          weightVolumeKg: 0,
        };
        return [newLog, ...prev];
      }
    });

    // 4. Auto-sync to Training Schedules
    setTrainingSchedules((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.pitcherId === newVideo.pitcherId && s.date === newVideo.date && s.category === 'BULLPEN'
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], completed: true };
        return next;
      } else {
        const newSched: TrainingScheduleItem = {
          id: `sched-auto-${Date.now()}`,
          pitcherId: newVideo.pitcherId,
          date: newVideo.date,
          time: '15:00',
          category: 'BULLPEN',
          title: `🎥 [자동 기록] ${newVideo.title} 투구 영상 분석`,
          intensity: 'HIGH',
          details: `${newVideo.pitchType} ${newVideo.velocity}km/h 영상 저장`,
          durationMinutes: 30,
          completed: true,
        };
        return [newSched, ...prev];
      }
    });
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

    // Auto-sync schedule items for that day if completed routines exist
    if (updatedLog.routines && updatedLog.routines.some((r) => r.completed)) {
      setTrainingSchedules((prev) =>
        prev.map((s) => {
          if (s.pitcherId === updatedLog.pitcherId && s.date === updatedLog.date) {
            return { ...s, completed: true };
          }
          return s;
        })
      );
    }
  };

  // Handler to add PitchSequence (Auto-syncs across Pitchers, PitchSessions, DailyLogs, Schedules)
  const handleAddPitchSequence = (seqData: Omit<PitchSequence, 'id'>) => {
    const newSeq: PitchSequence = {
      ...seqData,
      id: `seq-${Date.now()}`,
    };
    setPitchSequences((prev) => [newSeq, ...prev]);

    // 1. Sync Max Velocity
    if (seqData.velocity > 0) {
      setPitchers((prev) =>
        prev.map((p) =>
          p.id === seqData.pitcherId
            ? { ...p, maxVelocity: Math.max(p.maxVelocity || 0, seqData.velocity) }
            : p
        )
      );
      if (currentUser && currentUser.id === seqData.pitcherId && seqData.velocity > (currentUser.maxVelocity || 0)) {
        handleUpdateProfile({ ...currentUser, maxVelocity: seqData.velocity });
      }
      setGoalRoadmap((prev) => {
        if (prev.pitcherId === seqData.pitcherId && seqData.velocity > prev.currentVelocity) {
          return { ...prev, currentVelocity: seqData.velocity };
        }
        return prev;
      });
    }

    // 2. Auto-sync to Pitch Session
    setSessions((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.pitcherId === seqData.pitcherId && s.date === seqData.date
      );

      const typeKey = (seqData.pitchType || '').toLowerCase();
      const isFastball = typeKey.includes('포심') || typeKey.includes('직구') || typeKey.includes('fastball');
      const isSlider = typeKey.includes('슬라이더') || typeKey.includes('slider');
      const isCurve = typeKey.includes('커브') || typeKey.includes('curve');
      const isChangeup = typeKey.includes('체인지업') || typeKey.includes('changeup');
      const isCutter = typeKey.includes('커터') || typeKey.includes('cutter');

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const newTotal = existing.totalPitches + 1;
        const newMax = Math.max(existing.maxVel, seqData.velocity || 0);
        const newAvg = Math.round((existing.avgVel * existing.totalPitches + (seqData.velocity || 0)) / newTotal);

        const next = [...prev];
        next[existingIdx] = {
          ...existing,
          totalPitches: newTotal,
          fastballCount: existing.fastballCount + (isFastball ? 1 : 0),
          sliderCount: existing.sliderCount + (isSlider ? 1 : 0),
          curveballCount: existing.curveballCount + (isCurve ? 1 : 0),
          changeupCount: existing.changeupCount + (isChangeup ? 1 : 0),
          cutterCount: existing.cutterCount + (isCutter ? 1 : 0),
          maxVel: newMax,
          avgVel: newAvg,
          notes: existing.notes
            ? `${existing.notes} | 🎯 [구종 기록 연동] vs ${seqData.opponent}`
            : `🎯 [구종 기록 연동] vs ${seqData.opponent}`,
        };
        return next;
      } else {
        const targetPitcher = pitchers.find((p) => p.id === seqData.pitcherId);
        const newSession: PitchSession = {
          id: `session-auto-${Date.now()}`,
          pitcherId: seqData.pitcherId,
          date: seqData.date,
          sessionType: 'GAME',
          totalPitches: 1,
          fastballCount: isFastball ? 1 : 0,
          sliderCount: isSlider ? 1 : 0,
          curveballCount: isCurve ? 1 : 0,
          changeupCount: isChangeup ? 1 : 0,
          cutterCount: isCutter ? 1 : 0,
          maxVel: seqData.velocity || 145,
          avgVel: seqData.velocity || 145,
          rpe: 8,
          fatigue: 5,
          armSoreness: false,
          notes: `🎯 [실전 경기 구종 자동 연동] vs ${seqData.opponent} (${seqData.batter} 타자) - ${seqData.pitchType} ${seqData.velocity}km/h`,
          acwrImpact: parseFloat(
            ((targetPitcher?.currentAcwr || 1.15) + 0.03).toFixed(2)
          ),
        };
        return [newSession, ...prev];
      }
    });

    // 3. Auto-sync to Daily Log
    setDailyLogs((prev) => {
      const existingIdx = prev.findIndex(
        (l) => l.pitcherId === seqData.pitcherId && l.date === seqData.date
      );
      const seqNote = `🎯 [실전 피칭 기록 연동] vs ${seqData.opponent} (${seqData.inning}회말 ${seqData.batter} 타자): ${seqData.pitchType} ${seqData.velocity}km/h (${seqData.result})`;

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const next = [...prev];
        next[existingIdx] = {
          ...existing,
          trainingType: 'GAME',
          diary: existing.diary ? `${existing.diary}\n${seqNote}` : seqNote,
        };
        return next;
      } else {
        const newLog: DailyLog = {
          id: `daily-auto-${Date.now()}`,
          pitcherId: seqData.pitcherId,
          date: seqData.date,
          trainingType: 'GAME',
          painScore: 0,
          sleepHours: 8,
          sleepQuality: 'GOOD',
          diary: seqNote,
          routines: [],
          weightVolumeKg: 0,
        };
        return [newLog, ...prev];
      }
    });

    // 4. Auto-sync to Training Schedules
    setTrainingSchedules((prev) => {
      const existingIdx = prev.findIndex(
        (s) => s.pitcherId === seqData.pitcherId && s.date === seqData.date && (s.category === 'TACTICAL' || s.category === 'BULLPEN')
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], completed: true };
        return next;
      } else {
        const newSched: TrainingScheduleItem = {
          id: `sched-auto-${Date.now()}`,
          pitcherId: seqData.pitcherId,
          date: seqData.date,
          time: '18:00',
          category: 'TACTICAL',
          title: `🎯 [자동 기록] vs ${seqData.opponent} 실전 경기 피칭`,
          intensity: 'HIGH',
          details: `${seqData.batter} 타자상대 ${seqData.pitchType} ${seqData.velocity}km/h`,
          durationMinutes: 120,
          completed: true,
        };
        return [newSched, ...prev];
      }
    });
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

  // Handler to toggle Training Schedule completion with DailyLog Auto-Sync
  const handleToggleScheduleCompleted = (scheduleId: string) => {
    setTrainingSchedules((prev) => {
      const target = prev.find((s) => s.id === scheduleId);
      if (target) {
        const newCompleted = !target.completed;
        if (newCompleted) {
          setDailyLogs((dPrev) => {
            const existingIdx = dPrev.findIndex(
              (l) => l.pitcherId === target.pitcherId && l.date === target.date
            );
            const schedNote = `📅 [일정 완료 연동] ${target.title}`;
            if (existingIdx >= 0) {
              const existing = dPrev[existingIdx];
              if (!existing.diary.includes(target.title)) {
                const next = [...dPrev];
                next[existingIdx] = {
                  ...existing,
                  diary: existing.diary ? `${existing.diary}\n${schedNote}` : schedNote,
                };
                return next;
              }
            }
            return dPrev;
          });
        }
      }
      return prev.map((s) => (s.id === scheduleId ? { ...s, completed: !s.completed } : s));
    });
  };

  // Global Save All Records Handler
  const [saveToastMessage, setSaveToastMessage] = useState<string | null>(null);

  const handleSaveAllRecords = () => {
    try {
      const accountData = {
        user: currentUser,
        pitchers,
        sessions,
        romRecords,
        videos,
        dailyLogs,
        pitchSequences,
        goalRoadmap,
        trainingSchedules,
        autoArchivePassedSchedules,
        lastSavedAt: new Date().toLocaleString('ko-KR'),
      };

      if (currentUser && currentUser.email) {
        const key = `bullpen_account_data_${currentUser.email.trim().toLowerCase()}`;
        localStorage.setItem(key, JSON.stringify(accountData));
        localStorage.setItem('bullpen_user_account', JSON.stringify(currentUser));
      }

      localStorage.setItem('bullpen_pitchers', JSON.stringify(pitchers));
      localStorage.setItem('bullpen_sessions', JSON.stringify(sessions));
      localStorage.setItem('bullpen_rom_records', JSON.stringify(romRecords));
      localStorage.setItem('bullpen_videos', JSON.stringify(videos));
      localStorage.setItem('bullpen_daily_logs', JSON.stringify(dailyLogs));
      localStorage.setItem('bullpen_pitch_sequences', JSON.stringify(pitchSequences));
      localStorage.setItem('bullpen_goal_roadmap', JSON.stringify(goalRoadmap));
      localStorage.setItem('bullpen_training_schedules', JSON.stringify(trainingSchedules));

      setSaveToastMessage('💾 모든 피칭, 훈련 스케줄, 가동범위 및 영상 기록이 안전하게 저장되었습니다!');
      setTimeout(() => {
        setSaveToastMessage(null);
      }, 4000);
    } catch (err) {
      console.error('Error saving records:', err);
      setSaveToastMessage('⚠️ 기록 저장 중 오류가 발생했습니다.');
      setTimeout(() => {
        setSaveToastMessage(null);
      }, 3000);
    }
  };

  // Scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans antialiased">
      {/* Save All Toast Alert Notification */}
      <AnimatePresence>
        {saveToastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[99999] bg-emerald-950/90 border-2 border-emerald-500 text-white px-5 py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center gap-3 backdrop-blur-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-black text-emerald-300">저장 완료</span>
              <span className="text-xs font-bold text-white">{saveToastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        onSaveAllRecords={handleSaveAllRecords}
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
                schedules={trainingSchedules}
                dailyLogs={dailyLogs}
                videos={videos}
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
                videos={videos}
                onAddVideo={handleAddVideo}
                onOpenVideoArchive={() => setActiveTab('video')}
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
