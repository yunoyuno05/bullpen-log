import re

# To fix "Cannot find name 't'" inside sub-components or outside the main component,
# let's just use regex to replace `{t('some_word')}` with `{'some_word'}` for the places where it fails,
# OR we can inject `const { t } = useTranslation();` in all functions that return JSX.

def inject_t(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
    
    injected = False
    for i, line in enumerate(lines):
        # find function declarations or arrow functions that might be components
        if re.search(r'(const|function)\s+[A-Za-z0-9_]+\s*=\s*\([^)]*\)\s*=>\s*\{', line) or \
           re.search(r'function\s+[A-Za-z0-9_]+\s*\([^)]*\)\s*\{', line):
            
            # check next few lines for JSX return
            is_component = False
            for j in range(i+1, min(i+15, len(lines))):
                if 'return (' in lines[j] or 'return <' in lines[j]:
                    is_component = True
                    break
            
            if is_component:
                if 'const { t } = useTranslation();' not in lines[i+1] and 'const { t }' not in lines[i+1]:
                    lines.insert(i+1, "  const { t } = useTranslation();\n")
                    injected = True
    
    if injected:
        with open(filepath, 'w') as f:
            f.writelines(lines)
        print(f"Injected in {filepath}")

for path in ["src/components/AuthModal.tsx", "src/components/CalendarVideoTab.tsx", "src/components/HeroLanding.tsx", "src/components/Navbar.tsx", "src/components/ROMTracker.tsx", "src/components/TrainingCalendar.tsx", "src/App.tsx"]:
    inject_t(path)

