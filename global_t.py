import re
import glob

files = glob.glob("src/components/*.tsx")
files.append("src/App.tsx")

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # if there's any {t(
    if 't(' in content and 'import { t }' not in content:
        # Check if i18n is imported
        if 'import i18n from' not in content:
            # We add a global `const t = i18n.t.bind(i18n);` but actually i18n.t is fine
            # Let's import i18n
            if filepath == "src/App.tsx":
                import_stmt = "import i18n from './lib/i18n';\n"
            else:
                import_stmt = "import i18n from '../lib/i18n';\n"
                
            content = import_stmt + content
            
        # Add `const t = i18n.t;` right after imports if it's not there
        # but what about useTranslation shadowing?
        # If the file has `const { t } = useTranslation();`, we can remove it.
        # Actually it's easier to remove `const { t } = useTranslation();` and just use global `t`.
        content = content.replace("const { t } = useTranslation();", "")
        
        # Insert `const t = i18n.t;` after the last import
        lines = content.split('\n')
        last_import = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
                
        lines.insert(last_import + 1, "const t = i18n.t.bind(i18n);")
        
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
            
print("Done")

