import os
import re

def patch_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # Replace some obvious kg displays
    content = re.sub(r'\{([A-Za-z0-9_\.\?\!]+)\}\s*kg', r'{formatWeight(\1)}', content)
    content = re.sub(r'([0-9]+)\s*kg', r'{formatWeight(\1)}', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for p in ["src/components/Dashboard.tsx", "src/components/UserProfileModal.tsx", "src/components/TrainingCalendar.tsx", "src/components/PitchLogsTable.tsx", "src/components/VideoArchive.tsx"]:
    patch_file(p)

print("Patched units kg")
