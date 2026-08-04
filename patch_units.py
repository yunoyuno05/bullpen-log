import os
import re

def patch_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r') as f:
        content = f.read()

    # If already patched, skip
    if 'useUnits' in content:
        return

    # Add import
    import_stmt = "import { useUnits } from '../lib/units';\n"
    if 'import i18n from' in content:
        content = content.replace("import i18n from", import_stmt + "import i18n from")
    else:
        # just put it after last import
        pass

    # Add hook inside the component
    # We'll just regex for `const [.*] = useState` or `const { .* } = useAppStore()`
    if 'useAppStore()' in content:
        content = content.replace("useAppStore();", "useAppStore();\n  const { formatSpeed, formatWeight, speedUnit, weightUnit } = useUnits();")
    
    # Replace some obvious km/h displays
    # {pitcher.maxVelocity} km/h -> {formatSpeed(pitcher.maxVelocity)}
    content = re.sub(r'\{([A-Za-z0-9_\.\?\!]+)\}\s*km/h', r'{formatSpeed(\1)}', content)
    content = re.sub(r'([0-9]+)\s*km/h', r'{formatSpeed(\1)}', content)
    
    with open(filepath, 'w') as f:
        f.write(content)

for p in ["src/components/Dashboard.tsx", "src/components/UserProfileModal.tsx", "src/components/TrainingCalendar.tsx", "src/components/PitchLogsTable.tsx", "src/components/VideoArchive.tsx"]:
    patch_file(p)

print("Patched units in common files")
