import glob

files = glob.glob("src/components/*.tsx")
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if 'max-w-7xl mx-auto' in content:
        content = content.replace('max-w-7xl mx-auto', 'max-w-5xl mx-auto')
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")
