import re

with open('src/components/SettingsTab.tsx', 'r') as f:
    content = f.read()

reload_code = """
    setTimeout(() => {
      setIsSavingSettings(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        window.location.reload();
      }, 500);
    }, 600);
"""

content = re.sub(
    r"setTimeout\(\(\) => \{\n\s*setIsSavingSettings\(false\);\n\s*setSaveSuccess\(true\);\n\s*setTimeout\(\(\) => setSaveSuccess\(false\), 3000\);\n\s*\}, 600\);",
    reload_code.strip(),
    content
)

with open('src/components/SettingsTab.tsx', 'w') as f:
    f.write(content)
print("Reload patched")
