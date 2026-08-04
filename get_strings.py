import glob
import re

files = glob.glob("src/components/*.tsx")
files.append("src/App.tsx")
files.append("src/components/Navbar.tsx")

all_korean = set()

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Extract text containing Korean from JSX elements >...< 
    matches = re.findall(r'>([^<]*[\uac00-\ud7a3]+[^<]*)<', content)
    for m in matches:
        all_korean.add(m.strip())
        
    # Extract from attributes containing Korean e.g. placeholder="...", label="..."
    matches2 = re.findall(r'="(.*[\uac00-\ud7a3]+.*)"', content)
    for m in matches2:
        all_korean.add(m.strip())
        
    matches3 = re.findall(r"'(.*[\uac00-\ud7a3]+.*)'", content)
    for m in matches3:
        all_korean.add(m.strip())

for s in sorted(list(all_korean)):
    print(s)

