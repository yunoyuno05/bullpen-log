import sys

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  Save\n} from \'lucide-react\';',
    '  Save,\n  MessageCircle,\n  Headset,\n  ShieldAlert\n} from \'lucide-react\';'
)

content = content.replace(
    "    { id: 'logs', label: '피칭 일지 데이터', icon: FileText, desc: '구질별 상세 기록 & 불펜 히스토리' },\n  ];",
    "    { id: 'logs', label: '피칭 일지 데이터', icon: FileText, desc: '구질별 상세 기록 & 불펜 히스토리' },\n    { id: 'community', label: '커뮤니티', icon: MessageCircle, desc: '선수/코치 간 정보 공유' },\n    { id: 'support', label: '고객지원', icon: Headset, desc: '1:1 문의 및 FAQ' },\n    { id: 'admin', label: '관리자', icon: ShieldAlert, desc: '시스템 관리 패널' }\n  ];"
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

