import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

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
      setGoalRoadmap(accData.goalRoadmap);
      setTrainingSchedules(accData.trainingSchedules);
      setAutoArchivePassedSchedules(accData.autoArchivePassedSchedules);
      localStorage.setItem('bullpen_user_account', JSON.stringify(accData.user));
    } else {
      setCurrentUser(user);
    }
    setActiveTab('dashboard');
  };"""

new_login = """  const handleLoginSuccess = (user: UserAccount, isNewUser?: boolean) => {
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

content = content.replace(old_login, new_login)

with open('src/App.tsx', 'w') as f:
    f.write(content)

