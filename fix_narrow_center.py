import re

files_to_update = {
    'src/components/SettingsTab.tsx': ('max-w-xl', 'max-w-3xl'),
    'src/components/CommunityForum.tsx': ('max-w-5xl', 'max-w-3xl'),
    'src/components/SupportTicket.tsx': ('max-w-4xl', 'max-w-3xl')
}

for filepath, (old, new) in files_to_update.items():
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(f'{old} mx-auto', f'{new} mx-auto')
    with open(filepath, 'w') as f:
        f.write(content)

