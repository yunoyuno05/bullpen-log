import glob
import re

files = glob.glob("src/components/*.tsx")
files.append("src/App.tsx")

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if 'const t = i18n.t.bind(i18n);' in content:
        # Remove it from everywhere
        content = content.replace('const t = i18n.t.bind(i18n);\n', '')
        content = content.replace('const t = i18n.t.bind(i18n);', '')
        
        # Now find the LAST `import ` statement and its ending `;` or just add it at the very top of the file!
        # Adding it right after `import i18n from '../lib/i18n';` is much safer.
        # But wait, `import` must be at the top level.
        # So we can just find the end of all imports and place it.
        # Or even easier, place it right before the first `const ` or `export ` or `interface ` or `type `.
        lines = content.split('\n')
        
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.startswith('interface ') or line.startswith('type ') or line.startswith('const ') or line.startswith('export ') or line.startswith('let '):
                insert_idx = i
                break
                
        lines.insert(insert_idx, "\nconst t = i18n.t.bind(i18n);\n")
        
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
        print(f"Fixed syntax {filepath}")

