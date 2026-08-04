import os
import re

files = ["src/components/Dashboard.tsx", "src/components/UserProfileModal.tsx", "src/components/TrainingCalendar.tsx", "src/components/PitchLogsTable.tsx", "src/components/VideoArchive.tsx"]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # If it already has useUnits() we don't need to add it, but wait, it failed in lint.
    if "const { formatSpeed" not in content:
        # We can find `}) => {` or `) => {` which is the start of the component body
        match = re.search(r'\)\s*=>\s*\{', content)
        if match:
            insert_pos = match.end()
            new_content = content[:insert_pos] + "\n  const { formatSpeed, formatWeight, speedUnit, weightUnit } = useUnits();\n" + content[insert_pos:]
            with open(filepath, 'w') as f:
                f.write(new_content)
            print(f"Fixed {filepath}")
            
