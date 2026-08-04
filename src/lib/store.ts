import { create } from 'zustand';
import { ThemeType, LanguageType, SubscriptionTier, UserAccount } from '../types';
import i18n from './i18n';

interface AppState {
  theme: ThemeType;
  language: LanguageType;
  subscription: SubscriptionTier;
  isAdmin: boolean;
  user: UserAccount | null;
  setTheme: (theme: ThemeType) => void;
  setLanguage: (lang: LanguageType) => void;
  setSubscription: (tier: SubscriptionTier) => void;
  setUser: (user: UserAccount | null) => void;
}

const getInitialUser = (): UserAccount | null => {
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
  user: initialUser,
  setTheme: (theme) => {
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'baseball-classic', 'high-contrast');
    root.classList.add(theme);
    set({ theme });
  },
  setLanguage: (lang) => {
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
  setSubscription: (tier) => set({ subscription: tier }),
  setUser: (user) => set({ 
    user, 
    isAdmin: user?.isAdmin || false, 
    subscription: user?.subscriptionTier || 'FREE',
    theme: user?.themePref || 'light',
    language: user?.langPref || 'ko'
  })
}));
