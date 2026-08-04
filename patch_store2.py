import re

with open('/app/applet/src/lib/store.ts', 'r') as f:
    content = f.read()

# Make sure setUser updates speedUnit and weightUnit
old_set_user = """  setUser: (user) => set({ 
    user, 
    isAdmin: user?.isAdmin || false, 
    subscription: user?.subscriptionTier || 'FREE',
    theme: user?.themePref || 'light',
    language: user?.langPref || 'ko'
  })"""

new_set_user = """  setUser: (user) => {
    if (user?.langPref) i18n.changeLanguage(user.langPref);
    set({ 
      user, 
      isAdmin: user?.isAdmin || false, 
      subscription: user?.subscriptionTier || 'FREE',
      theme: user?.themePref || 'light',
      language: user?.langPref || 'ko',
      speedUnit: user?.speedUnit || 'kmh',
      weightUnit: user?.weightUnit || 'kg'
    });
  }"""

if old_set_user in content:
    content = content.replace(old_set_user, new_set_user)
    with open('/app/applet/src/lib/store.ts', 'w') as f:
        f.write(content)
    print("store patched again.")
else:
    print("Could not find old_set_user!")
