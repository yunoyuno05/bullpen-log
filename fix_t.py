import glob
import re

files = [
    "src/App.tsx",
    "src/components/AuthModal.tsx",
    "src/components/CalendarVideoTab.tsx",
    "src/components/HeroLanding.tsx",
    "src/components/Navbar.tsx",
    "src/components/ROMTracker.tsx",
    "src/components/TrainingCalendar.tsx"
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # If already has const { t }, skip or handle
    if 'const { t } = useTranslation();' not in content:
        # Let's find the main component declaration
        # export const Navbar = ({ ... }) => {
        # export function TrainingCalendar(props) {
        # function App() {
        
        # Split and insert
        lines = content.split('\n')
        for i, line in enumerate(lines):
            # very rough match for main component signature
            if ('export function' in line or 'export const' in line or 'function App' in line) and '=>' in line or '{' in line:
                # Need to be careful. Let's just find the first "return (" or similar and put it before that.
                pass
                
        # Better heuristic: find first return statement that returns JSX: `return (` or `return <`
        for i, line in enumerate(lines):
            if line.strip().startswith('return (') or line.strip().startswith('return <'):
                # find the first function declaration before this return? 
                # Actually, just insert it at the first line of the outermost function.
                pass
                
        # Let's use regex to find `export const COMPONENT_NAME = (...) => {`
        # and insert right after
        for i, line in enumerate(lines):
            if re.match(r'^(export )?(default )?(const|function) [A-Z][a-zA-Z0-9_]*(\s*=\s*\(.*?\)\s*=>\s*\{|\s*\(.*?\)\s*\{)', line):
                lines.insert(i+1, "  const { t } = useTranslation();")
                break
        else:
            # fallback for App
            for i, line in enumerate(lines):
                if line.startswith('function App() {') or line.startswith('const App = () => {'):
                    lines.insert(i+1, "  const { t } = useTranslation();")
                    break

        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
        print(f"Fixed {filepath}")

