import re

with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

# Change space-y-2.5 to a 2-column grid
content = content.replace(
    '<div className="space-y-2.5">',
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">'
)

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)

