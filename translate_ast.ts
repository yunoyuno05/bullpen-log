import { Project, SyntaxKind, JsxText, StringLiteral } from 'ts-morph';
import * as fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths("src/components/*.tsx");
project.addSourceFilesAtPaths("src/App.tsx");

const translations: Record<string, string> = {
    "대시보드": "Dashboard", "캘린더": "Calendar", "투구 로그": "Pitch Log", "가동성": "Mobility", 
    "커뮤니티": "Community", "고객지원": "Support", "관리자": "Admin", "회원가입": "Sign Up", 
    "로그인": "Login", "로그아웃": "Logout", "설정": "Settings", "앱 환경 설정": "App Settings",
    "구속 단위": "Velocity Unit", "무게 단위": "Weight Unit", "푸시 알림": "Push Notifications",
    "사운드 효과": "Sound Effects", "영상 자동 재생": "Auto-play Videos", "햅틱 피드백": "Haptic Feedback",
    "고화질 영상 업로드": "High Quality Upload", "데이터 절약 모드": "Data Saver Mode",
    "앱 테마": "App Theme", "언어 설정": "Language", "모든 환경 설정 저장": "Save All Settings", 
    "저장 완료": "Saved", "저장 중...": "Saving...", "프로필 및 계정 설정": "Profile & Account",
    "프로필 관리": "Manage Profile", "회원 탈퇴": "Delete Account", "내 문의 내역": "My Tickets",
    "새 문의하기": "New Ticket", "고객 지원": "Support", "메인 캘린더": "Main Calendar",
    "투구 영상 저장": "Save Pitch Video", "주간 일정 목록": "Weekly Schedule", 
    "게임로그 시퀀스": "Game Log Sequence", "목표 로드맵": "Goal Roadmap",
    "일정 추가": "Add Schedule", "기록 입력": "Log Entry", "피칭 분석 리포트": "Pitching Analysis", 
    "최근 피칭 세션 요약": "Recent Sessions", "투구 메카닉": "Mechanics",
    "부상 위험도 (ACWR)": "Injury Risk (ACWR)", "어깨 외회전": "Shoulder ER", "어깨 내회전": "Shoulder IR", 
    "고관절": "Hip ROM", "구속 변화 추이": "Velocity Trend", "누적 투구수": "Total Pitches",
    "한국어": "Korean", "English": "English", "日本語": "Japanese"
};

const tKeys = new Set<string>();

project.getSourceFiles().forEach(sourceFile => {
    let modified = false;

    // Check if useTranslation is imported, if not, we can import it
    let hasUseTranslation = sourceFile.getImportDeclaration(decl => decl.getModuleSpecifierValue() === "react-i18next") !== undefined;

    // Find all JSX text nodes
    sourceFile.getDescendantsOfKind(SyntaxKind.JsxText).forEach(jsxText => {
        const text = jsxText.getLiteralText().trim();
        for (const [ko, en] of Object.entries(translations)) {
            if (text === ko) {
                jsxText.replaceWithText(`{t('${ko}')}`);
                tKeys.add(ko);
                modified = true;
                break;
            }
        }
    });

    // Find all String Literals in JSX attributes or general
    sourceFile.getDescendantsOfKind(SyntaxKind.StringLiteral).forEach(strLit => {
        const text = strLit.getLiteralValue().trim();
        for (const [ko, en] of Object.entries(translations)) {
            if (text === ko && strLit.getParentIfKind(SyntaxKind.JsxAttribute)) {
                strLit.replaceWithText(`{t('${ko}')}`);
                tKeys.add(ko);
                modified = true;
                break;
            }
        }
    });

    if (modified) {
        // Import useTranslation if not present
        if (!hasUseTranslation) {
            sourceFile.addImportDeclaration({
                namedImports: ["useTranslation"],
                moduleSpecifier: "react-i18next"
            });
        }
        
        // Find the main component function and add const { t } = useTranslation();
        // This is a simplistic approach and might need refinement
        const functions = sourceFile.getFunctions();
        const arrowFuncs = sourceFile.getVariableDeclarations().filter(v => v.getInitializerIfKind(SyntaxKind.ArrowFunction));
        
        const target = functions[0] || (arrowFuncs[0] ? arrowFuncs[0].getInitializerIfKind(SyntaxKind.ArrowFunction) : null);
        
        if (target) {
            const body = target.getBody();
            if (body && body.getKind() === SyntaxKind.Block) {
                const block = body.asKindOrThrow(SyntaxKind.Block);
                if (!block.getText().includes('useTranslation()')) {
                    block.insertStatements(0, 'const { t } = useTranslation();');
                }
            }
        }

        sourceFile.saveSync();
        console.log(`Updated ${sourceFile.getBaseName()}`);
    }
});

fs.writeFileSync('extracted_keys.json', JSON.stringify(Array.from(tKeys), null, 2));

