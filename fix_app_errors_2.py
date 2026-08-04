import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

onboarding_func = """
  const handleOnboardingComplete = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setUserToStore(updatedUser);
    
    // Create initial data for new user
    const accData = loadAccountData(updatedUser);
    if (accData) {
      setPitchers(accData.pitchers);
      setSelectedPitcherId(accData.user.id);
    } else {
      // Create a pitcher record for the new user if not found
      const newPitcher: Pitcher = {
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
        currentAcwr: 1.15,
        avatarUrl: updatedUser.avatarUrl || '',
        email: updatedUser.email,
      };
      setPitchers([newPitcher]);
      setSelectedPitcherId(updatedUser.id);
    }
    
    setShowOnboarding(false);
    setOnboardingUser(null);
    setActiveTab('dashboard');
  };
"""

content = content.replace("  const handleOpenAuth = (mode: 'login' | 'signup') => {", onboarding_func + "\n  const handleOpenAuth = (mode: 'login' | 'signup') => {")

with open('src/App.tsx', 'w') as f:
    f.write(content)

