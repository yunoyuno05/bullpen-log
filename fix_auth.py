with open('src/components/AuthModal.tsx', 'r') as f:
    content = f.read()

old_str = """      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
              });"""
new_str = """      const { data, error } = await supabase.auth.signUp({
        email: signupEmail.trim(),
        password: signupPassword,
      });"""

content = content.replace(old_str, new_str)
with open('src/components/AuthModal.tsx', 'w') as f:
    f.write(content)

