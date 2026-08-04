import re

files_to_update = {
    'src/components/CommunityForum.tsx': ('className="pt-24 pb-16 px-4 md:px-8 max-w-4xl mx-auto', 'className="pt-24 pb-16 px-4 md:px-8 max-w-xl mx-auto'),
    'src/components/SupportTicket.tsx': ('className="pt-24 pb-16 px-4 md:px-8 max-w-3xl mx-auto', 'className="pt-24 pb-16 px-4 md:px-8 max-w-xl mx-auto'),
    'src/components/TrainingCalendar.tsx': ('className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto', 'className="pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto'),
    'src/components/Dashboard.tsx': ('className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto', 'className="pt-24 pb-16 px-4 md:px-8 max-w-5xl mx-auto')
}

for filepath, (old_str, new_str) in files_to_update.items():
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        content = content.replace(old_str, new_str)
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
    except Exception as e:
        print(f"Failed {filepath}: {e}")

