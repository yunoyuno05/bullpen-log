import re

with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

# We know the block starts at 421: "// Background sync with Supabase"
start_idx = content.find('// Background sync with Supabase')
end_idx = content.find('} catch (sbErr)', start_idx)
if start_idx != -1 and end_idx != -1:
    old_block = content[start_idx:end_idx]
    
    new_block = """// Background sync with Supabase
    try {
      const { data: sbData, error: sbError } = await supabase.auth.updateUser({
        password: signupPassword.trim(),
        data: {
          name: userData.name,
          number: userData.number,
          team: userData.team,
          throwingArm: userData.throwingArm,
          role: userData.role,
          height: userData.height,
          weight: userData.weight,
          wingspan: userData.wingspan,
          maxVelocity: userData.maxVelocity,
          assessment: assessmentData,
        }
      });
      if (sbError) {
        console.error('Supabase update error:', sbError);
      }
    """
    
    content = content[:start_idx] + new_block + content[end_idx:]

with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)
