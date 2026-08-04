import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Fix handleOnboardingComplete to throw error if Supabase fails
old_onboard = """      await supabase.from('profiles').upsert({
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
      console.log('Profile successfully saved to Supabase');"""

new_onboard = """      const { error } = await supabase.from('profiles').upsert({
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
      if (error) throw error;
      console.log('Profile successfully saved to Supabase');"""

content = content.replace(old_onboard, new_onboard)

with open('src/App.tsx', 'w') as f:
    f.write(content)

