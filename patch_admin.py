import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""          id: user.id || parsed.user?.id || 'usr_' + Date.now(),
          email: user.email,
        };""",
"""          id: user.id || parsed.user?.id || 'usr_' + Date.now(),
          email: user.email,
          isAdmin: user.email === 'cheatpt@gmail.com' || parsed.user?.isAdmin,
        };"""
)

content = content.replace(
"""  const accountData = {
    user,""",
"""  if (user.email === 'cheatpt@gmail.com') {
    user.isAdmin = true;
  }
  const accountData = {
    user,"""
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

