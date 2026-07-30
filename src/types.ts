export type PitchSessionType = 'BULLPEN' | 'GAME' | 'LIVE_BP' | 'CATCH' | 'PLYO';

export interface Pitcher {
  id: string;
  name: string;
  number: number;
  team: string;
  throwingArm: 'RHP' | 'LHP'; // 우투 / 좌투
  role: '선발 (SP)' | '구원 (RP)' | '마무리 (CP)';
  age: number;
  heightWeight: string;
  maxVelocity: number;
  currentAcwr: number;
  avatarUrl?: string;
  email?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  number: number;
  team: string;
  throwingArm: 'RHP' | 'LHP';
  role: '선발 (SP)' | '구원 (RP)' | '마무리 (CP)';
  joinedDate: string;
  maxVelocity?: number;
}

export interface PitchSession {
  id: string;
  pitcherId: string;
  date: string;
  sessionType: PitchSessionType;
  totalPitches: number;
  fastballCount: number;
  sliderCount: number;
  curveballCount: number;
  changeupCount: number;
  cutterCount: number;
  maxVel: number; // km/h
  avgVel: number; // km/h
  rpe: number; // 1-10
  fatigue: number; // 1-10
  armSoreness: boolean;
  sorenessLocation?: string;
  notes?: string;
  acwrImpact?: number;
}

export interface ROMRecord {
  id: string;
  pitcherId: string;
  date: string;
  shoulderFlexion: number; // normal ~170-180
  shoulderExtension: number; // normal ~50-60
  shoulderIntRotation: number; // normal ~50-60 (GIRD check)
  shoulderExtRotation: number; // normal ~90-110
  elbowFlexion: number; // normal ~140-150
  elbowExtension: number; // normal ~0
  painScore: number; // 0-10
  painLocation: string;
  testerNotes?: string;
}

export interface PitchVideo {
  id: string;
  pitcherId: string;
  title: string;
  date: string;
  videoUrl: string;
  pitchType: string;
  velocity: number;
  cameraAngle: 'Behind Mound' | 'Side View' | 'High Home' | 'Slow-Mo 240fps';
  notes: string;
}

export interface RecommendedDay {
  day: string;
  title: string;
  pitchCap: number;
  focus: string;
}

export interface ArmCareExercise {
  name: string;
  setsReps: string;
  targetArea: string;
  description: string;
}

export interface AIReportData {
  riskStatus: 'SAFE' | 'CAUTION' | 'DANGER';
  riskScore: number;
  headline: string;
  acwrEvaluation: string;
  biomechanicsInsight: string;
  recommendedProgram: RecommendedDay[];
  armCareExercises: ArmCareExercise[];
  nutritionAndRecovery: string[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface RoutineItem {
  id: string;
  title: string;
  category: 'ARM_CARE' | 'STRETCH' | 'NUTRITION' | 'RECOVERY';
  completed: boolean;
}

export interface DailyLog {
  id: string;
  pitcherId: string;
  date: string;
  trainingType: 'GAME' | 'BULLPEN' | 'WEIGHT' | 'REHAB' | 'REST';
  painScore: number; // 0-10
  painLocation?: string;
  sleepHours: number;
  sleepQuality: 'GREAT' | 'GOOD' | 'FAIR' | 'POOR';
  diary: string;
  routines: RoutineItem[];
  weightVolumeKg: number;
}

export interface PitchSequence {
  id: string;
  pitcherId: string;
  date: string;
  opponent: string;
  inning: number;
  batter: string;
  ballCount: string; // e.g. "2-1"
  pitchType: string;
  velocity: number;
  result: 'STRIKE_SWINGING' | 'STRIKE_CALLED' | 'BALL' | 'FOUL' | 'IN_PLAY_OUT' | 'IN_PLAY_HIT';
}

export interface GoalRoadmap {
  pitcherId: string;
  targetVelocity: number;
  currentVelocity: number;
  targetWeight: number;
  currentWeight: number;
  targetDate: string;
  phases: {
    id: string;
    phaseName: string;
    duration: string;
    focus: string;
    isCompleted: boolean;
  }[];
}

