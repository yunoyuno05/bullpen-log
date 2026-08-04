import sys

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""  const navItems = [
    { id: 'dashboard', label: '라이브 대시보드', icon: LayoutDashboard, desc: '선수 종합 통계 & 통합 모니터링' },
    { id: 'calendar', label: '훈련 캘린더', icon: Calendar, desc: '훈련 스케줄 계획, 과거 피칭/웨이트 기록' },
    { id: 'acwr', label: '부하 지수 (ACWR) 분석', icon: TrendingUp, desc: '7일/28일 과부하 및 부상 위험 경보' },
    { id: 'rom', label: '가동범위 (ROM) & GIRD', icon: Dumbbell, desc: '관절 가동성 및 통증 히트맵' },
    { id: 'video', label: '메커니즘 영상 아카이브', icon: Video, desc: 'Split-Screen 폼 비교 분석' },
    { id: 'ai-report', label: 'AI 맞춤 케어 리포트', icon: Sparkles, desc: 'AI 불펜 코치 주간 리포트 & 맞춤 코칭', isAi: true },
    { id: 'logs', label: '피칭 일지 데이터', icon: FileText, desc: '구질별 상세 기록 & 불펜 히스토리' },
    { id: 'community', label: '커뮤니티', icon: MessageCircle, desc: '선수/코치 간 정보 공유' },
    { id: 'support', label: '고객지원', icon: Headset, desc: '1:1 문의 및 FAQ' },
    { id: 'admin', label: '관리자', icon: ShieldAlert, desc: '시스템 관리 패널' }
  ];""",
"""  let navItems = [
    { id: 'dashboard', label: '라이브 대시보드', icon: LayoutDashboard, desc: '선수 종합 통계 & 통합 모니터링' },
    { id: 'calendar', label: '훈련 캘린더', icon: Calendar, desc: '훈련 스케줄 계획, 과거 피칭/웨이트 기록' },
    { id: 'acwr', label: '부하 지수 (ACWR) 분석', icon: TrendingUp, desc: '7일/28일 과부하 및 부상 위험 경보' },
    { id: 'rom', label: '가동범위 (ROM) & GIRD', icon: Dumbbell, desc: '관절 가동성 및 통증 히트맵' },
    { id: 'video', label: '메커니즘 영상 아카이브', icon: Video, desc: 'Split-Screen 폼 비교 분석' },
    { id: 'ai-report', label: 'AI 맞춤 케어 리포트', icon: Sparkles, desc: 'AI 불펜 코치 주간 리포트 & 맞춤 코칭', isAi: true },
    { id: 'logs', label: '피칭 일지 데이터', icon: FileText, desc: '구질별 상세 기록 & 불펜 히스토리' },
    { id: 'community', label: '커뮤니티', icon: MessageCircle, desc: '선수/코치 간 정보 공유' },
    { id: 'support', label: '고객지원', icon: Headset, desc: '1:1 문의 및 FAQ' }
  ];

  if (currentUser?.isAdmin) {
    navItems.push({ id: 'admin', label: '관리자', icon: ShieldAlert, desc: '시스템 관리 패널' });
  }"""
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

