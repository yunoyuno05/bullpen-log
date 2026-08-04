import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
imports_to_add = """
import { CommunityForum } from './components/CommunityForum';
import { SupportTicket } from './components/SupportTicket';
import { SettingsTab } from './components/SettingsTab';
"""
content = content.replace("import { AdminPanel } from './components/AdminPanel';", "import { AdminPanel } from './components/AdminPanel';\n" + imports_to_add)

# 2. Add handleOnboardingComplete
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
      const newPitcher = {
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

if 'const handleOnboardingComplete =' not in content:
    content = content.replace("  const handleLoginSuccess = (user: UserAccount, isNewUser?: boolean) => {", onboarding_func + "\n  const handleLoginSuccess = (user: UserAccount, isNewUser?: boolean) => {")

with open('src/App.tsx', 'w') as f:
    f.write(content)

