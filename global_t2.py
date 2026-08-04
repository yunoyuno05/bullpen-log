import re
import glob

files = glob.glob("src/components/*.tsx")
files.append("src/App.tsx")

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    if "const t = i18n.t" not in content and 't(' in content:
        # Let's import i18n
        if 'import i18n from' not in content:
            if filepath == "src/App.tsx":
                import_stmt = "import i18n from './lib/i18n';\n"
            else:
                import_stmt = "import i18n from '../lib/i18n';\n"
            content = import_stmt + content
            
        lines = content.split('\n')
        last_import = 0
        for i, line in enumerate(lines):
            if line.startswith('import '):
                last_import = i
                
        lines.insert(last_import + 1, "const t = i18n.t.bind(i18n);")
        
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
        print(f"Fixed {filepath}")
