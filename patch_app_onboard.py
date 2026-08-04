import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_onboard = """  const handleOnboardingComplete = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setUserToStore(updatedUser);"""

new_onboard = """  const handleOnboardingComplete = async (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    setUserToStore(updatedUser);

    try {
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
      console.log('Profile successfully saved to Supabase');
    } catch (e) {
      console.error('Supabase profile sync note:', e);
    }
"""

content = content.replace(old_onboard, new_onboard)

with open('src/App.tsx', 'w') as f:
    f.write(content)
