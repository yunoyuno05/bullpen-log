import sys

with open('src/lib/store.ts', 'r') as f:
    content = f.read()

init_user_code = """const getInitialUser = (): UserAccount | null => {
  try {
    const saved = localStorage.getItem('bullpen_user_account');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.email) {
        if (parsed.email === 'cheatpt@gmail.com') {
          parsed.isAdmin = true;
        }
        return parsed;
      }
    }
  } catch (e) {}
  return null;
};

const initialUser = getInitialUser();

export const useAppStore = create<AppState>((set) => ({
  theme: initialUser?.themePref || 'light',
  language: initialUser?.langPref || 'ko',
  subscription: initialUser?.subscriptionTier || 'FREE',
  isAdmin: initialUser?.isAdmin || false,
  user: initialUser,"""

content = content.replace("export const useAppStore = create<AppState>((set) => ({\n  theme: 'light',\n  language: 'ko',\n  subscription: 'FREE',\n  isAdmin: false,\n  user: null,", init_user_code)

with open('src/lib/store.ts', 'w') as f:
    f.write(content)

