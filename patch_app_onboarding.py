import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { AuthModal } from './components/AuthModal';", "import { AuthModal } from './components/AuthModal';\nimport { OnboardingFlow } from './components/OnboardingFlow';")

# Add state for onboarding
content = content.replace(
    "const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');",
    "const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');\n  const [showOnboarding, setShowOnboarding] = useState(false);\n  const [onboardingUser, setOnboardingUser] = useState<UserAccount | null>(null);"
)

# Modify handleLoginSuccess
old_login = """  const handleLoginSuccess = (user: UserAccount) => {
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
      setTrainingSchedules(accData.trainingSchedules);
      
      setUserToStore(accData.user);
    } else {
      setCurrentUser(user);
      setUserToStore(user);
    }
    setIsAuthModalOpen(false);
  };"""

new_login = """  const handleLoginSuccess = (user: UserAccount) => {
    if (authMode === 'signup') {
      setOnboardingUser(user);
      setShowOnboarding(true);
      setIsAuthModalOpen(false);
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
      setTrainingSchedules(accData.trainingSchedules);
      
      setUserToStore(accData.user);
    } else {
      setCurrentUser(user);
      setUserToStore(user);
    }
    setIsAuthModalOpen(false);
  };

  const handleOnboardingComplete = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setUserToStore(updatedUser);
    
    // Create initial data for new user
    const accData = loadAccountData(updatedUser);
    if (accData) {
      setPitchers(accData.pitchers);
      setSelectedPitcherId(accData.user.id);
    }
    
    setShowOnboarding(false);
    setOnboardingUser(null);
    setActiveTab('dashboard');
  };"""

content = content.replace(old_login, new_login)

# Add onboarding component to render
old_render = """      {/* Auth Modal (Login & Sign Up) */}"""
new_render = """      {showOnboarding && onboardingUser && (
        <OnboardingFlow 
          user={onboardingUser} 
          onComplete={handleOnboardingComplete} 
        />
      )}

      {/* Auth Modal (Login & Sign Up) */}"""
content = content.replace(old_render, new_render)

with open('src/App.tsx', 'w') as f:
    f.write(content)

