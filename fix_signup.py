with open('src/components/AuthModal.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'supabase.auth.signUp(' in line:
        # The next line is likely email: ...
        for j in range(i+1, i+5):
            if 'email: signupEmail.trim(),' in lines[j]:
                lines[j] = lines[j].rstrip() + ' password: signupPassword,\n'
                break
        break

with open('src/components/AuthModal.tsx', 'w') as f:
    f.writelines(lines)
