import sys

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

if "id: 'settings'" not in content:
    content = content.replace(
        "{ id: 'support', label: '고객지원', icon: Headset, desc: '1:1 문의 및 FAQ' }",
        "{ id: 'support', label: '고객지원', icon: Headset, desc: '1:1 문의 및 FAQ' },\n    { id: 'settings', label: '설정', icon: User, desc: '앱 설정 및 프로필 변경' }"
    )

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

