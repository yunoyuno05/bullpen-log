import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ko: {
    translation: {
      "Bullpen Log": "불펜 로그",
      "Login": "로그인",
      "Sign Up": "회원가입",
      "Dashboard": "대시보드",
      "Settings": "설정",
      "Admin": "관리자",
      "Community": "커뮤니티",
      "Support": "고객센터",
      // Add more translation strings as needed
    }
  },
  en: {
    translation: {
      "Bullpen Log": "Bullpen Log",
      "Login": "Login",
      "Sign Up": "Sign Up",
      "Dashboard": "Dashboard",
      "Settings": "Settings",
      "Admin": "Admin",
      "Community": "Community",
      "Support": "Support",
    }
  },
  ja: {
    translation: {
      "Bullpen Log": "ブルペンログ",
      "Login": "ログイン",
      "Sign Up": "サインアップ",
      "Dashboard": "ダッシュボード",
      "Settings": "設定",
      "Admin": "管理者",
      "Community": "コミュニティ",
      "Support": "サポート",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko", // Default language
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
