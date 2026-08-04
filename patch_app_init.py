import sys
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove initial state values from useState hooks
state_hooks = [
    ("pitchers, setPitchers", "INITIAL_PITCHERS", "[]"),
    ("sessions, setSessions", "INITIAL_SESSIONS", "[]"),
    ("romRecords, setRomRecords", "INITIAL_ROM_RECORDS", "[]"),
    ("videos, setVideos", "INITIAL_VIDEOS", "[]"),
    ("dailyLogs, setDailyLogs", "INITIAL_DAILY_LOGS", "[]"),
    ("pitchSequences, setPitchSequences", "INITIAL_PITCH_SEQUENCES", "[]"),
    ("trainingSchedules, setTrainingSchedules", "INITIAL_TRAINING_SCHEDULES", "[]")
]

for hook_name, initial_const, empty_val in state_hooks:
    pattern = r"const \[" + hook_name + r"\] = useState<[^>]+>\(\(\) => \{[\s\S]*?\}\);"
    replacement = f"const [{hook_name}] = useState<any>({empty_val});"
    content = re.sub(pattern, replacement, content)

# 2. Fix GoalRoadmap
roadmap_pattern = r"const \[goalRoadmap, setGoalRoadmap\] = useState<GoalRoadmap>\(\(\) => \{[\s\S]*?\}\);"
content = re.sub(roadmap_pattern, "const [goalRoadmap, setGoalRoadmap] = useState<GoalRoadmap | null>(null);", content)

# 3. Add fetching logic on auth success
old_login = """  const handleLoginSuccess = (user: UserAccount, isNewUser?: boolean) => {
    if (authMode === 'signup' || isNewUser) {
      setOnboardingUser(user);
      setShowOnboarding(true);
      return;
    }

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
  };"""

new_login = """  const loadDataFromServer = async (user: UserAccount) => {
    try {
      // Establish Server/Supabase as SSOT (Single Source of Truth)
      // Fetch from API instead of localStorage first to prevent race condition overwriting
      const res = await fetch(`/api/account/data/${encodeURIComponent(user.email)}`);
      const json = await res.json();
      
      if (json.success && json.accountData) {
        const { accountData: accData } = json;
        setPitchers(accData.pitchers || []);
        setSelectedPitcherId(user.id);
        setSessions(accData.sessions || []);
        setRomRecords(accData.romRecords || []);
        setVideos(accData.videos || []);
        setDailyLogs(accData.dailyLogs || []);
        setPitchSequences(accData.pitchSequences || []);
        setGoalRoadmap(accData.goalRoadmap || { ...INITIAL_GOAL_ROADMAP, pitcherId: user.id });
        setTrainingSchedules(accData.trainingSchedules || []);
        setAutoArchivePassedSchedules(accData.autoArchivePassedSchedules ?? true);
        return true;
      }
    } catch (err) {
      console.error('Failed to fetch from SSOT:', err);
    }
    
    return false;
  };

  const handleLoginSuccess = async (user: UserAccount, isNewUser?: boolean) => {
    if (authMode === 'signup' || isNewUser) {
      setOnboardingUser(user);
      setShowOnboarding(true);
      return;
    }

    setCurrentUser(user);
    
    // Fetch data from SSOT (Supabase / Server) FIRST
    const hasServerData = await loadDataFromServer(user);
    
    if (!hasServerData) {
      // Fallback only if server has no data at all
      const accData = loadAccountData(user);
      if (accData) {
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
        // Initialize with empty arrays instead of mock data
        setPitchers([]);
        setSessions([]);
        setRomRecords([]);
        setVideos([]);
        setDailyLogs([]);
        setPitchSequences([]);
        setGoalRoadmap({ ...INITIAL_GOAL_ROADMAP, pitcherId: user.id });
        setTrainingSchedules([]);
      }
    }
    setActiveTab('dashboard');
  };"""

content = content.replace(old_login, new_login)

with open('src/App.tsx', 'w') as f:
    f.write(content)

