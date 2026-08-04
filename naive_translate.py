import glob
import re
import json

files = glob.glob("src/components/*.tsx")
files.append("src/App.tsx")
files.append("src/components/Navbar.tsx")

translations = {
    "대시보드": "Dashboard", "캘린더": "Calendar", "투구 로그": "Pitch Log", "가동성": "Mobility", 
    "커뮤니티": "Community", "고객지원": "Support", "관리자": "Admin", "회원가입": "Sign Up", 
    "로그인": "Login", "로그아웃 (Sign Out)": "Logout", "설정": "Settings",
    "앱 환경 설정": "App Settings", "구속 단위": "Velocity Unit", "투구 속도 (km/h vs mph)": "Pitch Speed (km/h vs mph)",
    "무게 단위": "Weight Unit", "선수 체중 및 웨이트 (kg vs lbs)": "Player Weight (kg vs lbs)",
    "푸시 알림": "Push Notifications", "훈련 일정 및 분석 완료 알림": "Training & Analysis Notifications",
    "사운드 효과": "Sound Effects", "앱 내 상호작용 사운드": "App Interaction Sounds",
    "영상 자동 재생": "Auto-play Videos", "피칭 영상 열기 시 자동 재생": "Auto-play when opening videos",
    "햅틱 피드백": "Haptic Feedback", "버튼 터치 시 진동 효과": "Vibrate on button touch",
    "고화질 영상 업로드": "High Quality Upload", "업로드 시 원본 화질 유지": "Keep original quality on upload",
    "데이터 절약 모드": "Data Saver Mode", "모바일 데이터 시 저해상도 재생": "Low res playback on mobile data",
    "앱 테마": "App Theme", "언어 설정": "Language", "모든 환경 설정 저장": "Save All Settings", 
    "저장 완료": "Saved", "저장 중...": "Saving...",
    "프로필 및 계정 설정": "Profile & Account", "프로필 관리": "Manage Profile", "회원 탈퇴 (Delete)": "Delete Account",
    "내 문의 내역": "My Tickets", "새 문의하기": "New Ticket", "고객 지원": "Support",
    "메인 캘린더": "Main Calendar", "투구 영상 저장": "Save Pitch Video", "주간 일정 목록": "Weekly Schedule", 
    "게임로그 시퀀스": "Game Log Sequence", "목표 로드맵": "Goal Roadmap",
    "일정 추가": "Add Schedule", "기록 입력": "Log Entry", "피칭 분석 리포트": "Pitching Analysis", 
    "최근 피칭 세션 요약": "Recent Sessions", "투구 메카닉": "Mechanics",
    "부상 위험도 (ACWR)": "Injury Risk (ACWR)", "어깨 외회전": "Shoulder ER", "어깨 내회전": "Shoulder IR", 
    "고관절": "Hip ROM", "구속 변화 추이": "Velocity Trend", "누적 투구수": "Total Pitches",
    "한국어": "Korean", "English": "English", "日本語": "Japanese"
}

ko_dict = {k: k for k in translations.keys()}
en_dict = {k: v for k, v in translations.items()}

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    modified = False
    
    # We want to replace >TEXT< with >{t('TEXT')}<
    # Also string attributes like placeholder="TEXT" -> placeholder={t('TEXT')}
    # But only if it has not been replaced yet.
    
    for ko in translations.keys():
        if f'>{ko}<' in content:
            content = content.replace(f'>{ko}<', f'>{{t(\'{ko}\')}}<')
            modified = True
            
    if modified:
        if 'useTranslation' not in content:
            content = "import { useTranslation } from 'react-i18next';\n" + content
        
        # Now we need to insert `const { t } = useTranslation();` inside the component
        # This is tricky without AST. Let's try to find `const ComponentName = ... => {`
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if re.match(r'export const [A-Za-z0-9_]+: React\.FC.*=> {', line) or \
               re.match(r'const [A-Za-z0-9_]+ = \(.*\) => {', line) or \
               re.match(r'export function [A-Za-z0-9_]+\(.*\) {', line) or \
               re.match(r'export default function [A-Za-z0-9_]+\(.*\) {', line):
                
                # Check if it's already there
                if 'useTranslation' not in lines[i+1]:
                    lines.insert(i+1, "  const { t } = useTranslation();")
                break
        
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
        print(f"Updated {filepath}")

# Update i18n.ts
with open('src/lib/i18n.ts', 'r') as f:
    i18n_content = f.read()

# Replace translation objects
new_i18n_content = f"""import i18n from 'i18next';
import {{ initReactI18next }} from 'react-i18next';

const resources = {{
  ko: {{
    translation: {json.dumps(ko_dict, ensure_ascii=False, indent=6)}
  }},
  en: {{
    translation: {json.dumps(en_dict, ensure_ascii=False, indent=6)}
  }},
  ja: {{
    translation: {{}}
  }}
}};

i18n
  .use(initReactI18next)
  .init({{
    resources,
    lng: "ko", // Default language
    fallbackLng: "ko",
    interpolation: {{
      escapeValue: false
    }}
  }});

export default i18n;
"""

with open('src/lib/i18n.ts', 'w') as f:
    f.write(new_i18n_content)

