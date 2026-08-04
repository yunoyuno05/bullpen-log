import glob
import re

files = glob.glob("src/components/*.tsx")
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if pt-24 pb-16 ... space-y-8 exists
    if 'max-w-5xl mx-auto' in content and 'space-y-8' in content:
        content = content.replace('space-y-8', 'space-y-5')
        # Also reduce pt-24 pb-16 to pt-20 pb-12
        content = content.replace('pt-24 pb-16', 'pt-20 pb-12')
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
