import os
import re

files = ["src/components/Dashboard.tsx", "src/components/UserProfileModal.tsx", "src/components/TrainingCalendar.tsx", "src/components/PitchLogsTable.tsx", "src/components/VideoArchive.tsx"]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the component definition
    # usually `export const Name: React.FC<Props> = ({ ... }) => {` or `export const Name = ({ ... }) => {`
    # We can search for `=> {`
    
    # We'll just look for `export const [A-Za-z0-9_]+:?.*=>\s*\{`
    match = re.search(r'(export const [A-Za-z0-9_]+.*=>\s*\{)', content)
    if match and "useUnits();" not in content:
        insert_pos = match.end()
        new_content = content[:insert_pos] + "\n  const { formatSpeed, formatWeight, speedUnit, weightUnit } = useUnits();" + content[insert_pos:]
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")
        
